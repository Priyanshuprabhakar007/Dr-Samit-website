/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowRight, ArrowUpRight, Award, MapPin } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { HomepageData } from '../lib/firestoreService';

interface HeroProps {
  onOpenBooking: () => void;
  heroData?: HomepageData['hero'];
}

const DEFAULT_IMAGE = '/src/assets/images/hero_editorial_beauty_1794213535182.jpg';
const SURGEON_IMAGE = '/src/assets/images/doctor_samik_sharma_1794213537721.jpg';

export const Hero: React.FC<HeroProps> = ({ onOpenBooking, heroData }) => {
  const prefersReducedMotion = useReducedMotion();
  const classicHeadline =
    (!heroData?.headlinePart1 || heroData.headlinePart1.trim().toUpperCase() === 'RESHAPING FORM, RESTORING') &&
    (!heroData?.headlineHighlight || heroData.headlineHighlight.trim().toUpperCase() === 'CONFIDENCE');
  const imagePosition = heroData?.imagePosition === 'object-bottom' ? 'object-bottom'
    : heroData?.imagePosition === 'object-center' ? 'object-center' : 'object-top';

  const entrance = (delay: number) => ({
    initial: prefersReducedMotion ? false : { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: prefersReducedMotion ? 0 : 0.7,
      delay: prefersReducedMotion ? 0 : delay,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  });

  return (
    <section
      id="home"
      aria-label="Dr. Samik Sharma, plastic and aesthetic surgery"
      className="relative isolate overflow-hidden bg-[#0B0B0B] text-[#F6F0E9] pt-26 sm:pt-32 lg:pt-32"
    >
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_75%_38%,rgba(201,164,127,0.08),transparent_40%),linear-gradient(110deg,#11100F_0%,#0B0B0B_50%,#15120F_100%)]" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 luxury-noise opacity-30" />

      <div className="relative mx-auto w-full max-w-[1480px] px-5 sm:px-8 lg:px-10 xl:px-16 pt-7 pb-14 sm:pt-10 sm:pb-20 lg:pt-7 lg:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-14 lg:gap-10 xl:gap-14 items-center">
          <div className="lg:col-span-7 min-w-0 lg:py-8">
            <motion.div {...entrance(0)} className="flex items-center gap-3 sm:gap-4 mb-7 sm:mb-9 text-[#C9A47F]">
              <span aria-hidden="true" className="w-8 sm:w-11 h-px bg-[#C9A47F] shrink-0" />
              <span className="text-[10px] sm:text-[11px] font-semibold tracking-[0.18em] sm:tracking-[0.26em] leading-relaxed uppercase">
                {heroData?.eyebrow || 'PLASTIC · COSMETIC · RECONSTRUCTIVE SURGERY'}
              </span>
            </motion.div>

            <motion.h1
              {...entrance(0.1)}
              className="max-w-[790px] font-serif font-normal text-[clamp(2.85rem,10.7vw,4.5rem)] sm:text-[clamp(4rem,7vw,5.5rem)] lg:text-[clamp(4rem,5vw,5.7rem)] leading-[1.03] tracking-[-0.055em] text-[#FBF7F1] break-words"
            >
              {classicHeadline ? (
                <>
                  <span className="block">Reshaping form.</span>
                  <span className="block mt-[0.06em]">Restoring</span>
                  <span className="block italic text-[#C9A47F] mt-[0.02em]">confidence.</span>
                </>
              ) : (
                <>
                  {heroData?.headlinePart1}{' '}
                  <span className="italic text-[#C9A47F]">{heroData?.headlineHighlight}</span>
                </>
              )}
            </motion.h1>

            <motion.div {...entrance(0.2)} className="flex items-stretch gap-4 sm:gap-5 max-w-[580px] mt-8 sm:mt-10">
              <span aria-hidden="true" className="w-px bg-[#C9A47F]/80 shrink-0" />
              <p className="text-[14px] sm:text-[15px] lg:text-base leading-[1.85] font-normal text-[#C8BFB5]">
                {heroData?.description ||
                  'Personalized plastic and aesthetic care by Dr. Samik Sharma in Mohali, where surgical precision meets thoughtful, balanced results.'}
              </p>
            </motion.div>

            <motion.div {...entrance(0.3)} className="flex flex-col min-[430px]:flex-row items-stretch min-[430px]:items-center gap-3 sm:gap-4 mt-9 sm:mt-11">
              <button
                type="button"
                onClick={onOpenBooking}
                className="group min-h-13 inline-flex items-center justify-center gap-4 bg-[#C9A47F] hover:bg-[#E2C8AC] px-6 sm:px-7 py-4 text-[11px] sm:text-xs font-bold tracking-[0.12em] uppercase text-[#15110E] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C9A47F]"
              >
                <span>{heroData?.primaryCtaLabel || 'Request a Consultation'}</span>
                <ArrowUpRight aria-hidden="true" className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
              <a
                href={heroData?.secondaryCtaLink || '/treatments'}
                className="group min-h-13 inline-flex items-center justify-center gap-3 px-6 sm:px-7 py-4 border border-[#C9A47F]/45 hover:border-[#C9A47F] hover:bg-[#C9A47F]/5 text-[11px] sm:text-xs font-semibold tracking-[0.12em] uppercase text-[#F6F0E9] text-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C9A47F]"
              >
                <span>{heroData?.secondaryCtaLabel || 'Explore Treatments'}</span>
                <ArrowRight aria-hidden="true" className="size-4 shrink-0 transition-transform group-hover:translate-x-1" />
              </a>
            </motion.div>

            <motion.div {...entrance(0.4)} className="mt-11 sm:mt-14 pt-6 border-t border-[#C9A47F]/20 flex flex-col min-[450px]:flex-row gap-4 min-[450px]:gap-7">
              <div className="flex items-start gap-2.5">
                <Award aria-hidden="true" className="size-4 shrink-0 mt-0.5 text-[#C9A47F]" />
                <div>
                  <p className="text-[12px] text-[#F3EAE0] font-medium">UK Fellowship Trained</p>
                  <p className="text-[11px] text-[#998C80] mt-1">Plastic &amp; Aesthetic Surgery</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin aria-hidden="true" className="size-4 shrink-0 mt-0.5 text-[#C9A47F]" />
                <div>
                  <p className="text-[12px] text-[#F3EAE0] font-medium">Shalby Hospital</p>
                  <p className="text-[11px] text-[#998C80] mt-1">Mohali, Punjab</p>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.9, delay: prefersReducedMotion ? 0 : 0.2, ease: [0.16, 1, 0.3, 1] as const }}
            className="lg:col-span-5 relative w-full min-w-0 max-w-[530px] mx-auto lg:ml-auto lg:max-w-none"
          >
            <div aria-hidden="true" className="absolute -top-4 -right-3 bottom-5 left-5 sm:-top-6 sm:-right-6 sm:bottom-8 sm:left-8 border border-[#C9A47F]/35" />
            <div className="relative aspect-[5/5] min-[430px]:aspect-[5/5.5] sm:aspect-[4/5] lg:aspect-[4/5.35] overflow-hidden bg-[#1A1715]">
              <img
                src={heroData?.heroImage || DEFAULT_IMAGE}
                alt="Editorial aesthetic portrait exploring form and proportion"
                className={'w-full h-full object-cover ' + imagePosition}
                loading="eager"
                fetchPriority="high"
                referrerPolicy="no-referrer"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B]/90 via-transparent to-transparent pointer-events-none"
                style={{ opacity: (heroData?.overlayIntensity ?? 70) / 100 }}
              />
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent" />
              <div className="absolute top-4 right-4 sm:top-6 sm:right-6 border border-white/30 bg-[#0B0B0B]/35 px-3 py-2 backdrop-blur-sm">
                <span className="text-[9px] uppercase tracking-[0.22em] text-[#F6F0E9]/90">Aesthetic Perspective</span>
              </div>
              <div className="absolute bottom-5 right-5 sm:bottom-7 sm:right-7 text-right">
                <p className="font-serif italic text-xl sm:text-2xl text-[#E7C8A8] leading-tight">Artistry in balance.</p>
                <div aria-hidden="true" className="mt-2 h-px w-12 bg-[#C9A47F]/70 ml-auto" />
              </div>
            </div>

            {/* Introducing the surgeon without obscuring the editorial image. */}
            <div className="relative -mt-10 sm:-mt-14 ml-0 sm:-ml-8 lg:-ml-10 z-10 flex items-center gap-3 sm:gap-4 max-w-[295px] sm:max-w-[330px] p-2.5 sm:p-3 bg-[#191614] border border-[#C9A47F]/40 shadow-[0_24px_55px_rgba(0,0,0,0.5)]">
              <img
                src={SURGEON_IMAGE}
                alt="Dr. Samik Sharma"
                className="w-[60px] h-[72px] sm:w-[76px] sm:h-[87px] object-cover object-top shrink-0"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0 flex-1">
                <p className="text-[9px] uppercase tracking-[0.17em] text-[#C9A47F] font-semibold">Meet Your Surgeon</p>
                <p className="mt-1 font-serif text-lg sm:text-xl tracking-[-0.02em] text-[#F6F0E9] leading-tight">Dr. Samik Sharma</p>
                <p className="mt-1 text-[10px] leading-snug text-[#AFA89F]">Plastic &amp; Aesthetic Surgeon</p>
                <a href="#about" className="inline-flex items-center gap-1 mt-2 text-[10px] text-[#E7C6A6] hover:text-white underline underline-offset-4">
                  View profile <ArrowUpRight aria-hidden="true" className="size-3" />
                </a>
              </div>
            </div>
          </motion.div>
        </div>

        <div aria-hidden="true" className="mt-12 sm:mt-16 flex items-center gap-4 sm:gap-5">
          <span className="h-px flex-1 bg-gradient-to-r from-[#C9A47F]/40 via-[#C9A47F]/15 to-transparent" />
          <span className="text-[9px] tracking-[0.2em] uppercase text-[#9A8775] whitespace-nowrap">Individualised care · Mohali</span>
        </div>
      </div>
    </section>
  );
};
