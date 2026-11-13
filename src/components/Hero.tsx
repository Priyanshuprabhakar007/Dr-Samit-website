/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, MapPin, Pause, Play } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { HomepageData } from '../lib/firestoreService';

interface HeroProps {
  onOpenBooking: () => void;
  heroData?: HomepageData['hero'];
}

interface HeroSlide {
  id: string;
  category: string;
  heading: string;
  accent: string;
  description: string;
  image: string;
  imagePosition: string;
  procedure: string;
  link: string;
  linkLabel: string;
}

const AUTO_ADVANCE_MS = 8000;
const STATIC_TREATMENT_SLIDES: HeroSlide[] = [
  {
    id: 'rhinoplasty',
    category: 'FACIAL AESTHETICS / 01',
    heading: 'Natural',
    accent: 'proportion.',
    description: 'Rhinoplasty considers nasal shape, breathing and facial harmony, with a plan tailored to each individual.',
    image: '/src/assets/images/treatment_rhinoplasty_1794213538703.jpg',
    imagePosition: 'center center',
    procedure: 'Rhinoplasty',
    link: '/treatments/rhinoplasty',
    linkLabel: 'Explore Rhinoplasty',
  },
  {
    id: 'facelift',
    category: 'FACIAL REJUVENATION / 02',
    heading: 'Timeless',
    accent: 'definition.',
    description: 'Facelift and neck lift procedures are planned around facial anatomy, tissue quality and personal goals.',
    image: '/src/assets/images/treatment_facelift_1794213539762.jpg',
    imagePosition: 'center center',
    procedure: 'Facelift & Neck Lift',
    link: '/treatments/facelift-neck-lift',
    linkLabel: 'Explore Facelift',
  },
  {
    id: 'liposuction',
    category: 'BODY CONTOURING / 03',
    heading: 'Sculpted',
    accent: 'balance.',
    description: 'Liposuction is a body-contouring procedure for selected areas of persistent fat, not a weight-loss treatment.',
    image: '/src/assets/images/treatment_liposuction_1794213577090.jpg',
    imagePosition: 'center center',
    procedure: 'Liposuction',
    link: '/treatments/liposuction',
    linkLabel: 'Explore Body Contouring',
  },
  {
    id: 'eyelid',
    category: 'EYE AESTHETICS / 04',
    heading: 'A refreshed',
    accent: 'expression.',
    description: 'Eyelid surgery may help address excess skin or puffiness after a careful clinical consultation.',
    image: '/src/assets/images/treatment_eyelid_1794213577248.jpg',
    imagePosition: 'center center',
    procedure: 'Eyelid Surgery',
    link: '/treatments/eyelid-surgery',
    linkLabel: 'Explore Eyelid Surgery',
  },
];

