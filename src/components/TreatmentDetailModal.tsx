/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { TreatmentItem } from '../data/surgeryData';
import { X, ArrowRight, Clock, ShieldCheck, Activity, Check } from 'lucide-react';
import { motion } from 'motion/react';

interface TreatmentDetailModalProps {
  treatment: TreatmentItem | null;
  onClose: () => void;
  onBookTreatment: (title: string) => void;
}

export const TreatmentDetailModal: React.FC<TreatmentDetailModalProps> = ({
  treatment,
  onClose,
  onBookTreatment,
}) => {
  useEffect(() => {
    if (!treatment) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onEscape);
    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', onEscape);
    };
  }, [treatment?.id, onClose]);

  if (!treatment) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-stretch sm:items-center justify-center p-0 sm:p-6 bg-black/85 backdrop-blur-md overflow-hidden"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-treatment-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as const }}
        className="relative w-full max-w-3xl min-w-0 h-[100dvh] sm:h-auto sm:max-h-[calc(100dvh-3rem)] flex flex-col bg-[#1C1817] border border-[#C9A47F]/40 shadow-2xl sm:my-4 overflow-hidden text-[#F6F0E9]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 w-11 h-11 bg-[#0B0B0B]/80 hover:bg-[#C9A47F] text-[#F6F0E9] hover:text-[#0B0B0B] border border-[#C9A47F]/40 flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Hero Image Header */}
        <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full shrink-0 bg-[#0B0B0B] overflow-hidden">
          <img
            src={treatment.image}
            alt={treatment.title}
            className="w-full h-full object-cover"
            loading="eager"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1C1817] via-[#1C1817]/40 to-transparent" />
          
          <div className="absolute bottom-4 left-6 right-6">
            <span className="text-[10px] font-sans tracking-[0.22em] text-[#C9A47F] uppercase font-semibold block mb-1">
              {treatment.categoryLabel}
            </span>
            <h2 id="modal-treatment-title" className="text-2xl sm:text-3xl font-serif text-[#F6F0E9] font-light">
              {treatment.title}
            </h2>
            <p className="text-xs text-[#E0C5A8] font-sans font-light mt-1">
              {treatment.tagline}
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-8 space-y-6 flex-1 min-h-0 overflow-y-auto overscroll-contain">
          
          {/* Quick Specifications Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-[#12100F] border border-[#C9A47F]/20 text-xs">
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-[#C9A47F] shrink-0" />
              <div>
                <p className="text-[10px] text-[#AFA89F] uppercase">Procedure Duration</p>
                <p className="text-[#F6F0E9] font-medium">{treatment.duration}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Activity className="w-4 h-4 text-[#C9A47F] shrink-0" />
              <div>
                <p className="text-[10px] text-[#AFA89F] uppercase">Anesthesia</p>
                <p className="text-[#F6F0E9] font-medium">{treatment.anesthesia}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#C9A47F] shrink-0" />
              <div>
                <p className="text-[10px] text-[#AFA89F] uppercase">Facility</p>
                <p className="text-[#F6F0E9] font-medium">Shalby Hospital, Mohali</p>
              </div>
            </div>
          </div>

          {/* Clinical Overview */}
          <div>
            <h3 className="text-sm uppercase tracking-[0.16em] text-[#C9A47F] font-sans font-semibold mb-2">
              Clinical Overview
            </h3>
            <p className="text-sm text-[#AFA89F] font-light leading-relaxed font-sans">
              {treatment.summary}
            </p>
          </div>

          {/* Surgical Approach */}
          <div>
            <h3 className="text-sm uppercase tracking-[0.16em] text-[#C9A47F] font-sans font-semibold mb-2">
              Dr. Sharma&apos;s Surgical Philosophy
            </h3>
            <p className="text-sm text-[#AFA89F] font-light leading-relaxed font-sans">
              {treatment.clinicalApproach}
            </p>
          </div>

          {/* Primary Indications */}
          <div>
            <h3 className="text-sm uppercase tracking-[0.16em] text-[#C9A47F] font-sans font-semibold mb-2">
              Primary Candidacy &amp; Indications
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {treatment.indications.map((ind, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-[#F6F0E9]/90 font-light">
                  <Check className="w-3.5 h-3.5 text-[#C9A47F] mt-0.5 shrink-0" />
                  <span>{ind}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recovery Protocol */}
          <div className="p-4 bg-[#24201E] border border-white/5 text-xs text-[#AFA89F]">
            <span className="text-[#C9A47F] font-medium">Recovery &amp; Downtime: </span>
            {treatment.recovery}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 pb-[max(1rem,env(safe-area-inset-bottom))] bg-[#141110] border-t border-[#C9A47F]/20 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 shrink-0">
          <p className="text-[11px] text-[#AFA89F] font-light text-center sm:text-left">
            In-depth evaluation with Dr. Samik Sharma at Shalby Hospital, Mohali.
          </p>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              type="button"
              className="w-1/2 sm:w-auto px-5 py-3 border border-white/10 text-xs text-[#AFA89F] hover:text-[#F6F0E9] uppercase tracking-wider font-sans cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onBookTreatment(treatment.title);
              }}
              type="button"
              className="w-1/2 sm:w-auto min-w-0 px-3 sm:px-6 py-3 bg-[#C9A47F] text-[#0B0B0B] text-xs font-semibold uppercase tracking-[0.16em] hover:bg-[#DFCAAF] transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="text-center leading-snug">Request Consultation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

