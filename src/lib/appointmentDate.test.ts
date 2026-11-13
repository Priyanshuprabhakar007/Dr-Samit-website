import { describe, expect, test } from 'bun:test';
import { formatIndianDate, formatIndianDateInput, parseIndianDate } from './appointmentDate';

describe('appointment date display', () => {
  test('converts DD/MM/YYYY for the API without changing the day or month', () => {
    expect(parseIndianDate('25/11/2026')).toBe('2026-11-25');
    expect(parseIndianDate('01/12/2026')).toBe('2026-12-01');
    expect(parseIndianDate('')).toBeNull();
  });

  test('rejects impossible dates and the US month/day ordering', () => {
    expect(parseIndianDate('31/02/2027')).toBeNull();
    expect(parseIndianDate('29/02/2027')).toBeNull();
    expect(parseIndianDate('29/02/2028')).toBe('2028-02-29');
    expect(parseIndianDate('11/25/2026')).toBeNull();
    expect(parseIndianDate('2026-11-25')).toBeNull();
  });

  test('displays Firestore dates in the Indian format', () => {
    expect(formatIndianDate('2026-11-25')).toBe('25/11/2026');
    expect(formatIndianDate('2026-02-30')).toBe('');
    expect(formatIndianDate('')).toBe('');
  });

  test('adds separators when dates are typed or pasted', () => {
    expect(formatIndianDateInput('25112026')).toBe('25/11/2026');
    expect(formatIndianDateInput('25/11/2026')).toBe('25/11/2026');
    expect(formatIndianDateInput('2511')).toBe('25/11');
    expect(formatIndianDateInput('25')).toBe('25');
  });
});
