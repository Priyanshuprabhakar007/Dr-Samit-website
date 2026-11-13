import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Vercel compiles /api TypeScript functions separately from the Vite SPA.
 * Relative project source imports caused ERR_MODULE_NOT_FOUND on production.
 * Keep each endpoint self-contained until the server runtime is bundled.
 */
const ROOT = process.cwd();
const API_FILES = [
  'api/enquiries.ts',
  'api/health.ts',
  'api/auth/verify-admin.ts',
  'api/admin/set-role.ts',
] as const;

describe('Vercel serverless function imports', () => {
  for (const path of API_FILES) {
    test(`${path} has no local ESM imports that can crash in production`, () => {
      const source = readFileSync(resolve(ROOT, path), 'utf8');
      const localImports = [...source.matchAll(/\bfrom\s+['"](\.{1,2}\/[^'"]+)['"]/g)];

      expect(localImports).toHaveLength(0);
      expect(source).toContain("from 'firebase-admin/app'");
      expect(source).toContain('function getClinicAdmin()');
      expect(source).toContain('export default {');
      expect(source).toContain('getFirestore(app, FIRESTORE_DATABASE_ID)');
    });
  }

  test('the serverless enquiry validator matches the development backend', () => {
    const apiSource = readFileSync(resolve(ROOT, 'api/enquiries.ts'), 'utf8');
    const sharedSource = readFileSync(resolve(ROOT, 'src/server/enquiryValidation.ts'), 'utf8');

    const validator = (source: string) => {
      const start = source.indexOf('function validateEnquiry(payload: unknown): ValidEnquiry');
      if (start < 0) throw new Error('Validation function not found');
      const functionBody = source.slice(start);
      // The next top-level declaration in the API is function json(...).
      const end = functionBody.indexOf('\nfunction json(');
      return (end < 0 ? functionBody : functionBody.slice(0, end)).trim();
    };

    expect(validator(apiSource)).toBe(validator(sharedSource));
  });
});
