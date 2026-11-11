/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, Video, CheckCircle2, ShieldCheck, Copy, Check } from 'lucide-react';
import { TREATMENTS_DATA, CLINIC_INFO } from '../data/surgeryData';

import { motion } from 'motion/react';

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTreatment?: string;
}

export const ConsultationModal: React.FC<ConsultationModalProps> = ({
  isOpen,
  onClose,
  initialTreatment,
}) => {
  const [selectedTreatment, setSelectedTreatment] = useState(
    initialTreatment || 'Rhinoplasty'
  );
  const [consultType, setConsultType] = useState<'in-person' | 'virtual'>('in-person');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('11:00 AM');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [bookingRef, setBookingRef] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialTreatment) {
      setSelectedTreatment(initialTreatment);
    }
  }, [initialTreatment]);

  // Set default minimum date to tomorrow
  const getTomorrowDateString = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!fullName.trim()) newErrors.fullName = 'Please enter your full name.';
    if (!phone.trim()) {
      newErrors.phone = 'Please provide a valid contact number.';
    } else if (phone.trim().length < 8) {
      newErrors.phone = 'Please provide a complete contact number with country/area code.';
    }
    if (!email.trim()) {
      newErrors.email = 'Please provide an email address for clinical confirmation.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (!preferredDate) {
      newErrors.preferredDate = 'Please select a preferred date for evaluation.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const { createEnquiry } = await import('../lib/firestoreService');
      const result = await createEnquiry({
        fullName,
        email,
        phone,
        treatmentInterest: selectedTreatment,
        consultationType: consultType,
        preferredDate,
        preferredTime,
      });

      setBookingRef(result.referenceCode);
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Unable to submit. Please try again.');
      setSubmitted(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyRef = () => {
    if (bookingRef) {
      navigator.clipboard.writeText(bookingRef);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setFullName('');
    setPhone('');
    setEmail('');
    setSubmitError(null);
    setPreferredDate('');
    setErrors({});
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="consultation-modal-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as const }}
        className="relative w-full max-w-2xl bg-[#1C1817] border border-[#C9A47F]/40 shadow-2xl my-8 overflow-hidden text-[#F6F0E9]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 bg-[#0B0B0B]/80 hover:bg-[#C9A47F] text-[#F6F0E9] hover:text-[#0B0B0B] border border-[#C9A47F]/40 flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="p-6 sm:p-8 bg-[#12100F] border-b border-[#C9A47F]/20">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="w-4 h-[1px] bg-[#C9A47F]" />
            <span className="text-[10px] font-sans tracking-[0.25em] text-[#C9A47F] uppercase font-semibold">
              CONFIDENTIAL INTAKE
            </span>
          </div>
          <h2 id="consultation-modal-title" className="text-2xl sm:text-3xl font-serif text-[#F6F0E9] font-light">
            Book a Consultation
          </h2>
          <p className="text-xs text-[#AFA89F] font-sans mt-1">
            Dr. Samik Sharma · Shalby Hospital, Mohali
          </p>
        </div>

        {/* Modal Content */}
        <div className="p-6 sm:p-8 max-h-[75vh] overflow-y-auto">
          {submitted ? (
            /* Success / Confirmation State */
            <div className="py-6 text-center space-y-6">
              <div className="w-16 h-16 mx-auto rounded-full border border-[#C9A47F] bg-[#24201E] flex items-center justify-center text-[#C9A47F]">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <span className="text-[11px] font-sans tracking-[0.22em] text-[#C9A47F] uppercase font-semibold block mb-1">
                  CONSULTATION REQUEST LOGGED
                </span>
                <h3 className="text-2xl font-serif text-[#F6F0E9]">
                  Thank You, {fullName}
                </h3>
                <p className="text-xs text-[#AFA89F] font-light mt-2 max-w-md mx-auto leading-relaxed">
                  Your consultation request was received for review. Your appointment is not yet confirmed.
                </p>
              </div>

              {/* Reference ID Card */}
              <div className="p-4 bg-[#12100F] border border-[#C9A47F]/30 max-w-md mx-auto text-left space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#AFA89F] font-mono">Reference Code:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[#C9A47F] font-semibold tracking-wider">
                      {bookingRef}
                    </span>
                    <button
                      onClick={handleCopyRef}
                      className="p-1 hover:text-[#C9A47F] text-[#AFA89F] transition-colors"
                      title="Copy reference code"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="text-xs text-[#AFA89F] space-y-1 pt-2 border-t border-white/5">
                  <p><span className="text-[#F6F0E9]">Procedure:</span> {selectedTreatment}</p>
                  <p>
                    <span className="text-[#F6F0E9]">Mode:</span>{' '}
                    {consultType === 'in-person'
                      ? 'In-Person at Shalby Hospital, Sector 71, Mohali'
                      : 'Virtual Video Consultation'}
                  </p>
                  <p><span className="text-[#F6F0E9]">Preferred Slot:</span> {preferredDate} at {preferredTime}</p>
                </div>
              </div>

              <div className="text-[11px] text-[#AFA89F] font-light max-w-md mx-auto">
                Our surgical coordinator will contact you via <strong className="text-[#F6F0E9]">{phone}</strong> and <strong className="text-[#F6F0E9]">{email}</strong> to discuss your requested appointment.
              </div>

              <div className="flex items-center justify-center gap-4 pt-2">
                <button
                  onClick={resetForm}
                  type="button"
                  className="px-5 py-2.5 border border-white/10 text-xs text-[#AFA89F] hover:text-[#F6F0E9] uppercase tracking-wider"
                >
                  New Request
                </button>
                <button
                  onClick={onClose}
                  type="button"
                  className="px-7 py-2.5 bg-[#C9A47F] text-[#0B0B0B] text-xs font-semibold uppercase tracking-wider hover:bg-[#DFCAAF]"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Interactive Booking Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Consultation Format (In-Person vs Virtual) */}
              <div>
                <label className="block text-xs uppercase tracking-[0.14em] text-[#C9A47F] font-sans font-medium mb-2.5">
                  Consultation Format
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setConsultType('in-person')}
                    className={`p-3.5 border text-left flex items-start gap-3 transition-colors cursor-pointer ${
                      consultType === 'in-person'
                        ? 'border-[#C9A47F] bg-[#24201E]'
                        : 'border-white/10 bg-[#12100F] hover:border-white/20'
                    }`}
                  >
                    <MapPin className="w-4 h-4 text-[#C9A47F] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-[#F6F0E9]">In-Person Consultation</p>
                      <p className="text-[11px] text-[#AFA89F] mt-0.5">Shalby Hospital, Mohali</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConsultType('virtual')}
                    className={`p-3.5 border text-left flex items-start gap-3 transition-colors cursor-pointer ${
                      consultType === 'virtual'
                        ? 'border-[#C9A47F] bg-[#24201E]'
                        : 'border-white/10 bg-[#12100F] hover:border-white/20'
                    }`}
                  >
                    <Video className="w-4 h-4 text-[#C9A47F] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-[#F6F0E9]">Virtual Teleconsultation</p>
                      <p className="text-[11px] text-[#AFA89F] mt-0.5">Outstation &amp; International</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Procedure of Interest */}
              <div>
                <label className="block text-xs uppercase tracking-[0.14em] text-[#C9A47F] font-sans font-medium mb-2">
                  Procedure of Interest
                </label>
                <select
                  value={selectedTreatment}
                  onChange={(e) => setSelectedTreatment(e.target.value)}
                  className="w-full bg-[#12100F] border border-[#C9A47F]/30 p-3 text-xs text-[#F6F0E9] focus:outline-none focus:border-[#C9A47F]"
                >
                  {TREATMENTS_DATA.map((t) => (
                    <option key={t.id} value={t.title} className="bg-[#12100F]">
                      {t.title} — {t.tagline}
                    </option>
                  ))}
                  <option value="Comprehensive Aesthetic Assessment" className="bg-[#12100F]">
                    Comprehensive Facial &amp; Body Aesthetic Assessment
                  </option>
                  <option value="Reconstructive Surgery" className="bg-[#12100F]">
                    Plastic &amp; Reconstructive Surgery
                  </option>
                </select>
              </div>

              {/* Preferred Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-[0.14em] text-[#C9A47F] font-sans font-medium mb-2">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    min={getTomorrowDateString()}
                    value={preferredDate}
                    onChange={(e) => {
                      setPreferredDate(e.target.value);
                      if (errors.preferredDate) setErrors({ ...errors, preferredDate: '' });
                    }}
                    className={`w-full bg-[#12100F] border p-3 text-xs text-[#F6F0E9] focus:outline-none focus:border-[#C9A47F] ${
                      errors.preferredDate ? 'border-rose-500' : 'border-[#C9A47F]/30'
                    }`}
                  />
                  {errors.preferredDate && (
                    <p className="text-[11px] text-rose-400 mt-1">{errors.preferredDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-[0.14em] text-[#C9A47F] font-sans font-medium mb-2">
                    Preferred Time Slot
                  </label>
                  <select
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="w-full bg-[#12100F] border border-[#C9A47F]/30 p-3 text-xs text-[#F6F0E9] focus:outline-none focus:border-[#C9A47F]"
                  >
                    <option value="10:30 AM">Morning: 10:30 AM</option>
                    <option value="11:30 AM">Morning: 11:30 AM</option>
                    <option value="12:30 PM">Afternoon: 12:30 PM</option>
                    <option value="02:30 PM">Afternoon: 02:30 PM</option>
                    <option value="03:30 PM">Afternoon: 03:30 PM</option>
                    <option value="04:30 PM">Afternoon: 04:30 PM</option>
                  </select>
                </div>
              </div>

              {/* Patient Personal Details */}
              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs uppercase tracking-[0.14em] text-[#C9A47F] font-sans font-medium mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Eleanor Vance"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errors.fullName) setErrors({ ...errors, fullName: '' });
                    }}
                    className={`w-full bg-[#12100F] border p-3 text-xs text-[#F6F0E9] placeholder-[#7C766F] focus:outline-none focus:border-[#C9A47F] ${
                      errors.fullName ? 'border-rose-500' : 'border-[#C9A47F]/30'
                    }`}
                  />
                  {errors.fullName && (
                    <p className="text-[11px] text-rose-400 mt-1">{errors.fullName}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-[0.14em] text-[#C9A47F] font-sans font-medium mb-1.5">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (errors.phone) setErrors({ ...errors, phone: '' });
                      }}
                      className={`w-full bg-[#12100F] border p-3 text-xs text-[#F6F0E9] placeholder-[#7C766F] focus:outline-none focus:border-[#C9A47F] ${
                        errors.phone ? 'border-rose-500' : 'border-[#C9A47F]/30'
                      }`}
                    />
                    {errors.phone && (
                      <p className="text-[11px] text-rose-400 mt-1">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-[0.14em] text-[#C9A47F] font-sans font-medium mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      placeholder="patient@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors({ ...errors, email: '' });
                      }}
                      className={`w-full bg-[#12100F] border p-3 text-xs text-[#F6F0E9] placeholder-[#7C766F] focus:outline-none focus:border-[#C9A47F] ${
                        errors.email ? 'border-rose-500' : 'border-[#C9A47F]/30'
                      }`}
                    />
                    {errors.email && (
                      <p className="text-[11px] text-rose-400 mt-1">{errors.email}</p>
                    )}
                  </div>
                </div>

              </div>

              {/* Direct Configurable Destination Clarification */}
              <div className="p-3.5 bg-[#141211] border border-[#C9A47F]/20 text-[11px] text-[#AFA89F] flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#C9A47F] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[#F6F0E9] font-medium">Configured Clinic Destination: </span>
                  This is a request, not a confirmed appointment. Please share medical details privately with the clinic.
                </div>
              </div>

              {submitError && <div role="alert" className="p-3 border border-rose-500/40 bg-rose-950/40 text-xs text-rose-200">{submitError}</div>}
              {/* Form Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-3 border border-white/10 text-xs text-[#AFA89F] hover:text-[#F6F0E9] uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3.5 bg-[#C9A47F] text-[#0B0B0B] text-xs font-semibold uppercase tracking-[0.16em] hover:bg-[#DFCAAF] transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Sending Request...' : 'Confirm & Request Slot'}
                </button>
              </div>

            </form>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

