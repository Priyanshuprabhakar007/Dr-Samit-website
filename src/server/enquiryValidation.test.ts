import { describe, expect, test } from 'bun:test';
import { validateEnquiry } from './enquiryValidation';

const good = {
  fullName: 'Asha Sharma',
  phone: '+91 98765 43210',
  email: 'asha@example.com',
  treatmentInterest: 'Rhinoplasty',
  consultationType: 'in-person' as const,
  preferredDate: '2026-11-18',
  preferredTime: '11:00 AM',
};

describe('consultation intake validation', () => {
  test('normalizes valid fields without copying clinical history', () => {
    const result = validateEnquiry({
      ...good,
      additionalMessage: '  Please call after 4 pm  ',
      clinicalNotes: 'do not persist',
    });
    expect(result.fullName).toBe('Asha Sharma');
    expect(result.email).toBe('asha@example.com');
    expect(result.additionalMessage).toBe('Please call after 4 pm');
    expect('clinicalNotes' in result).toBe(false);
  });

  test('accepts the simple phone-first form without email, date, or time', () => {
    const result = validateEnquiry({
      fullName: 'Asha Sharma',
      phone: '+91 98765 43210',
      treatmentInterest: 'General aesthetic consultation',
      consultationType: 'in-person',
      preferredDate: '',
      preferredTime: '',
    });
    expect(result.email).toBe('');
    expect(result.preferredDate).toBe('');
    expect(result.preferredTime).toBe('To be arranged');
    expect(result.additionalMessage).toBe('');
  });

  test('rejects invalid phone, optional email, and missing concern', () => {
    expect(() => validateEnquiry({ ...good, phone: 'abc123' })).toThrow();
    expect(() => validateEnquiry({ ...good, email: 'bad' })).toThrow();
    expect(() => validateEnquiry({ ...good, treatmentInterest: '' })).toThrow();
  });

  test('rejects impossible dates but permits skipping the date', () => {
    expect(() => validateEnquiry({ ...good, preferredDate: '2026-02-30' })).toThrow();
    expect(validateEnquiry({ ...good, preferredDate: '' }).preferredDate).toBe('');
  });

  test('keeps optional messages short and only accepts text', () => {
    expect(() => validateEnquiry({ ...good, additionalMessage: 'x'.repeat(301) })).toThrow();
    expect(() => validateEnquiry({ ...good, additionalMessage: { history: true } })).toThrow();
  });

  test('rejects missing or invalid consultation type', () => {
    expect(() => validateEnquiry({ ...good, consultationType: 'offline' })).toThrow();
    const { consultationType: _discard, ...withoutType } = good;
    expect(() => validateEnquiry(withoutType)).toThrow();
  });
});
