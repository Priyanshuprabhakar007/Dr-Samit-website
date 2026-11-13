/**
 * Self-contained Firebase Admin bootstrap: Vercel's TypeScript function build
 * must not load sibling project source files through unresolved ESM imports.
 * Project/database identifiers are public Firebase configuration, not secrets.
 */
import { cert, getApp, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const FIREBASE_PROJECT_ID = "gen-lang-client-0746984388";
const FIRESTORE_DATABASE_ID = "ai-studio-drsamiksharmapla-23e071f8-1aa1-4fe5-9fd3-47be90b3af23";

function getClinicAdmin() {
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
