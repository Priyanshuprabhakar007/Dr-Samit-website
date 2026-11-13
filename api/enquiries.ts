import { createHmac, randomUUID } from 'node:crypto';
import { getClinicAdmin } from '../src/server/vercelFirebase.js';
import { validateEnquiry } from '../src/server/enquiryValidation.js';

function json(data: object, status: number) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
}

class RateLimitError extends Error {}

/** Persistent, hashed rate limits shared by all Vercel function instances. */
async function checkRateLimit(
  db: ReturnType<typeof getClinicAdmin>['db'],
  ip: string,
  phone: string,
) {
  const secret = process.env.ENQUIRY_RATE_LIMIT_SECRET;
  if (!secret || secret.length < 32) throw new Error('Server-side rate limiting is not configured.');
  const windowId = Math.floor(Date.now() / (10 * 60 * 1000));
  const encode = (key: string) => createHmac('sha256', secret).update(key).digest('hex');
  const keys = [
    { key: encode(`ip:${ip}:${windowId}`), max: 10 },
    { key: encode(`phone:${phone.replace(/\D/g, '')}:${windowId}`), max: 4 },
  ];
  const refs = keys.map(item => db.collection('enquiry_rate_limits').doc(item.key));
  await db.runTransaction(async tx => {
    const snapshots = await Promise.all(refs.map(ref => tx.get(ref)));
    snapshots.forEach((snapshot, i) => {
      if (Number(snapshot.data()?.count || 0) >= keys[i].max) throw new RateLimitError();
    });
    for (let i = 0; i < refs.length; i++) {
      tx.set(refs[i], {
        count: Number(snapshots[i].data()?.count || 0) + 1,
        expiresAt: new Date((windowId + 2) * 10 * 60 * 1000),
      });
    }
  });
}

export default {
  async fetch(request: Request) {
    if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

    try {
      // Refuse oversized requests before parsing; never collect clinical history.
      const body = await request.text();
      if (body.length > 16_384) return json({ error: 'Form data is too large.' }, 413);
      let payload: unknown;
      try { payload = JSON.parse(body); }
      catch { return json({ error: 'Invalid form data.' }, 400); }

      let enquiry;
      try { enquiry = validateEnquiry(payload); }
      catch (err) {
        return json({ error: err instanceof Error ? err.message : 'Invalid fields.' }, 400);
      }

      const { db } = getClinicAdmin();
      // In Vercel the forwarding header is set by the platform; direct
      // callers cannot bypass the per-email limit by changing IP headers.
      const ip = request.headers.get('x-vercel-forwarded-for') ||
        request.headers.get('x-forwarded-for') || 'unknown';
      await checkRateLimit(db, ip.split(',')[0].trim(), enquiry.phone);

      const referenceCode = `SS-${randomUUID().slice(0, 12).toUpperCase()}`;
      const now = new Date().toISOString();
      const created = await db.collection('enquiries').add({
        ...enquiry, procedure: enquiry.treatmentInterest,
        referenceCode, status: 'new', createdAt: now, updatedAt: now,
      });

      return json({
        success: true, id: created.id, referenceCode, status: 'new',
        message: 'Your consultation request was received for review. Your appointment is not yet confirmed.',
      }, 201);
    } catch (error) {
      if (error instanceof RateLimitError) {
        return json({ error: 'Too many requests. Please try again later.' }, 429);
      }
      console.error('Enquiry API failed:', error instanceof Error ? error.message : 'Unknown server error');
      return json({ error: 'Consultation requests are temporarily unavailable. Please contact the clinic directly.' }, 503);
    }
  },
};
