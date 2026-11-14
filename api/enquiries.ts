import { createHmac, randomUUID } from 'node:crypto';


/**
 * Self-contained Firebase Admin bootstrap: Vercel's TypeScript function build
 * must not load sibling project source files through unresolved ESM imports.
 * Project/database identifiers are public Firebase configuration, not secrets.
 */
// Lazy SDK imports let the API return a safe diagnostic response if Firebase fails to load.

const FIREBASE_PROJECT_ID = "gen-lang-client-0746984388";
const FIRESTORE_DATABASE_ID = "ai-studio-drsamiksharmapla-23e071f8-1aa1-4fe5-9fd3-47be90b3af23";

async function getClinicAdmin() {
  const [
    { cert, getApp, getApps, initializeApp },
    { getFirestore },
    { getAuth },
  ] = await Promise.all([
    import('firebase-admin/app'),
    import('firebase-admin/firestore'),
    import('firebase-admin/auth'),
  ]);
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error('Firebase Admin credentials are not configured.');
  const credentials = JSON.parse(raw) as {
    project_id?: string;
    client_email?: string;
    private_key?: string;
  };
  if (
    credentials.project_id !== FIREBASE_PROJECT_ID ||
    !credentials.client_email ||
    !credentials.private_key
  ) {
    throw new Error('Firebase Admin credentials do not match this website project.');
  }
  const appName = 'dr-samik-vercel-api';
  const app = getApps().some(app => app.name === appName)
    ? getApp(appName)
    : initializeApp({
        credential: cert({
          projectId: credentials.project_id,
          clientEmail: credentials.client_email,
          privateKey: credentials.private_key.replace(/\\n/g, '\n'),
        }),
        projectId: FIREBASE_PROJECT_ID,
      }, appName);

  return {
    db: getFirestore(app, FIRESTORE_DATABASE_ID),
    auth: getAuth(app),
  };
}

interface ValidEnquiry {
  fullName: string;
  phone: string;
  /** Optional contact method. Phone alone is sufficient for an appointment request. */
  email: string;
  treatmentInterest: string;
  consultationType: 'in-person' | 'virtual';
  /** Patient preference, not a confirmed appointment date. May be blank. */
  preferredDate: string;
  /** Scheduling is arranged after a coordinator contacts the patient. */
  preferredTime: string;
  /** Optional non-clinical message (e.g. best time to call). */
  additionalMessage: string;
}

/** Allow-list validation of Vercel API requests; keep in sync with the Express server.
 * Do not copy unapproved fields or medical history into Firestore.
 */
function validateEnquiry(payload: unknown): ValidEnquiry {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('Invalid form payload.');
  }
  const data = payload as Record<string, unknown>;
  const fullName = typeof data.fullName === 'string' ? data.fullName.trim() : '';
  const phone = typeof data.phone === 'string' ? data.phone.trim() : '';
  const email = typeof data.email === 'string' ? data.email.trim().toLowerCase() : '';
  const procedure = typeof data.treatmentInterest === 'string'
    ? data.treatmentInterest.trim()
    : typeof data.procedure === 'string' ? data.procedure.trim() : '';
  const chosenDate = typeof data.preferredDate === 'string' ? data.preferredDate.trim() : '';
  const preferredTime = typeof data.preferredTime === 'string' ? data.preferredTime.trim() : '';
  const additionalMessage = typeof data.additionalMessage === 'string' ? data.additionalMessage.trim() : '';

  if (fullName.length < 2 || fullName.length > 100) throw new Error('Enter your full name (2–100 characters).');
  if (!/^[+\d()\s.\-]{7,30}$/.test(phone) || phone.replace(/\D/g, '').length < 7) {
    throw new Error('Enter a valid contact number.');
  }
  if (email && (email.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
    throw new Error('Enter a valid email address.');
  }
  if (!procedure || procedure.length > 100) throw new Error('Enter the procedure or reason for your visit.');
  if (chosenDate) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(chosenDate)) throw new Error('Choose a valid preferred date.');
    const [year, month, day] = chosenDate.split('-').map(Number);
    const parsed = new Date(Date.UTC(year, month - 1, day));
    if (parsed.getUTCFullYear() !== year || parsed.getUTCMonth() + 1 !== month || parsed.getUTCDate() !== day) {
      throw new Error('Choose a valid preferred date.');
    }
  }
  if (preferredTime.length > 30) throw new Error('Invalid preferred time.');
  if (additionalMessage.length > 300 || (data.additionalMessage !== undefined && typeof data.additionalMessage !== 'string')) {
    throw new Error('Keep the optional message under 300 characters.');
  }
  if (data.consultationType !== 'in-person' && data.consultationType !== 'virtual') {
    throw new Error('Select a consultation format.');
  }

  return {
    fullName, phone, email, treatmentInterest: procedure,
    consultationType: data.consultationType,
    preferredDate: chosenDate,
    preferredTime: preferredTime || 'To be arranged',
    additionalMessage,
  };
}

function json(data: object, status: number) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
}

class RateLimitError extends Error {}

/** Persistent, hashed rate limits shared by all Vercel function instances. */
async function checkRateLimit(
  db: Awaited<ReturnType<typeof getClinicAdmin>>['db'],
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

      const { db } = await getClinicAdmin();
      // In Vercel the forwarding header is set by the platform; direct
      // callers cannot bypass the per-phone limit by changing IP headers.
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
