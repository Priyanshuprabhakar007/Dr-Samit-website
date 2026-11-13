import { describe, expect, test } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

/**
 * Vercel transpiles the /api TypeScript functions separately from Vite.
 * Node ESM does not resolve imports without file extensions at runtime.
 */
const ROOT = process.cwd();
const API_FILES = [
  'api/enquiries.ts',
  'api/health.ts',
  'api/auth/verify-admin.ts',
  'api/admin/set-role.ts',
] as const;

describe('Vercel Node ESM imports', () => {
  for (const path of API_FILES) {
    test(`${path} uses resolvable .js specifiers for local TypeScript files`, () => {
      const source = readFileSync(resolve(ROOT, path), 'utf8');
      const imports = [...source.matchAll(/\bfrom\s+['"](\.{1,2}\/[^'"]+)['"]/g)];

      expect(imports.length).toBeGreaterThan(0);
      for (const [, specifier] of imports) {
        expect(specifier.endsWith('.js')).toBe(true);
        const typescriptSource = resolve(ROOT, dirname(path), specifier.replace(/\.js$/, '.ts'));
        expect(existsSync(typescriptSource)).toBe(true);
      }
    });
  }

  test('Firebase JSON import has its required ESM import attribute', () => {
    const source = readFileSync(resolve(ROOT, 'src/server/vercelFirebase.ts'), 'utf8');
    expect(source).toContain(
      "import firebaseConfig from '../../firebase-applet-config.json' with { type: 'json' };"
    );
  });
});
