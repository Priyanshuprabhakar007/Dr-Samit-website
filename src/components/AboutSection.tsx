/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowUpRight, Award, Building2, CheckCircle2 } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { CLINIC_INFO } from '../data/surgeryData';
import { HomepageData } from '../lib/firestoreService';
import { DoctorPortraitPlaceholder } from './DoctorPortraitPlaceholder';

interface AboutSectionProps {
  onOpenBooking: () => void;
  data?: HomepageData['aboutPreview'];
}

const QUALIFICATIONS = ['MBBS', 'MS (General Surgery)', 'DrNB (Plastic Surgery)'];
const FELLOWSHIP_HIGHLIGHTS = CLINIC_INFO.fellowships.slice(0, 2);

export const AboutSection: React.FC<AboutSectionProps> = ({ onOpenBooking, data }) => {
  const prefersReducedMotion = useReducedMotion();
  const portrait = data?.portraitImage && data.portraitImage !== '/samik-portrait.jpg'
    ? data.portraitImage
    : null;

  const reveal = (delay = 0) => ({
    initial: prefersReducedMotion ? false : { opacity: 0, y: 22 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-70px' },
    transition: {
      duration: prefersReducedMotion ? 0 : 0.7,
      delay: prefersReducedMotion ? 0 : delay,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  });

  return (
    <section id="about" aria-labelledby="about-heading" className="relative overflow-hidden bg-[#0B0B0B] py-20 text-[#F6F0E9] sm:py-28 lg:py-32">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_19%_43%,rgba(201,164,127,0.065),transparent_48%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 luxury-noise opacity-20" />

      <div className="relative mx-auto max-w-[1380px] px-5 sm:px-8 lg:px-12 xl:px-16">
        <motion.div {...reveal()} className="mb-11 flex items-center gap-4 sm:mb-14">
          <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#D5AE89]">
            THE PERSON BEHIND THE PRACTICE
          </span>
          <span aria-hidden="true" className="h-px min-w-8 flex-1 bg-gradient-to-r from-[#C9A47F]/50 to-transparent" />
          <span className="font-serif italic text-lg text-[#9D8A77]">01</span>
        </motion.div>

        <div className="grid grid-cols-1 items-center gap-12 sm:gap-14 lg:grid-cols-12 lg:gap-12 xl:gap-20">
          {/* The doctor, not a decorative sculpture, is the focal point. */}
          <motion.div {...reveal(0.1)} className="relative min-w-0 lg:col-span-5">
            <div className="relative max-w-[570px] mx-auto lg:mx-0">
              <div aria-hidden="true" className="absolute -left-3 -top-3 bottom-8 right-4 border border-[#C9A47F]/25 sm:-left-5 sm:-top-5" />
              <div className="relative aspect-[4/5] w-full overflow-hidden border border-[#C9A47F]/35 bg-[#1B1715]">
                {portrait ? (
                  <img
                    src={portrait}
                    alt={data?.doctorName || CLINIC_INFO.doctor}
                    loading="lazy"
                    className="h-full w-full object-cover object-top"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <DoctorPortraitPlaceholder className="!aspect-auto h-full" />
                )}
              </div>

              <div className="relative mt-5 flex items-start justify-between gap-4 border-l-2 border-[#C9A47F] pl-4">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C9A47F]">Consultant Profile</p>
                  <p className="mt-1 text-sm text-[#C7BDB2]">
                    {data?.hospitalName || CLINIC_INFO.hospital}
                  </p>
                </div>
                <span className="hidden shrink-0 font-serif italic text-2xl text-[#8F775F] sm:block">Care &amp; Craft</span>
              </div>
            </div>
          </motion.div>

          {/* Editorial biography with concise, properly separated credentials. */}
          <motion.div {...reveal(0.2)} className="min-w-0 lg:col-span-7 lg:py-5">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="h-px w-9 bg-[#C9A47F]" aria-hidden="true" />
              <p className="text-[10px] font-semibold uppercase leading-relaxed tracking-[0.19em] text-[#D7B18E]">
                SENIOR CONSULTANT · PLASTIC &amp; AESTHETIC SURGERY
              </p>
            </div>

            <h2 id="about-heading" className="mt-5 max-w-[710px] font-serif text-[clamp(2.9rem,8.5vw,4.8rem)] font-normal leading-[1.04] tracking-[-0.045em] text-[#FBF7F2]">
              {data?.doctorName || CLINIC_INFO.doctor}
            </h2>

            <p className="mt-3 text-[13px] font-medium tracking-[0.025em] text-[#D6B18D] sm:text-[15px]">
              {data?.qualificationTitle || CLINIC_INFO.role}
            </p>

            <p className="mt-7 max-w-[650px] text-[14px] leading-[1.9] text-[#BFB6AC] sm:text-base">
              {data?.previewSummary ||
                'Dr. Samik Sharma provides individualized plastic and aesthetic surgical care, with an emphasis on clinical judgment, proportion, and informed patient decisions.'}
            </p>

            <div className="mt-9 flex items-start gap-3 border-y border-[#C9A47F]/20 py-5">
              <Building2 aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#C9A47F]" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9F907F]">Clinical Practice</p>
                <p className="mt-1.5 text-[14px] font-medium text-[#F6F0E9] sm:text-base">
                  {data?.hospitalName || CLINIC_INFO.hospital}
                </p>
                <p className="mt-1 text-xs text-[#9F948A]">Mohali, Punjab</p>
              </div>
            </div>

            <div className="mt-8">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.19em] text-[#C9A47F]">
                Qualifications
              </p>
              <div className="grid grid-cols-1 gap-2 min-[430px]:grid-cols-3 sm:gap-3">
                {QUALIFICATIONS.map((degree) => (
                  <div key={degree} className="flex min-h-16 items-center gap-2.5 border border-[#C9A47F]/25 bg-[#1C1917]/70 px-4 py-3">
                    <CheckCircle2 aria-hidden="true" className="size-4 shrink-0 text-[#C9A47F]" />
                    <span className="text-[12px] font-medium leading-snug text-[#F4EAE0]">{degree}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.19em] text-[#C9A47F]">
                Fellowships &amp; Advanced Training
              </p>
              <div className="grid gap-3 sm:grid-cols-2 sm:gap-5">
                {FELLOWSHIP_HIGHLIGHTS.map((fellowship) => (
                  <div key={fellowship} className="flex items-start gap-3">
                    <Award aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[#C9A47F]" />
                    <p className="text-[13px] leading-[1.6] text-[#BFB6AC]">{fellowship}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-9 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <button
                onClick={onOpenBooking}
                type="button"
                className="group inline-flex min-h-12 w-full items-center justify-center gap-4 bg-[#C9A47F] px-6 py-3.5 text-center text-[11px] font-bold uppercase tracking-[0.1em] text-[#15110E] transition-colors hover:bg-[#E2C5A8] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C9A47F] sm:w-auto"
              >
                {data?.buttonLabel || 'Schedule Private Consultation'}
                <ArrowUpRight aria-hidden="true" className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
