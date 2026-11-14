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


const OWNER_EMAIL = 'dilseinvite@gmail.com';
function getBearerToken(request: Request): string | null {
  return request.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1] || null;
}



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
