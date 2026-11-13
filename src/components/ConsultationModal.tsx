/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { ArrowRight, Check, CheckCircle2, Copy, ShieldCheck, X } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { createEnquiry } from '../lib/firestoreService';

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTreatment?: string;
}

function tomorrowLocalDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

const fieldClass =
  'w-full min-h-13 rounded-lg border bg-[#171412] px-4 py-3.5 text-[16px] leading-normal text-[#F6F0E9] placeholder:text-[#80746A] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C9A47F]/30';

const labelClass = 'mb-2 block text-[12px] font-semibold tracking-wide text-[#EADFD3]';

export const ConsultationModal: React.FC<ConsultationModalProps> = ({
  isOpen,
  onClose,
  initialTreatment,
}) => {
  const reduceMotion = useReducedMotion();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [concern, setConcern] = useState(initialTreatment || '');
  const [preferredDate, setPreferredDate] = useState('');
  const [additionalMessage, setAdditionalMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [bookingRef, setBookingRef] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialTreatment && isOpen && !submitted) setConcern(initialTreatment);
  }, [initialTreatment, isOpen, submitted]);

  // Never show a previous patient's success screen or details on reopening.
  useEffect(() => {
    if (isOpen) return;
    setFullName('');
    setPhone('');
    setConcern(initialTreatment || '');
    setPreferredDate('');
    setAdditionalMessage('');
    setErrors({});
    setSubmitError(null);
    setSubmitted(false);
    setBookingRef('');
    setCopied(false);
  }, [isOpen, initialTreatment]);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) onClose();
    };
    document.addEventListener('keydown', onEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onEscape);
    };
  }, [isOpen, isSubmitting, onClose]);

  const resetForm = () => {
    setFullName('');
    setPhone('');
    setConcern(initialTreatment || '');
    setPreferredDate('');
    setAdditionalMessage('');
    setErrors({});
    setSubmitError(null);
    setSubmitted(false);
    setBookingRef('');
    setCopied(false);
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (fullName.trim().length < 2) next.fullName = 'Please enter your full name.';
    if (!/^[+\d()\s.\-]{7,30}$/.test(phone.trim()) || phone.replace(/\D/g, '').length < 7) {
      next.phone = 'Please enter a valid phone number.';
    }
    if (!concern.trim()) next.concern = 'Please enter the treatment or reason for your visit.';
    if (preferredDate && preferredDate < tomorrowLocalDate()) {
      next.preferredDate = 'Please choose a future date.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting || !validate()) return;
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const result = await createEnquiry({
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: '',
        treatmentInterest: concern.trim(),
        consultationType: 'in-person',
        preferredDate,
        preferredTime: '',
        additionalMessage: additionalMessage.trim(),
      });
      setBookingRef(result.referenceCode);
      setSubmitted(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Unable to submit your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyRef = async () => {
    if (!bookingRef) return;
    try {
      await navigator.clipboard.writeText(bookingRef);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reduceMotion ? undefined : { opacity: 0 }}
      className="fixed inset-0 z-50 flex items-stretch justify-center overflow-hidden bg-black/85 backdrop-blur-sm sm:items-center sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="consultation-modal-title"
      onClick={() => { if (!isSubmitting) onClose(); }}
    >
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduceMotion ? undefined : { opacity: 0, y: 18 }}
        transition={{ duration: reduceMotion ? 0 : 0.24 }}
        className="relative flex h-[100dvh] w-full min-w-0 max-w-[580px] flex-col overflow-hidden border border-[#C9A47F]/30 bg-[#201C19] text-[#F6F0E9] shadow-[0_30px_90px_rgba(0,0,0,0.65)] sm:h-auto sm:max-h-[calc(100dvh-2.5rem)] sm:rounded-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="relative shrink-0 border-b border-[#C9A47F]/15 bg-[#161310] px-5 pb-5 pt-[max(1.3rem,env(safe-area-inset-top))] sm:px-9 sm:pb-6 sm:pt-7">
          <div className="pr-12">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C9A47F]">
              Dr. Samik Sharma · Mohali
            </p>
            <h2 id="consultation-modal-title" className="mt-2 font-serif text-[32px] font-normal leading-tight text-[#F9F2EB] sm:text-[38px]">
              Request an Appointment
            </h2>
            <p className="mt-2 text-[12px] leading-relaxed text-[#B8AEA3] sm:text-[13px]">
              Fill in a few details. Our team will contact you to arrange a suitable time.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close consultation form"
            onClick={onClose}
            disabled={isSubmitting}
            className="absolute right-4 top-4 flex size-11 items-center justify-center rounded-full border border-[#C9A47F]/25 text-[#F6F0E9] transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-[#C9A47F] disabled:opacity-50 sm:right-6 sm:top-6"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-9 sm:py-7">
          {submitted ? (
            <div className="py-5 text-center">
              <div className="mx-auto flex size-16 items-center justify-center rounded-full border border-[#C9A47F]/40 bg-[#C9A47F]/10">
                <CheckCircle2 aria-hidden="true" className="size-8 text-[#D6B18D]" />
              </div>
              <h3 className="mt-5 font-serif text-3xl text-[#F6F0E9]">Request Received</h3>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-[1.8] text-[#C4B8AD]">
                Thank you, {fullName}. We received your request. Our coordinator will call <strong className="text-[#F6F0E9]">{phone}</strong> to discuss availability. An appointment is not yet confirmed.
              </p>

              <div className="mx-auto mt-6 max-w-sm rounded-lg border border-[#C9A47F]/25 bg-[#161310] p-4 text-left">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[#C9A47F]">Your reference number</p>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <span className="min-w-0 break-all font-mono text-sm font-semibold text-[#F6F0E9]">{bookingRef}</span>
                  <button
                    type="button"
                    onClick={handleCopyRef}
                    aria-label="Copy reference number"
                    className="flex size-10 shrink-0 items-center justify-center rounded-md border border-[#C9A47F]/25 text-[#C9A47F] hover:bg-white/10"
                  >
                    {copied ? <Check aria-hidden="true" className="size-4" /> : <Copy aria-hidden="true" className="size-4" />}
                  </button>
                </div>
                <p className="mt-3 text-xs text-[#BDB2A5]">{concern}</p>
                {preferredDate && <p className="mt-1 text-xs text-[#BDB2A5]">Preferred date: {preferredDate}</p>}
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={resetForm}
                  className="min-h-12 flex-1 rounded-lg border border-[#C9A47F]/30 px-5 py-3 text-sm text-[#E6C5A5] hover:border-[#C9A47F]"
                >
                  New Request
                </button>
                <button
                  type="button"
                  onClick={() => { resetForm(); onClose(); }}
                  className="min-h-12 flex-1 rounded-lg bg-[#C9A47F] px-5 py-3 text-sm font-semibold text-[#18120E] hover:bg-[#E0C3A5]"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-4 sm:space-y-5">
              <div>
                <label htmlFor="consult-name" className={labelClass}>Full Name <span className="text-[#C9A47F]">*</span></label>
                <input
                  id="consult-name"
                  type="text"
                  autoComplete="name"
                  required
                  maxLength={100}
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => { setFullName(e.target.value); setErrors((prev) => ({ ...prev, fullName: '' })); }}
                  aria-invalid={Boolean(errors.fullName)}
                  aria-describedby={errors.fullName ? 'consult-name-error' : undefined}
                  className={fieldClass + ' ' + (errors.fullName ? 'border-rose-500' : 'border-[#C9A47F]/25')}
                />
                {errors.fullName && <p id="consult-name-error" className="mt-1.5 text-xs text-rose-300">{errors.fullName}</p>}
              </div>

              <div>
                <label htmlFor="consult-phone" className={labelClass}>Phone Number <span className="text-[#C9A47F]">*</span></label>
                <input
                  id="consult-phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  required
                  maxLength={30}
                  placeholder="e.g. +91 98765 43210"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setErrors((prev) => ({ ...prev, phone: '' })); }}
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby={errors.phone ? 'consult-phone-error' : undefined}
                  className={fieldClass + ' ' + (errors.phone ? 'border-rose-500' : 'border-[#C9A47F]/25')}
                />
                {errors.phone && <p id="consult-phone-error" className="mt-1.5 text-xs text-rose-300">{errors.phone}</p>}
              </div>

              <div>
                <label htmlFor="consult-concern" className={labelClass}>Treatment or Concern <span className="text-[#C9A47F]">*</span></label>
                <input
                  id="consult-concern"
                  type="text"
                  required
                  maxLength={100}
                  placeholder="e.g. Rhinoplasty, scar treatment, consultation"
                  value={concern}
                  onChange={(e) => { setConcern(e.target.value); setErrors((prev) => ({ ...prev, concern: '' })); }}
                  aria-invalid={Boolean(errors.concern)}
                  aria-describedby={errors.concern ? 'consult-concern-error' : undefined}
                  className={fieldClass + ' ' + (errors.concern ? 'border-rose-500' : 'border-[#C9A47F]/25')}
                />
                {errors.concern && <p id="consult-concern-error" className="mt-1.5 text-xs text-rose-300">{errors.concern}</p>}
              </div>

              <div>
                <label htmlFor="consult-date" className={labelClass}>Preferred Date <span className="font-normal text-[#9C8B7D]">(optional)</span></label>
                <input
                  id="consult-date"
                  type="date"
                  min={tomorrowLocalDate()}
                  value={preferredDate}
                  onChange={(e) => { setPreferredDate(e.target.value); setErrors((prev) => ({ ...prev, preferredDate: '' })); }}
                  aria-invalid={Boolean(errors.preferredDate)}
                  aria-describedby={errors.preferredDate ? 'consult-date-error' : undefined}
                  className={fieldClass + ' ' + (errors.preferredDate ? 'border-rose-500' : 'border-[#C9A47F]/25')}
                />
                {errors.preferredDate && <p id="consult-date-error" className="mt-1.5 text-xs text-rose-300">{errors.preferredDate}</p>}
              </div>

              <div>
                <label htmlFor="consult-message" className={labelClass}>Additional Message <span className="font-normal text-[#9C8B7D]">(optional)</span></label>
                <textarea
                  id="consult-message"
                  rows={3}
                  maxLength={300}
                  placeholder="e.g. Please call after 4 PM"
                  value={additionalMessage}
                  onChange={(e) => setAdditionalMessage(e.target.value)}
                  className={fieldClass + ' min-h-24 resize-y border-[#C9A47F]/25'}
                />
                <p className="mt-1.5 text-[11px] leading-relaxed text-[#9F9285]">
                  For appointment preferences only. Please do not enter medical history or sensitive health details.
                </p>
              </div>

              {submitError && (
                <p role="alert" className="rounded-lg border border-rose-500/40 bg-rose-950/30 px-4 py-3 text-sm leading-relaxed text-rose-200">
                  {submitError}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="group flex min-h-13 w-full items-center justify-center gap-3 rounded-lg bg-[#C9A47F] px-5 py-4 text-[14px] font-bold text-[#16110E] shadow-[0_10px_26px_rgba(201,164,127,0.12)] transition-colors hover:bg-[#E0C3A5] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C9A47F] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Submitting Request…' : 'Request Appointment'}
                {!isSubmitting && <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-1" />}
              </button>
              <p className="flex items-start justify-center gap-2 text-center text-[11px] leading-[1.6] text-[#A99D91]">
                <ShieldCheck aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-[#C9A47F]" />
                Your request is private. Our team will contact you to confirm availability.
              </p>
            </form>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
