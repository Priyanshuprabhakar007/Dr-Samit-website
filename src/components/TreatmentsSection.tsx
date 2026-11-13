/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Clock, ShieldCheck } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { TREATMENTS_DATA, TreatmentItem } from '../data/surgeryData';
import { HomepageData } from '../lib/firestoreService';

interface TreatmentsSectionProps {
  onSelectTreatment: (treatment: TreatmentItem) => void;
  onOpenBooking: (treatmentTitle?: string) => void;
  treatments?: TreatmentItem[];
  sectionData?: HomepageData['treatmentsShowcase'];
}

type Filter = 'all' | 'facial' | 'body' | 'hair';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All Procedures' },
  { id: 'facial', label: 'Facial Aesthetics' },
  { id: 'body', label: 'Body Contouring' },
  { id: 'hair', label: 'Hair Restoration' },
];

export const TreatmentsSection: React.FC<TreatmentsSectionProps> = ({
  onOpenBooking,
  treatments,
  sectionData,
}) => {
  const [activeFilter, setActiveFilter] = useState<Filter>('all');
  const reduceMotion = useReducedMotion();
  const sourceTreatments = treatments && treatments.length > 0 ? treatments : TREATMENTS_DATA;

  // Preserve the CMS featured order and any per-treatment image overrides.
  const treatmentList = useMemo(() => {
    const featured = sectionData?.featuredSlugs;
    const visible = featured && featured.length > 0
      ? featured
          .map((slug) => sourceTreatments.find((t) => (t.slug || t.id) === slug))
          .filter((t): t is TreatmentItem => Boolean(t))
      : sourceTreatments;

    return visible.map((treatment) => {
      const customImage = sectionData?.customImages?.[treatment.slug || treatment.id];
      return customImage
        ? { ...treatment, image: customImage, heroImage: customImage }
        : treatment;
    });
  }, [sourceTreatments, sectionData]);

  const filteredTreatments = activeFilter === 'all'
    ? treatmentList
    : treatmentList.filter((treatment) => treatment.category === activeFilter);

  return (
    <section
      id="treatments"
      aria-labelledby="treatments-heading"
      className="relative overflow-hidden bg-[#0B0B0B] py-20 text-[#F6F0E9] sm:py-24 lg:py-28"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 luxury-noise opacity-20" />
      <div className="relative mx-auto max-w-[1380px] px-5 sm:px-8 lg:px-12 xl:px-16">

        {/* Keep the introduction together. The directory link no longer crowds
            the description, and the unnecessary carousel arrows are gone. */}
        <div className="border-b border-[#C9A47F]/20 pb-8 sm:pb-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
            <div className="min-w-0 max-w-[760px]">
              <div className="mb-4 flex items-center gap-3">
                <span aria-hidden="true" className="h-px w-9 shrink-0 bg-[#C9A47F]" />
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#C9A47F] sm:text-[11px]">
                  {sectionData?.subtitle || 'SURGICAL DISCIPLINES'}
                </p>
              </div>
              <h2
                id="treatments-heading"
                className="max-w-[760px] font-serif text-[clamp(2.3rem,4.2vw,3.85rem)] font-normal leading-[1.1] tracking-[-0.045em] text-[#FBF7F2] text-balance"
              >
                {sectionData?.title || 'Clinical Procedures & Contouring'}
              </h2>
              <p className="mt-5 max-w-[610px] text-[14px] leading-[1.85] text-[#BDB3A9] sm:text-[15px]">
                {sectionData?.description ||
                  'Explore individualized surgical care designed around anatomy, personal goals, and considered clinical decisions.'}
              </p>
            </div>

            <Link
              to="/treatments"
              className="group inline-flex min-h-12 w-fit shrink-0 items-center justify-center gap-3 border-b border-[#C9A47F]/55 pb-2 text-[11px] font-semibold uppercase tracking-[0.13em] text-[#DBB793] transition-colors hover:text-[#F6F0E9] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C9A47F]"
            >
              Explore All Treatments
              <ArrowUpRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </div>

        {/* Wrap, rather than horizontally scrolling, the filter labels on phones. */}
        <div className="mb-6 mt-7 flex flex-col gap-4 sm:mb-8 sm:mt-8 sm:flex-row sm:items-center sm:justify-between">
          <div role="group" aria-label="Filter procedures by category" className="flex flex-wrap gap-2 sm:gap-2.5">
            {FILTERS.map((filter) => (
              <button
                key={filter.id}
                type="button"
                aria-pressed={activeFilter === filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={
                  'min-h-10 border px-3.5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.1em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A47F] sm:px-4 sm:text-[11px] ' +
                  (activeFilter === filter.id
                    ? 'border-[#C9A47F] bg-[#C9A47F] text-[#15110E]'
                    : 'border-[#C9A47F]/20 bg-[#171411] text-[#C8BDB2] hover:border-[#C9A47F]/60 hover:text-[#F6F0E9]')
                }
              >
                {filter.label}
              </button>
            ))}
          </div>
          <p aria-live="polite" className="shrink-0 text-[11px] tracking-wide text-[#9E9388]">
            {filteredTreatments.length} {filteredTreatments.length === 1 ? 'procedure' : 'procedures'}
          </p>
        </div>

        {/* A responsive grid gives the cards a stable, balanced rhythm rather
            than the oversized horizontal strip and floating arrows. */}
        {filteredTreatments.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 min-[600px]:grid-cols-2 lg:gap-6 xl:grid-cols-3">
            {filteredTreatments.map((treatment, index) => (
              <motion.article
                key={treatment.id}
                initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: reduceMotion ? 0 : 0.45, delay: reduceMotion ? 0 : Math.min(index, 2) * 0.06 }}
                className="group flex min-w-0 flex-col overflow-hidden border border-[#C9A47F]/20 bg-[#181513] transition-colors hover:border-[#C9A47F]/60"
              >
                <Link
                  to={`/treatments/${treatment.slug || treatment.id}`}
                  className="flex h-full min-w-0 flex-col focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#C9A47F]"
                >
                  <div className="relative aspect-[5/4] overflow-hidden bg-[#171310] sm:aspect-[4/3]">
                    <img
                      src={treatment.image}
                      alt={treatment.title + ' procedure illustration'}
                      className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.035]"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                    <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#100D0B]/65 via-transparent to-transparent" />
                    <div className="absolute inset-x-4 top-4 flex items-start justify-between gap-3">
                      <span className="max-w-[80%] border border-[#C9A47F]/35 bg-[#0C0B0A]/80 px-2.5 py-1.5 text-[9px] font-semibold uppercase leading-snug tracking-[0.14em] text-[#E6C4A4] backdrop-blur-sm">
                        {treatment.categoryLabel}
                      </span>
                      <span className="font-mono text-xs tracking-widest text-[#F6F0E9]/75">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col px-5 pb-5 pt-6 sm:px-6 sm:pb-6">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="min-w-0 font-serif text-[clamp(1.6rem,2.15vw,2.15rem)] font-normal leading-tight tracking-[-0.025em] text-[#F6F0E9] transition-colors group-hover:text-[#D6B18D]">
                        {treatment.title}
                      </h3>
                      <ArrowUpRight aria-hidden="true" className="mt-1 size-5 shrink-0 text-[#C9A47F] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                    <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#D0AC87]">
                      {treatment.tagline}
                    </p>
                    <p className="mt-4 flex-1 text-[13px] leading-[1.75] text-[#BFB5A9]">
                      {treatment.summary}
                    </p>
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#C9A47F]/20 pt-4">
                      <span className="inline-flex items-center gap-2 text-[11px] text-[#BDB2A7]">
                        <Clock aria-hidden="true" className="size-3.5 text-[#C9A47F]" />
                        {treatment.duration}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-[#E0BD99]">
                        View Details
                        <ArrowRight aria-hidden="true" className="size-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="border border-[#C9A47F]/20 bg-[#171411] px-5 py-10 text-center">
            <p className="text-sm text-[#D5C7B8]">No featured procedures in this category.</p>
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className="mt-4 min-h-10 border-b border-[#C9A47F]/60 px-3 text-xs font-semibold uppercase tracking-wider text-[#C9A47F] hover:text-[#F6F0E9]"
            >
              Show All Procedures
            </button>
          </div>
        )}

        <div className="mt-10 flex flex-col gap-5 border-t border-[#C9A47F]/20 pt-6 sm:mt-12 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex max-w-[760px] items-start gap-3">
            <ShieldCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#C9A47F]" />
            <p className="text-[12px] leading-[1.8] text-[#B8AEA3]">
              <span className="font-semibold text-[#F6F0E9]">Clinical note.</span> Procedure suitability and individual risks are discussed during consultation with Dr. Samik Sharma.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenBooking()}
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-3 bg-[#C9A47F] px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[#16110D] transition-colors hover:bg-[#E0C4A8] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C9A47F]"
          >
            Request Consultation
            <ArrowRight aria-hidden="true" className="size-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
