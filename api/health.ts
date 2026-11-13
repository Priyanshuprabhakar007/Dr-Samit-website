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
