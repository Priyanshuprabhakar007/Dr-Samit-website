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




/**
 * Public readiness probe: no patient data, credentials, database IDs, or
 * stack traces are returned. Its status codes identify which setup stage
 * requires attention without pretending that appointment saves work.
 */
export default {
  async fetch(request: Request) {
    const headers = { 'Cache-Control': 'no-store' };
    if (request.method !== 'GET') {
      return Response.json({ error: 'Method not allowed' }, { status: 405, headers });
    }
    const service = 'Dr. Samik Sharma website API';
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      return Response.json({ service, status: 'configuration-required', reason: 'firebase-credentials-missing' }, { status: 503, headers });
    }
    if (!process.env.ENQUIRY_RATE_LIMIT_SECRET ||
        process.env.ENQUIRY_RATE_LIMIT_SECRET.length < 32) {
      return Response.json({ service, status: 'configuration-required', reason: 'rate-limit-secret-missing' }, { status: 503, headers });
    }
    try {
      const { db } = await getClinicAdmin();
      await db.collection('settings').doc('current').get();
      return Response.json({ service, status: 'ready' }, { headers });
    } catch (error) {
      console.error('Clinic API health check failed:', error instanceof Error ? error.name : 'Unknown error');
      return Response.json({ service, status: 'configuration-required', reason: 'firebase-connection-failed' }, {
        status: 503, headers,
      });
    }
  },
};
