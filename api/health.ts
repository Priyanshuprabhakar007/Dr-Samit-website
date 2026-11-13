import { getClinicAdmin } from '../src/server/vercelFirebase.js';

/** Server-side readiness: verifies configured secrets and a Firestore read. */
export default {
  async fetch(request: Request) {
    if (request.method !== 'GET') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }
    try {
      if (!process.env.ENQUIRY_RATE_LIMIT_SECRET ||
          process.env.ENQUIRY_RATE_LIMIT_SECRET.length < 32) {
        throw new Error('Enquiry rate limiting is not configured.');
      }
      const { db } = getClinicAdmin();
      await db.collection('settings').doc('current').get();
      return Response.json({ service: 'Dr. Samik Sharma website API', status: 'ready' }, {
        headers: { 'Cache-Control': 'no-store' },
      });
    } catch {
      return Response.json({ service: 'Dr. Samik Sharma website API', status: 'configuration-required' }, {
        status: 503, headers: { 'Cache-Control': 'no-store' },
      });
    }
  },
};
