/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CLINIC_INFO } from '../data/surgeryData';
import { DoctorPortraitPlaceholder } from './DoctorPortraitPlaceholder';
import { ArrowRight, Building2, Award } from 'lucide-react';
import { motion } from 'motion/react';
import { HomepageData } from '../lib/firestoreService';

interface AboutSectionProps {
  onOpenBooking: () => void;
  data?: HomepageData['aboutPreview'];
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onOpenBooking, data }) => {
  return (
    <section id="about" className="py-24 sm:py-32 bg-[#0B0B0B] relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute inset-0 luxury-noise opacity-30 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-3xl mx-auto mb-16 sm:mb-20"
        >
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="w-8 h-[1px] bg-[#C9A47F]" />
            <span className="text-[11px] font-sans tracking-[0.28em] text-[#C9A47F] uppercase font-semibold">
              SURGICAL MASTERY &amp; ARTISTRY
            </span>
            <span className="w-8 h-[1px] bg-[#C9A47F]" />
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-[3.4rem] font-serif font-normal text-[#F6F0E9] tracking-[-0.04em] leading-[1.13]">
            The Surgeon &amp; Credentials
          </h2>
          <div className="w-12 h-[1px] bg-[#C9A47F]/40 mx-auto mt-5" />
        </motion.div>

        {/* 3-Column Editorial Strip matching reference */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Column 1: Approved Doctor Portrait Placeholder (Left - 4 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-4 flex flex-col justify-between"
          >
            {/* Dedicated Luxury Container for Doctor Samik Sharma's Photo */}
            {data?.portraitImage && data.portraitImage !== '/samik-portrait.jpg' ? (
              <div className="relative aspect-[3/4] w-full overflow-hidden border border-[#C9A47F]/30 bg-[#1A1716] shadow-2xl group">
                <img
                  src={data.portraitImage}
                  alt={data?.doctorName || 'Dr. Samik Sharma'}
                  className="w-full h-full object-cover object-top filter grayscale contrast-[108%]"
                  onError={(e) => {
                    // Fallback to placeholder if custom image fails
                    (e.target as any).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B] via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-4 left-4 right-4 p-3 bg-[#0B0B0B]/90 border-t border-[#C9A47F]/40 text-center">
                  <p className="text-xs font-serif text-[#F6F0E9]">{data.doctorName || 'Dr. Samik Sharma'}</p>
                  <p className="text-[10px] text-[#C9A47F] uppercase tracking-wider">Plastic &amp; Aesthetic Surgeon</p>
                </div>
              </div>
            ) : (
              <DoctorPortraitPlaceholder />
            )}

            <p className="text-[11px] text-[#AFA89F] mt-3 font-light text-center lg:text-left italic">
              Dr. Samik Sharma operates exclusively with tertiary clinical protocols at Shalby Hospital, Mohali.
            </p>
          </motion.div>

          {/* Column 2: Doctor Introduction & Credentials (Middle - 5 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="lg:col-span-5 bg-[#1F1B19] border border-[#C9A47F]/25 p-7 sm:p-9 flex flex-col justify-between shadow-xl relative"
          >
            {/* Top gold line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#C9A47F]/40 via-[#C9A47F] to-[#C9A47F]/40" />

            <div>
              <div className="inline-block text-[11px] font-sans tracking-[0.24em] text-[#C9A47F] uppercase font-semibold mb-2">
                SENIOR CONSULTANT
              </div>
              <h3 className="text-2xl sm:text-3xl font-serif text-[#F6F0E9] font-normal mb-1">
                {data?.doctorName || CLINIC_INFO.doctor}
              </h3>
              <p className="text-xs font-sans tracking-wide text-[#C9A47F] uppercase font-medium mb-6">
                {data?.qualificationTitle || CLINIC_INFO.role}
              </p>

              {/* Degrees & Qualifications Box */}
              <div className="py-5 border-y border-[#C9A47F]/20 mb-6 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#C9A47F] mt-1.5 shrink-0" />
                  <p className="text-sm font-sans font-medium text-[#F6F0E9] tracking-wide">
                    {data?.degreesList && data.degreesList.length > 0
                      ? data.degreesList.join(' · ')
                      : CLINIC_INFO.degrees}
                  </p>
                </div>

                {(data?.fellowshipsList && data.fellowshipsList.length > 0
                  ? data.fellowshipsList
                  : CLINIC_INFO.fellowships
                ).map((f, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#C9A47F] mt-1.5 shrink-0" />
                    <p className="text-xs sm:text-[13px] font-sans text-[#AFA89F] leading-snug">
                      {f}
                    </p>
                  </div>
                ))}

                <div className="flex items-start gap-3 pt-2">
                  <Building2 className="w-4 h-4 text-[#C9A47F] shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-[13px] font-sans font-medium text-[#F6F0E9]">
                    {data?.hospitalName || CLINIC_INFO.hospital}
                  </p>
                </div>
              </div>

              {/* Editorial Bio Paragraph */}
              <p className="text-sm text-[#AFA89F] font-light leading-relaxed mb-6 font-sans">
                {data?.previewSummary ||
                  'Trained extensively across premier medical centers in the United Kingdom with specialized fellowships in facial aesthetics and advanced cosmetic surgery, Dr. Samik Sharma approaches aesthetic transformation as an architectural discipline. He prioritizes structural preservation and undetectable rejuvenation.'}
              </p>
            </div>

            <div className="pt-5 border-t border-white/5 flex items-center justify-between">
              <button
                onClick={onOpenBooking}
                type="button"
                className="inline-flex items-center gap-2 text-xs font-sans font-semibold tracking-[0.16em] uppercase text-[#C9A47F] hover:text-[#DFCAAF] group cursor-pointer"
              >
                <span>{data?.buttonLabel || 'Schedule Private Consultation'}</span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1.5 transition-transform" />
              </button>
            </div>
          </motion.div>

          {/* Column 3: Sculptural Architectural Imagery (Right - 3 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="lg:col-span-3 flex flex-col justify-between"
          >
            <div className="relative aspect-[3/4] w-full overflow-hidden border border-[#C9A47F]/30 bg-[#24201E] group shadow-2xl">
              <img
                src={data?.architecturalImage || '/src/assets/images/about_sculptural_marble_1794213536764.jpg'}
                alt="Classical sculptural marble torso and architectural gold arc"
                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B] via-transparent to-transparent opacity-80" />
              
              {/* Philosophical Quote Card */}
              <div className="absolute bottom-4 left-4 right-4 p-4 bg-[#0B0B0B]/90 backdrop-blur-sm border-t border-[#C9A47F]/40">
                <p className="font-serif italic text-sm text-[#F6F0E9] leading-snug">
                  &ldquo;Aesthetic surgery is the harmonious union of human anatomy and classical sculpture.&rdquo;
                </p>
                <p className="text-[10px] font-sans tracking-[0.2em] text-[#C9A47F] uppercase mt-2">
                  TIMELESS SYMMETRY
                </p>
              </div>
            </div>

            <div className="mt-3 p-3.5 border border-[#C9A47F]/20 bg-[#12100F] text-[11px] text-[#AFA89F] font-light">
              <span className="text-[#C9A47F] font-medium">Core Principle:</span> Structural integrity is never compromised for temporary novelty.
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
};
