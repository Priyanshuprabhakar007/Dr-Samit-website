# Enquiry security and deployment notes

- Deploy the Express `server.ts` API together with the frontend. A static-only Vite deployment cannot handle `POST /api/enquiries`.
- Configure Firebase Admin credentials server-side for the correct project and database; do not commit private credentials.
- Deploy and verify the updated `firestore.rules`. GitHub changes do not deploy Firebase rules automatically.
- Confirm that a valid enquiry returns HTTP 201 only after an actual Firestore document is persisted.
- Force a Firestore write failure; verify the API responds HTTP 503 and the form displays an error, without a fabricated reference number.
- Verify unauthorized direct Firestore enquiry creation is denied.
- Verify invalid or revoked ID tokens cannot access `/api/auth/verify-admin` or `/api/admin/set-role`, even with forged identity fields.
- Test status updates, private enquiry access, and CSV exports with spreadsheet-formula payloads.
- Current in-memory per-IP rate limiting does not cover multiple replicas. Add durable rate limiting, bot protection, retention policies and a privacy review before accepting real patient enquiries.
