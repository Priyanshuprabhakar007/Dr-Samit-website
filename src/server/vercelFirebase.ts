import { cert, getApp, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import firebaseConfig from '../../firebase-applet-config.json' with { type: 'json' };

/**
 * Server-only Firebase Admin initialization for Vercel Functions.
 * Credentials MUST come from server environment variables and are never
 * bundled into the browser app or stored in the repository.
 */
export function getClinicAdmin() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error('Firebase Admin credentials are not configured.');

  // This is intentionally a strict, server-side configuration check.
  const credentials = JSON.parse(raw) as {
    project_id?: string; client_email?: string; private_key?: string;
  };
  if (
    credentials.project_id !== firebaseConfig.projectId ||
    !credentials.client_email ||
    !credentials.private_key
  ) {
    throw new Error('Firebase service account is invalid or belongs to a different project.');
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
        projectId: firebaseConfig.projectId,
      }, appName);

  return {
    db: getFirestore(app, firebaseConfig.firestoreDatabaseId),
    auth: getAuth(app),
  };
}

export const OWNER_EMAIL = 'dilseinvite@gmail.com';

export function getBearerToken(request: Request): string | null {
  return request.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1] || null;
}
