import { describe, expect, test } from 'bun:test';
import config from '../../vercel.json';

describe('Vercel SPA routing', () => {
  const source = config.rewrites[0].source;
  const pattern = new RegExp('^' + source + '$');

  test('allows the React router to handle ordinary pages and deep links', () => {
    for (const path of ['/', '/treatments', '/treatments/rhinoplasty', '/admin/login']) {
      expect(pattern.test(path)).toBe(true);
    }
  });

  test('never rewrites Vercel API functions to the homepage HTML', () => {
    for (const path of ['/api/health', '/api/enquiries', '/api/auth/verify-admin', '/api/admin/set-role']) {
      expect(pattern.test(path)).toBe(false);
    }
  });
});
