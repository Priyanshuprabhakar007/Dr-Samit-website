/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowRight, MapPin, Calendar, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { HomepageData } from '../lib/firestoreService';

interface FinalCTAProps {
  onOpenBooking: () => void;
  data?: HomepageData['finalCta'];
}

export const FinalCTA: React.FC<FinalCTAProps> = ({ onOpenBooking, data }) => {
  return (
    <section id="contact" className="relative py-28 sm:py-36 overflow-hidden">
      {/* Premium Bronze Silk Photographic Background */}
      <div className="absolute inset-0 z-0">
        <img
          src={data?.backgroundImage || '/src/assets/images/cta_bronze_silk_1794213538249.jpg'}
          alt="Luxury bronze and champagne flowing silk"
          className="w-full h-full object-cover object-center filter brightness-[40%] contrast-[120%]"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
        {/* Dark Scrim Overlays ensuring perfect contrast and readability */}
        <div className="absolute inset-0 bg-[#0B0B0B]/70 backdrop-blur-[1px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B] via-transparent to-[#0B0B0B]/85" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,164,127,0.1)_0%,transparent_65%)] pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Subtle decorative motif */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-3 mb-6"
        >
          <span className="w-10 h-[1px] bg-[#C9A47F]" />
          <span className="text-xs font-sans tracking-[0.3em] text-[#C9A47F] uppercase font-semibold">
            {data?.eyebrow || 'YOUR TRANSFORMATION BEGINS HERE'}
          </span>
          <span className="w-10 h-[1px] bg-[#C9A47F]" />
        </motion.div>

        {/* Oversized Serif Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-serif font-normal text-[#F6F0E9] tracking-[-0.045em] mb-6 leading-[1.1]"
        >
          {data?.headline ? (
            data.headline
          ) : (
            <>
              BOOK A <span className="font-serif italic text-[#C9A47F]">CONSULTATION</span>
            </>
          )}
        </motion.h2>

        {/* Brief Supporting Copy */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-base sm:text-lg text-[#F6F0E9]/85 font-light max-w-2xl mx-auto mb-10 font-sans leading-relaxed"
        >
          {data?.description ||
            'Embark on a discreet, personalized aesthetic journey under the surgical leadership of Dr. Samik Sharma. Confidential consultations hosted in tertiary suites at Shalby Hospital, Mohali or via secure teleconsultation.'}
        </motion.p>

        {/* Highly Visible Primary CTA Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <button
            onClick={onOpenBooking}
            type="button"
            className="w-full sm:w-auto px-10 sm:px-12 py-5 bg-[#C9A47F] text-[#0B0B0B] text-xs font-sans font-bold tracking-[0.2em] uppercase hover:bg-[#DFCAAF] hover:shadow-[0_0_35px_rgba(201,164,127,0.35)] transition-all duration-300 shadow-2xl shadow-[#C9A47F]/20 flex items-center justify-center gap-3.5 group cursor-pointer"
          >
            <span>{data?.ctaLabel || 'Request In-Person or Tele-Consultation'}</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform duration-300" />
          </button>
        </motion.div>

        {/* Contact Strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="pt-8 border-t border-[#C9A47F]/30 max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-[#AFA89F]"
        >
          <div className="flex flex-col items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#C9A47F]" />
            <span className="text-[#F6F0E9] font-medium">Shalby Hospital</span>
            <span>Sector 71, Mohali, Punjab</span>
          </div>

          <div className="flex flex-col items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#C9A47F]" />
            <span className="text-[#F6F0E9] font-medium">Consultation Hours</span>
            <span>Mon – Sat: 10:00 AM – 5:00 PM</span>
          </div>

          <div className="flex flex-col items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#C9A47F]" />
            <span className="text-[#F6F0E9] font-medium">Appointment Protocol</span>
            <span>By Prior Clinical Booking</span>
          </div>
        </motion.div>

      </div>
    </section>
  );
};