export const Hero: React.FC<HeroProps> = ({ onOpenBooking, heroData }) => {
  const prefersReducedMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [manualPause, setManualPause] = useState(false);
  const [focusPause, setFocusPause] = useState(false);
  const [documentVisible, setDocumentVisible] = useState(true);
  const touchStartX = useRef<number | null>(null);

  const slides = useMemo<HeroSlide[]>(() => {
    // Honour custom homepage-CMS content. Only the untouched baseline uses
    // the shorter art-directed headline.
    const isBaselineHeadline =
      (!heroData?.headlinePart1 || heroData.headlinePart1.trim().toUpperCase() === 'RESHAPING FORM, RESTORING') &&
      (!heroData?.headlineHighlight || heroData.headlineHighlight.trim().toUpperCase() === 'CONFIDENCE');

    const cmsImagePosition =
      heroData?.imagePosition === 'object-bottom' ? 'center bottom'
      : heroData?.imagePosition === 'object-center' ? 'center center'
      : 'center top';

    return [
      {
        id: 'introduction',
        category: heroData?.eyebrow || 'PLASTIC · COSMETIC · RECONSTRUCTIVE SURGERY',
        heading: isBaselineHeadline ? 'Refining form.' : (heroData?.headlinePart1 || 'Refining form.'),
        accent: isBaselineHeadline ? 'Restoring confidence.' : (heroData?.headlineHighlight || 'Restoring confidence.'),
        description: heroData?.description ||
          'Personalized plastic and aesthetic surgery by Dr. Samik Sharma in Mohali, combining surgical precision with thoughtful patient care.',
        image: heroData?.heroImage || '/src/assets/images/hero_editorial_beauty_1794213535182.jpg',
        imagePosition: cmsImagePosition,
        procedure: 'The Aesthetic Perspective',
        link: heroData?.secondaryCtaLink || '/treatments',
        linkLabel: heroData?.secondaryCtaLabel || 'Explore Treatments',
      },
      ...STATIC_TREATMENT_SLIDES,
    ];
  }, [heroData]);

  const slide = slides[activeIndex] || slides[0];
  const isPaused = manualPause || focusPause || !documentVisible;
  const allowAutoAdvance = !prefersReducedMotion && !isPaused;

  const moveTo = useCallback((index: number) => {
    setActiveIndex(((index % slides.length) + slides.length) % slides.length);
  }, [slides.length]);

  const next = useCallback(() => {
    setActiveIndex((index) => (index + 1) % slides.length);
  }, [slides.length]);

  const previous = useCallback(() => {
    setActiveIndex((index) => (index - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    const onVisibility = () => setDocumentVisible(!document.hidden);
    onVisibility();
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  useEffect(() => {
    if (!allowAutoAdvance) return;
    const timer = window.setTimeout(next, AUTO_ADVANCE_MS);
    return () => window.clearTimeout(timer);
  }, [allowAutoAdvance, activeIndex, next]);

  // Load one future photograph at a time to keep initial mobile loading light.
  useEffect(() => {
    const image = new Image();
    image.src = slides[(activeIndex + 1) % slides.length].image;
  }, [activeIndex, slides]);

  const handleSwipe = (endX: number) => {
    if (touchStartX.current === null) return;
    const movement = endX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(movement) < 55) return;
    if (movement < 0) next();
    else previous();
  };

  const isInternalLink = slide.link.startsWith('/') && !slide.link.startsWith('//');

  const secondaryButtonClass =
    'group inline-flex min-h-12 items-center justify-center gap-3 border border-[#E2D2C2]/45 bg-black/10 px-5 sm:px-7 py-3.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#F5EFEA] backdrop-blur-sm transition-colors hover:border-[#E4C5A6] hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C9A47F]';

  return (
    <section
      id="home"
      aria-label="Featured treatments and surgical care"
      className="relative isolate min-h-[100svh] overflow-hidden bg-[#0C0B0A] text-[#F6F0E9]"
      onFocusCapture={() => setFocusPause(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocusPause(false);
      }}
      onTouchStart={(event) => { touchStartX.current = event.touches[0]?.clientX ?? null; }}
      onTouchEnd={(event) => { if (event.changedTouches[0]) handleSwipe(event.changedTouches[0].clientX); }}
      onTouchCancel={() => { touchStartX.current = null; }}
    >
      <div className="absolute inset-0 z-0 bg-[#0D0B0A]" aria-hidden="true">
        <div className="absolute inset-0 lg:left-[24%] overflow-hidden">
          <AnimatePresence initial={false} mode="sync">
            <motion.img
              key={slide.id}
              src={slide.image}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              style={{ objectPosition: slide.imagePosition }}
              initial={prefersReducedMotion ? false : { opacity: 0, scale: 1.025 }}
              animate={{ opacity: 1, scale: prefersReducedMotion ? 1 : 1.105 }}
              exit={{ opacity: 0 }}
              transition={{
                opacity: { duration: prefersReducedMotion ? 0 : 1, ease: 'easeInOut' },
                scale: { duration: prefersReducedMotion ? 0 : AUTO_ADVANCE_MS / 1000, ease: 'linear' },
              }}
              draggable={false}
            />
          </AnimatePresence>
        </div>
        {/* A dark left reading area; the image remains vibrant on the right. */}
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(8,7,7,0.97)_0%,rgba(9,8,8,0.82)_35%,rgba(9,8,8,0.32)_78%,rgba(9,8,8,0.25)_100%)] lg:bg-[linear-gradient(90deg,#0C0B0A_0%,rgba(12,11,10,0.99)_20%,rgba(12,11,10,0.85)_41%,rgba(12,11,10,0.12)_76%),linear-gradient(0deg,rgba(7,6,6,0.85)_0%,transparent_36%)]" />
        <div className="absolute inset-0 luxury-noise opacity-20" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[1560px] flex-col justify-end px-5 pb-7 pt-32 sm:px-8 sm:pb-10 sm:pt-36 lg:px-12 xl:px-16 lg:pb-10">
        <div className="flex flex-1 flex-col justify-center pb-12 pt-3 sm:pb-16 lg:pb-12">
          <div className="max-w-[690px]">
            <div className="mb-6 flex items-center gap-3 sm:mb-8">
              <span aria-hidden="true" className="h-px w-8 shrink-0 bg-[#D9B995] sm:w-12" />
              <p className="max-w-[420px] text-[9px] font-semibold uppercase leading-relaxed tracking-[0.18em] text-[#E7C3A0] sm:text-[11px] sm:tracking-[0.25em]">
                {slide.category}
              </p>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={slide.id}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0, y: -13 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.55, ease: 'easeOut' }}
              >
                <h1 className="max-w-[760px] font-serif text-[clamp(3rem,12.5vw,4.8rem)] font-normal leading-[1.02] tracking-[-0.045em] text-[#FCF7F1] sm:text-[clamp(4.2rem,7vw,6.5rem)] lg:text-[clamp(4.6rem,6.4vw,7.25rem)] break-words">
                  <span className="block">{slide.heading}</span>
                  <span className="mt-1 block font-serif italic font-normal text-[#E4C4A4]">{slide.accent}</span>
                </h1>
                <p className="mt-6 max-w-[510px] border-l border-[#D4AC84]/70 pl-4 text-[13px] leading-[1.8] text-[#DED4CA] sm:mt-8 sm:pl-5 sm:text-[15px]">
                  {slide.description}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex flex-col gap-3 min-[420px]:flex-row sm:mt-10 sm:gap-4">
              <button
                type="button"
                onClick={onOpenBooking}
                className="group inline-flex min-h-12 items-center justify-center gap-4 bg-[#E4C4A4] px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#1C1410] transition-colors hover:bg-[#F4D9BE] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E4C4A4]"
              >
                {heroData?.primaryCtaLabel || 'Book Consultation'}
                <ArrowUpRight aria-hidden="true" className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
              {isInternalLink ? (
                <Link to={slide.link} className={secondaryButtonClass}>
                  {slide.linkLabel}
                  <ArrowRight aria-hidden="true" className="size-4 shrink-0 transition-transform group-hover:translate-x-1" />
                </Link>
              ) : (
                <a href={slide.link} className={secondaryButtonClass}>
                  {slide.linkLabel}
                  <ArrowRight aria-hidden="true" className="size-4 shrink-0 transition-transform group-hover:translate-x-1" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Procedure label floats over the image, not over the subject's face. */}
        <div className="pointer-events-none absolute right-5 top-[31%] hidden items-center gap-4 xl:flex">
          <span className="h-px w-12 bg-[#D1B090]/65" />
          <div className="text-right">
            <p className="text-[9px] uppercase tracking-[0.25em] text-[#E2C2A2]">Featured focus</p>
            <p className="mt-1 font-serif text-2xl text-[#FCF7F1]">{slide.procedure}</p>
          </div>
        </div>

        <div className="flex flex-col gap-5 border-t border-[#D7B08B]/30 pt-5 sm:gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          <div className="max-w-[330px] shrink-0">
            <p className="font-serif text-[21px] tracking-[0.015em] text-[#F9EFE5] sm:text-2xl">Dr. Samik Sharma</p>
            <p className="mt-1 flex items-center gap-1.5 text-[10px] font-medium tracking-[0.035em] text-[#C9B5A1] sm:text-xs">
              <MapPin aria-hidden="true" className="size-3.5 text-[#E1BC96]" />
              Plastic &amp; Aesthetic Surgery · Mohali
            </p>
            <p className="mt-1.5 text-[9px] text-[#A79786]">Editorial treatment imagery · Not patient before-and-after results</p>
          </div>

          <div className="min-w-0 flex-1 lg:max-w-[720px]">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 flex-1 gap-2 sm:gap-3" role="group" aria-label="Select featured treatment slide">
                {slides.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-label={'Show slide ' + (index + 1) + ' of ' + slides.length + ': ' + item.procedure}
                    aria-pressed={index === activeIndex}
                    onClick={() => moveTo(index)}
                    className="group min-w-0 flex-1 py-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-[#E4C4A4]"
                  >
                    <span className={'block text-[10px] font-semibold tracking-[0.08em] ' + (index === activeIndex ? 'text-[#F6E7D8]' : 'text-[#9B8F85]')}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="mt-2 block h-[2px] w-full overflow-hidden bg-white/25">
                      {index === activeIndex && (
                        <span
                          key={item.id}
                          className={'block h-full w-full origin-left bg-[#E5C19D] ' + (prefersReducedMotion ? '' : 'hero-slide-progress')}
                          style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
                        />
                      )}
                    </span>
                  </button>
                ))}
              </div>
              <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                {!prefersReducedMotion && (
                  <button
                    type="button"
                    onClick={() => setManualPause((value) => !value)}
                    aria-label={manualPause ? 'Resume automatic slides' : 'Pause automatic slides'}
                    className="inline-flex size-10 items-center justify-center border border-white/30 text-[#F6F0E9] transition-colors hover:border-[#E4C4A4] hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-[#E4C4A4]"
                  >
                    {manualPause ? <Play aria-hidden="true" className="size-4" /> : <Pause aria-hidden="true" className="size-4" />}
                  </button>
                )}
                <button
                  type="button"
                  onClick={previous}
                  aria-label="Previous featured slide"
                  className="inline-flex size-10 items-center justify-center border border-white/30 text-[#F6F0E9] transition-colors hover:border-[#E4C4A4] hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-[#E4C4A4]"
                >
                  <ChevronLeft aria-hidden="true" className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={next}
                  aria-label="Next featured slide"
                  className="inline-flex size-10 items-center justify-center border border-white/30 text-[#F6F0E9] transition-colors hover:border-[#E4C4A4] hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-[#E4C4A4]"
                >
                  <ChevronRight aria-hidden="true" className="size-4" />
                </button>
              </div>
            </div>
            <p className="mt-1 hidden text-right text-[10px] uppercase tracking-[0.2em] text-[#B7A99C] lg:block">
              Swipe or select a procedure · {slide.procedure}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
