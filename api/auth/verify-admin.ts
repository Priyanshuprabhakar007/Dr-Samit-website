import { getBearerToken, getClinicAdmin, OWNER_EMAIL } from '../../src/server/vercelFirebase.js';

export default {
  async fetch(request: Request) {
    if (request.method !== 'POST') {
      return Response.json({ isAdmin: false, error: 'Method not allowed' }, { status: 405 });
    }
    const token = getBearerToken(request);
    if (!token) {
      return Response.json({ isAdmin: false, error: 'Missing authentication token.' }, { status: 401 });
    }
    try {
      const { auth, db } = getClinicAdmin();
      // Always verify the signed token; body-supplied uid/email is untrusted.
      const decoded = await auth.verifyIdToken(token, true);
      if (decoded.email_verified !== true) {
        return Response.json({ isAdmin: false, error: 'Verified email required.' }, { status: 403 });
      }
      const email = (decoded.email || '').toLowerCase();
      const isOwner = email === OWNER_EMAIL;
      let isAdmin = isOwner || decoded.admin === true;
      if (!isAdmin) {
        const record = await db.collection('admins').doc(decoded.uid).get();
        isAdmin = record.exists && ['admin', 'owner'].includes(record.data()?.role);
      }
      return Response.json({ isAdmin, isOwner, email, uid: decoded.uid }, {
        headers: { 'Cache-Control': 'no-store' },
      });
    } catch (err) {
      console.warn('Admin verification failed:', err instanceof Error ? err.message : 'Unknown error');
      return Response.json({ isAdmin: false, error: 'Authentication failed or server setup is incomplete.' }, {
        status: 401, headers: { 'Cache-Control': 'no-store' },
      });
    }
  },
};
