/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { TREATMENTS_DATA, TreatmentItem } from '../data/surgeryData';
import { ArrowUpRight, ArrowRight, Clock, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { HomepageData } from '../lib/firestoreService';

interface TreatmentsSectionProps {
  onSelectTreatment: (treatment: TreatmentItem) => void;
  onOpenBooking: (treatmentTitle?: string) => void;
  treatments?: TreatmentItem[];
  sectionData?: HomepageData['treatmentsShowcase'];
}

export const TreatmentsSection: React.FC<TreatmentsSectionProps> = ({
  onSelectTreatment,
  onOpenBooking,
  treatments,
  sectionData,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'facial' | 'body' | 'hair'>('all');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const rawList = treatments && treatments.length > 0 ? treatments : TREATMENTS_DATA;
  
  // If featuredSlugs are defined, filter and order by featuredSlugs
  const treatmentList = React.useMemo(() => {
    let list = rawList;
    if (sectionData?.featuredSlugs && sectionData.featuredSlugs.length > 0) {
      const slugSet = new Set(sectionData.featuredSlugs);
      list = rawList.filter((t) => slugSet.has(t.slug || t.id));
      // Apply custom image overrides if present
      if (sectionData.customImages) {
        list = list.map((t) => {
          const customImg = sectionData.customImages?.[t.slug || t.id];
          if (customImg) {
            return { ...t, image: customImg, heroImage: customImg };
          }
          return t;
        });
      }
    }
    return list;
  }, [rawList, sectionData]);

  const filteredTreatments = activeFilter === 'all'
    ? treatmentList
    : treatmentList.filter((t) => t.category === activeFilter);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -360, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 360, behavior: 'smooth' });
    }
  };

  return (
    <section id="treatments" className="py-24 sm:py-32 bg-[#0B0B0B] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header & Editorial Intro */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 sm:mb-16 pb-8 border-b border-[#C9A47F]/20">
          <div>
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="w-8 h-[1px] bg-[#C9A47F]" />
              <span className="text-[11px] font-sans tracking-[0.28em] text-[#C9A47F] uppercase font-semibold">
                {sectionData?.subtitle || 'SURGICAL DISCIPLINES'}
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-light text-[#F6F0E9] tracking-tight">
              {sectionData?.title || 'Clinical Procedures & Contouring'}
            </h2>
          </div>

          <div className="flex flex-col items-start md:items-end gap-4">
            <p className="text-sm text-[#AFA89F] max-w-md font-light leading-relaxed font-sans md:text-right">
              {sectionData?.description ||
                'Tailored surgical interventions designed to restore balance, contour, and structural vitality with discreet, undetectable refinement.'}
            </p>

            {/* Gallery Navigation Arrow Buttons & Link to all treatments */}
            <div className="flex items-center gap-4">
              <Link
                to="/treatments"
                className="text-xs uppercase tracking-widest text-[#C9A47F] hover:text-[#F6F0E9] transition-colors flex items-center gap-1.5 font-medium"
              >
                <span>View Full Treatments Index</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={scrollLeft}
                  className="w-10 h-10 border border-[#C9A47F]/40 hover:border-[#C9A47F] bg-[#1C1817] text-[#C9A47F] hover:text-[#F6F0E9] flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Previous procedures"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={scrollRight}
                  className="w-10 h-10 border border-[#C9A47F]/40 hover:border-[#C9A47F] bg-[#1C1817] text-[#C9A47F] hover:text-[#F6F0E9] flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Next procedures"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto pb-4 mb-8 text-xs scrollbar-none">
          {[
            { id: 'all', label: 'All Procedures' },
            { id: 'facial', label: 'Facial Aesthetics' },
            { id: 'body', label: 'Body Contouring' },
            { id: 'hair', label: 'Hair Restoration' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-4 sm:px-5 py-2.5 uppercase tracking-[0.14em] font-sans font-medium text-xs transition-all duration-200 cursor-pointer whitespace-nowrap ${
                activeFilter === tab.id
                  ? 'bg-[#C9A47F] text-[#0B0B0B] font-semibold shadow-lg shadow-[#C9A47F]/20'
                  : 'bg-[#181615] text-[#AFA89F] hover:text-[#F6F0E9] hover:bg-[#24201E] border border-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Horizontal Scrollable Gallery Container with snap */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 sm:gap-8 overflow-x-auto overscroll-x-contain pb-6 scroll-smooth snap-x snap-mandatory scrollbar-none"
        >
          {filteredTreatments.map((treatment, idx) => (
            <motion.article
              key={treatment.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className="group relative bg-[#1A1716] border border-[#C9A47F]/25 overflow-hidden flex flex-col justify-between transition-all duration-500 hover:border-[#C9A47F] hover:shadow-2xl hover:shadow-[#C9A47F]/10 min-w-[min(82vw,300px)] sm:min-w-[360px] lg:min-w-[380px] max-w-[380px] snap-start flex-shrink-0"
            >
              <Link
                to={`/treatments/${treatment.slug}`}
                className="block flex-grow flex flex-col justify-between"
              >
                {/* Image Container with Elegant Hover Zoom */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#12100F]">
                  <img
                    src={treatment.image}
                    alt={treatment.title}
                    className="w-full h-full object-cover object-center filter contrast-[105%] group-hover:scale-108 transition-transform duration-700 ease-out"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A1716] via-transparent to-transparent opacity-85" />

                  {/* Category Badge & Index Indicator */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-[11px] font-sans tracking-[0.2em] text-[#C9A47F] uppercase">
                    <span className="bg-[#0B0B0B]/90 backdrop-blur-md px-2.5 py-1 border border-[#C9A47F]/30 text-[10px]">
                      {treatment.categoryLabel}
                    </span>
                    <span className="font-mono text-xs opacity-75">
                      0{idx + 1}
                    </span>
                  </div>

                  {/* Quick Info Chip */}
                  <div className="absolute bottom-3 left-4 flex items-center gap-2 text-[11px] text-[#F6F0E9]/90 font-sans">
                    <Clock className="w-3.5 h-3.5 text-[#C9A47F]" />
                    <span>{treatment.duration}</span>
                  </div>
                </div>

                {/* Text Card Content */}
                <div className="p-6 sm:p-7 flex flex-col flex-grow justify-between">
                  <div>
                    <h3 className="text-2xl font-serif text-[#F6F0E9] group-hover:text-[#C9A47F] transition-colors duration-300 font-normal mb-2 flex items-center justify-between">
                      <span>{treatment.title}</span>
                      <div className="w-8 h-8 rounded-full border border-[#C9A47F]/40 flex items-center justify-center text-[#C9A47F] group-hover:bg-[#C9A47F] group-hover:text-[#0B0B0B] group-hover:border-[#C9A47F] transition-all duration-300 transform group-hover:scale-110">
                        <ArrowUpRight className="w-4 h-4" />
                      </div>
                    </h3>

                    <p className="text-xs text-[#C9A47F] font-sans tracking-wide uppercase mb-3">
                      {treatment.tagline}
                    </p>

                    <p className="text-xs sm:text-[13px] text-[#AFA89F] font-light leading-relaxed line-clamp-3 mb-6">
                      {treatment.summary}
                    </p>
                  </div>

                  {/* Key Indications list preview */}
                  <div className="pt-4 border-t border-[#C9A47F]/15 space-y-1.5 text-xs text-[#F6F0E9]/80">
                    <div className="text-[10px] uppercase tracking-wider text-[#AFA89F]">Key Indications:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {treatment.indications.slice(0, 2).map((item, i) => (
                        <span
                          key={i}
                          className="text-[11px] text-[#E0C5A8] font-light"
                        >
                          {item} {i < 1 && '·'}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>

              {/* Bottom Subtle Bar with Link */}
              <Link
                to={`/treatments/${treatment.slug}`}
                className="px-6 py-3.5 bg-[#141211] border-t border-white/5 flex items-center justify-between text-xs text-[#C9A47F] group-hover:text-[#F6F0E9] group-hover:bg-[#C9A47F]/10 transition-colors"
              >
                <span className="text-[11px] uppercase tracking-widest font-sans font-medium">
                  Read Dedicated Clinical Guide
                </span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1.5 transition-transform" />
              </Link>
            </motion.article>
          ))}
        </div>

        {/* Disclaimer & Doctor Confirmation Note */}
        <div className="mt-12 p-5 sm:p-6 bg-[#161413] border border-[#C9A47F]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#C9A47F] shrink-0 mt-0.5" />
            <p className="text-xs text-[#AFA89F] font-light leading-relaxed">
              <span className="text-[#F6F0E9] font-medium">Clinical Notice:</span> All procedures are strictly customized to the patient&apos;s unique anatomical prerequisites and are subject to in-depth clinical consultation and medical clearance by Dr. Samik Sharma at Shalby Hospital, Mohali.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-3">
            <Link
              to="/treatments"
              className="px-5 py-2.5 text-xs font-sans tracking-[0.12em] uppercase font-medium text-[#F6F0E9] border border-[#C9A47F]/40 hover:border-[#C9A47F] transition-colors whitespace-nowrap shrink-0"
            >
              Treatments Directory
            </Link>
            <button
              onClick={() => onOpenBooking()}
              type="button"
              className="px-6 py-2.5 text-xs font-sans tracking-[0.14em] uppercase font-semibold text-[#0B0B0B] bg-[#C9A47F] hover:bg-[#DFCAAF] transition-colors whitespace-nowrap cursor-pointer shrink-0"
            >
              Request Assessment
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
