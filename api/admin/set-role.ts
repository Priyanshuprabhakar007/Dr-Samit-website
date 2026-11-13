import { getBearerToken, getClinicAdmin, OWNER_EMAIL } from '../../src/server/vercelFirebase.js';

export default {
  async fetch(request: Request) {
    if (request.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }
    const token = getBearerToken(request);
    if (!token) return Response.json({ error: 'Unauthorized.' }, { status: 401 });

    try {
      const { db, auth } = getClinicAdmin();
      const caller = await auth.verifyIdToken(token, true);
      const callerEmail = (caller.email || '').toLowerCase();
      if (caller.email_verified !== true || callerEmail !== OWNER_EMAIL) {
        return Response.json({ error: 'Only the verified practice owner may assign administrators.' }, { status: 403 });
      }
      let data: unknown;
      try { data = await request.json(); }
      catch { return Response.json({ error: 'Invalid request body.' }, { status: 400 }); }
      if (!data || typeof data !== 'object' || Array.isArray(data)) {
        return Response.json({ error: 'Invalid request body.' }, { status: 400 });
      }
      const { targetUid, targetEmail, role } = data as Record<string, unknown>;
      if (
        typeof targetUid !== 'string' || !targetUid || targetUid.length > 128 ||
        typeof targetEmail !== 'string' || !targetEmail || targetEmail.length > 100 ||
        (role !== 'admin' && role !== 'owner')
      ) {
        return Response.json({ error: 'Invalid target UID, email or role.' }, { status: 400 });
      }

      const target = await auth.getUser(targetUid);
      if (!target.email || target.email.toLowerCase() !== targetEmail.trim().toLowerCase()) {
        return Response.json({ error: 'Target UID and email do not match.' }, { status: 400 });
      }

      await auth.setCustomUserClaims(targetUid, { ...target.customClaims, admin: true, role });
      await db.collection('admins').doc(targetUid).set({
        uid: targetUid, email: target.email.toLowerCase(), role,
        grantedBy: callerEmail, updatedAt: new Date().toISOString(),
      }, { merge: true });
      await db.collection('audit_logs').add({
        action: 'ASSIGN_ADMIN_ROLE', resource: 'admins', resourceId: targetUid,
        performedBy: callerEmail, details: `Assigned role ${role} to administrator`,
        timestamp: new Date().toISOString(),
      });
      return Response.json({ success: true, message: 'Admin permissions updated.' }, {
        headers: { 'Cache-Control': 'no-store' },
      });
    } catch (err) {
      console.error('Role assignment API error:', err instanceof Error ? err.message : 'Unknown error');
      return Response.json({ error: 'Unable to update administrator permissions.' }, { status: 503 });
    }
  },
};
