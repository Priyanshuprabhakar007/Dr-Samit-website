/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'node:crypto';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import firebaseConfig from './firebase-applet-config.json';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin with the applet's cloud project
const adminApp = !getApps().length
  ? initializeApp({
      projectId: firebaseConfig.projectId,
    })
  : getApps()[0];

const adminDb = getFirestore(adminApp, firebaseConfig.firestoreDatabaseId);
const adminAuth = getAuth(adminApp);

const OWNER_EMAIL = 'dilseinvite@gmail.com';

// In-memory Rate Limiter for consultation enquiry submissions
// Max 5 submissions per 10 minutes per IP
interface RateLimitRecord {
  count: number;
  resetAt: number;
}
const enquiryRateLimitMap = new Map<string, RateLimitRecord>();

function checkEnquiryRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000; // 10 minutes
  const maxRequests = 5;

  const record = enquiryRateLimitMap.get(ip);
  if (!record || now > record.resetAt) {
    enquiryRateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count += 1;
  return true;
}

// Clean up stale rate limit entries every 15 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of enquiryRateLimitMap.entries()) {
    if (now > value.resetAt) {
      enquiryRateLimitMap.delete(key);
    }
  }
}, 15 * 60 * 1000);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.disable('x-powered-by');
  app.use(express.json({ limit: '16kb' }));

  // -------------------------------------------------------------
  // API: Health Check
  // -------------------------------------------------------------
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'Dr. Samik Sharma Practice API',
      firestoreDatabaseId: firebaseConfig.firestoreDatabaseId,
      timestamp: new Date().toISOString(),
    });
  });

  // -------------------------------------------------------------
  // API: Patient Consultation Intake Submission (Server Validated + Rate Limited)
  // -------------------------------------------------------------
  app.post('/api/enquiries', async (req: Request, res: Response): Promise<void> => {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';

    if (!checkEnquiryRateLimit(clientIp)) {
      res.status(429).json({
        error: 'Too many consultation requests from this connection. Please wait 10 minutes before submitting another intake request.',
      });
      return;
    }

    const {
      fullName,
      phone,
      email,
      treatmentInterest,
      procedure,
      consultationType,
      preferredDate,
      preferredTime,
    } = req.body;

    // Strict Server-Side Validations
    if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2 || fullName.trim().length > 100) {
      res.status(400).json({ error: 'Please provide a valid full patient name (2-100 characters).' });
      return;
    }

    if (!phone || typeof phone !== 'string' || phone.trim().length < 7 || phone.trim().length > 30) {
      res.status(400).json({ error: 'Please provide a valid contact phone number with country/area code.' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== 'string' || !emailRegex.test(email.trim()) || email.trim().length > 100) {
      res.status(400).json({ error: 'Please provide a valid email address for clinical correspondence.' });
      return;
    }

    const selectedProcedure = treatmentInterest || procedure || 'Comprehensive Assessment';
    if (typeof selectedProcedure !== 'string' || selectedProcedure.length > 100) {
      res.status(400).json({ error: 'Invalid procedure selection.' });
      return;
    }

    const chosenType = consultationType === 'virtual' ? 'virtual' : 'in-person';
    const chosenDate = typeof preferredDate === 'string' ? preferredDate.trim() : '';
    const chosenTime = typeof preferredTime === 'string' ? preferredTime.trim() : '11:00 AM';

    const referenceCode = `SS-${randomUUID().slice(0, 12).toUpperCase()}`;
    const now = new Date().toISOString();

    const enquiryDoc = {
      referenceCode,
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      procedure: selectedProcedure,
      treatmentInterest: selectedProcedure,
      consultationType: chosenType,
      preferredDate: chosenDate,
      preferredTime: chosenTime,
      status: 'new',
      createdAt: now,
      updatedAt: now,
    };

    try {
      const docRef = await adminDb.collection('enquiries').add(enquiryDoc);

      res.status(201).json({
        success: true,
        referenceCode,
        id: docRef.id,
        status: 'new',
        message:
          'Consultation intake request submitted. This is a preliminary clinical intake for review, not an auto-confirmed appointment. Dr. Samik Sharma’s surgical coordinator will contact you to verify medical suitability and confirm your appointment slot.',
      });
    } catch (err) {
      console.error('Server Firestore error saving enquiry:', err);
      // Never claim a booking was received if the database write failed.
      res.status(503).json({ success: false, error: 'Unable to save your request. Please try again later.' });
    }
  });

  // -------------------------------------------------------------
  // API: Verify Administrator Authorization & Roles
  // -------------------------------------------------------------
  app.post('/api/auth/verify-admin', async (req: Request, res: Response): Promise<void> => {
    const token = req.headers.authorization?.match(/^Bearer\s+(.+)$/)?.[1];
    if (!token) {
      res.status(401).json({ isAdmin: false, error: 'Missing token.' });
      return;
    }
    try {
      const verified = await adminAuth.verifyIdToken(token, true);
      if (verified.email_verified !== true) {
        res.status(403).json({ isAdmin: false, error: 'Verified email required.' });
        return;
      }
      const email = (verified.email || '').toLowerCase();
      const uid = verified.uid;
      const isOwner = email === OWNER_EMAIL.toLowerCase();
      let isAdmin = isOwner || verified.admin === true;
      if (!isAdmin) {
        const record = await adminDb.collection('admins').doc(uid).get();
        const role = record.data()?.role;
        isAdmin = record.exists && (role === 'admin' || role === 'owner');
      }
      res.json({ isAdmin, isOwner, email, uid });
    } catch (error) {
      console.warn('Admin verification failed:', error);
      res.status(401).json({ isAdmin: false, error: 'Invalid authentication token.' });
    }
  });

  // -------------------------------------------------------------
  // API: Server-side Role Assignment (Owner Only)
  // Assigns custom claims and updates /admins/{uid}
  // -------------------------------------------------------------
  app.post('/api/admin/set-role', async (req: Request, res: Response): Promise<void> => {
    const token = req.headers.authorization?.match(/^Bearer\s+(.+)$/)?.[1];
    if (!token) {
      res.status(401).json({ error: 'Missing token.' });
      return;
    }
    try {
      const caller = await adminAuth.verifyIdToken(token, true);
      const callerEmail = (caller.email || '').toLowerCase();
      if (caller.email_verified !== true || callerEmail !== OWNER_EMAIL.toLowerCase()) {
        res.status(403).json({ error: 'Only the verified owner may change roles.' });
        return;
      }
      const { targetUid, targetEmail, role } = req.body;
      if (typeof targetUid !== 'string' || !targetUid ||
          typeof targetEmail !== 'string' || !targetEmail ||
          !['admin', 'owner'].includes(role)) {
        res.status(400).json({ error: 'Invalid target user or role.' });
        return;
      }
      const target = await adminAuth.getUser(targetUid);
      if (!target.email || target.email.toLowerCase() !== targetEmail.trim().toLowerCase()) {
        res.status(400).json({ error: 'Target UID and email do not match.' });
        return;
      }
      await adminAuth.setCustomUserClaims(targetUid, { ...target.customClaims, admin: true, role });
      await adminDb.collection('admins').doc(targetUid).set({
        uid: targetUid, email: target.email.toLowerCase(), role,
        grantedBy: callerEmail, updatedAt: new Date().toISOString(),
      }, { merge: true });
      await adminDb.collection('audit_logs').add({
        action: 'ASSIGN_ADMIN_ROLE', resource: 'admins', resourceId: targetUid,
        performedBy: callerEmail,
        details: `Assigned role '${role}' to ${target.email}`,
        timestamp: new Date().toISOString(),
      });
      res.json({ success: true, message: 'Administrator permissions updated.' });
    } catch (error) {
      console.error('Role assignment failed:', error);
      res.status(500).json({ error: 'Unable to assign administrator permissions.' });
    }
  });

  // -------------------------------------------------------------
  // Vite Middleware (Dev) or Static Serv (Prod)
  // -------------------------------------------------------------
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Dr. Samik Sharma CMS Server] running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
