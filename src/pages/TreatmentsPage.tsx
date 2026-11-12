/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TREATMENTS_DETAILED, CLINIC_INFO } from '../data/surgeryData';
import { getTreatments, TreatmentItem } from '../lib/firestoreService';
import { FinalCTA } from '../components/FinalCTA';
import { ArrowUpRight, ArrowRight, Clock, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface TreatmentsPageProps {
  onOpenBooking: (treatmentTitle?: string) => void;
}

export const TreatmentsPage: React.FC<TreatmentsPageProps> = ({ onOpenBooking }) => {
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'facial' | 'body' | 'hair' | 'reconstructive'
  >('all');
  const [dbTreatments, setDbTreatments] = useState<TreatmentItem[]>([]);

  useEffect(() => {
    document.title = 'Surgical Treatments & Procedures | Dr. Samik Sharma, Mohali';
    async function load() {
      try {
        const items = await getTreatments(false);
        if (items && items.length > 0) {
          setDbTreatments(items);
        }
      } catch (err) {
        console.warn('Could not fetch treatments from Firestore, using baseline:', err);
      }
    }
    load();
  }, []);

  const getLiveProcedure = (slug: string, fallbackKey: string) => {
    const fallback = TREATMENTS_DETAILED[fallbackKey];
    const live = dbTreatments.find((t) => t.slug === slug || t.id === slug);
    if (!live || !fallback) return fallback;
    return {
      ...fallback,
      heroImage: live.heroImage || fallback.heroImage,
      tagline: live.tagline || fallback.tagline,
      summary: live.summary || fallback.summary,
      duration: live.duration || fallback.duration,
    };
  };

  const rhinoplasty = getLiveProcedure('rhinoplasty', 'rhinoplasty');
  const facelift = getLiveProcedure('facelift-neck-lift', 'facelift-neck-lift') || getLiveProcedure('facelift-necklift', 'facelift-neck-lift');
  const blepharoplasty = getLiveProcedure('blepharoplasty', 'blepharoplasty');
  const liposuction = getLiveProcedure('liposuction', 'liposuction');
  const tummyTuck = getLiveProcedure('tummy-tuck', 'tummy-tuck');
  const hairTransplant = getLiveProcedure('hair-transplant', 'hair-transplant');

  const coreSlugs = new Set(['rhinoplasty', 'facelift-neck-lift', 'facelift-necklift', 'blepharoplasty', 'liposuction', 'tummy-tuck', 'hair-transplant']);
  const additionalTreatments = dbTreatments.filter((t) => !coreSlugs.has(t.slug || t.id));
  const filteredAdditional = selectedCategory === 'all'
    ? additionalTreatments
    : additionalTreatments.filter((t) => {
        const cat = (t.category || '').toLowerCase();
        if (selectedCategory === 'facial') return cat.includes('facial');
        if (selectedCategory === 'body') return cat.includes('body');
        if (selectedCategory === 'hair') return cat.includes('hair');
        if (selectedCategory === 'reconstructive') return cat.includes('reconstruct');
        return true;
      });

  const allTreatments = Object.values(TREATMENTS_DETAILED);

  const filtered = selectedCategory === 'all'
    ? allTreatments
    : allTreatments.filter((t) => t.category === selectedCategory);

  const categories = [
    { id: 'all', label: 'All Disciplines' },
    { id: 'facial', label: 'Facial Aesthetics' },
    { id: 'body', label: 'Body Contouring' },
    { id: 'hair', label: 'Hair Restoration' },
    { id: 'reconstructive', label: 'Reconstructive Surgery' },
  ];

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-[#F6F0E9] pt-24 sm:pt-28">
      
      {/* 1. Full-Width Editorial Hero with Oversized Typography */}
      <section className="relative min-h-[75vh] lg:min-h-[85vh] flex items-center overflow-hidden border-b border-[#C9A47F]/20">
        {/* Full-Bleed Sculptural Aesthetic Background */}
        <div className="absolute inset-0 z-0">
          <img
            src="/src/assets/images/treatments_hero_sculptural_1794217994345.jpg"
            alt="The Art of Transformation - Sculptural Aesthetic Museum Hall"
            className="w-full h-full object-cover object-center filter brightness-[45%] contrast-[115%]"
            loading="eager"
            referrerPolicy="no-referrer"
          />
          {/* Subtle contrast gradient scrims */}
          <div className="absolute inset-0 bg-[#0B0B0B]/60 backdrop-blur-[0.5px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B] via-[#0B0B0B]/30 to-[#0B0B0B]/80" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(201,164,127,0.12)_0%,transparent_70%)] pointer-events-none" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
            className="max-w-4xl"
          >
            {/* Breadcrumb / Kicker */}
            <div className="inline-flex items-center gap-3 mb-6">
              <Link
                to="/"
                className="text-xs uppercase tracking-[0.2em] text-[#AFA89F] hover:text-[#C9A47F] transition-colors"
              >
                Home
              </Link>
              <span className="text-[#C9A47F]/60 text-xs">/</span>
              <span className="text-xs uppercase tracking-[0.2em] text-[#C9A47F] font-semibold">
                Clinical Disciplines
              </span>
            </div>

            {/* Oversized Headline */}
            <h1 className="text-[clamp(2.05rem,9vw,3rem)] sm:text-6xl md:text-7xl lg:text-8xl font-serif font-light text-[#F6F0E9] leading-[1.1] tracking-tight mb-7 text-balance break-words">
              THE ART OF <br />
              <span className="font-serif italic text-[#C9A47F]">TRANSFORMATION</span>
            </h1>

            {/* Subtitle */}
            <h2 className="text-lg sm:text-2xl font-serif text-[#E0C5A8] font-normal mb-6 tracking-wide">
              Explore Aesthetic &amp; Reconstructive Surgery
            </h2>

            {/* Refined Supporting Copy */}
            <p className="text-base sm:text-lg text-[#AFA89F] font-light leading-relaxed max-w-2xl font-sans mb-10">
              Every procedure under Dr. Samik Sharma at Shalby Hospital Mohali is treated as a bespoke anatomical intervention. We believe true surgical refinement honors natural proportions, promotes informed patient decisions, and preserves structural integrity above transient trends.
            </p>

            <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-[#C9A47F]/25 text-xs text-[#AFA89F]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#C9A47F]" />
                <span className="text-[#F6F0E9]">Tertiary Care Hospital Suite</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C9A47F]" />
                <span className="text-[#F6F0E9]">UK Fellowship-Trained Surgical Direction</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. Interactive Category Filter & Verification Notice */}
      <section className="py-12 bg-[#12100F] border-b border-[#C9A47F]/15 sticky top-[73px] z-30 backdrop-blur-md bg-[#12100F]/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            {/* Category Segmented Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id as any)}
                  className={`px-4 sm:px-5 py-2.5 uppercase tracking-[0.14em] font-sans font-medium text-xs transition-all duration-200 cursor-pointer whitespace-nowrap ${
                    selectedCategory === cat.id
                      ? 'bg-[#C9A47F] text-[#0B0B0B] font-semibold shadow-lg shadow-[#C9A47F]/20'
                      : 'bg-[#1C1817] text-[#AFA89F] hover:text-[#F6F0E9] hover:bg-[#24201E] border border-white/5'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Note indicator */}
            <div className="flex items-center gap-2 text-[11px] text-[#AFA89F] font-light">
              <span className="w-2 h-2 rounded-full bg-[#C9A47F]" />
              <span>Personalized surgical pathways · Shalby Hospital Mohali</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Asymmetric Editorial Treatments Gallery */}
      <section className="py-20 sm:py-28 bg-[#0B0B0B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Introductory Editorial Note */}
          <div className="mb-14 p-5 bg-[#171413] border border-[#C9A47F]/20 flex items-start gap-3.5">
            <AlertCircle className="w-5 h-5 text-[#C9A47F] shrink-0 mt-0.5" />
            <p className="text-xs text-[#AFA89F] font-light leading-relaxed">
              <strong className="text-[#F6F0E9] font-medium">Doctor Review Protocol:</strong> These procedures reflect initial approved aesthetic and reconstructive categories. All surgical candidates undergo individual clinical diagnosis and medical clearance with Dr. Samik Sharma prior to definitive surgical confirmation.
            </p>
          </div>

          {/* Asymmetric Rich Editorial Layout */}
          <div className="space-y-12">
            
            {/* Row 1: Asymmetric 2-Column (7 cols / 5 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              
              {/* Rhinoplasty: Marquee Feature (7 cols) */}
              {TREATMENTS_DETAILED['rhinoplasty'] && (selectedCategory === 'all' || selectedCategory === 'facial') && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="lg:col-span-7"
                >
                  <Link
                    to="/treatments/rhinoplasty"
                    className="group block bg-[#1A1716] border border-[#C9A47F]/30 overflow-hidden hover:border-[#C9A47F] transition-all duration-500 h-full flex flex-col justify-between"
                  >
                    <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden bg-[#12100F]">
                      <img
                        src={TREATMENTS_DETAILED['rhinoplasty'].heroImage}
                        alt="Rhinoplasty profile"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1A1716] via-transparent to-transparent opacity-85" />
                      
                      <div className="absolute top-4 left-4">
                        <span className="bg-[#0B0B0B]/90 backdrop-blur-md px-3 py-1 border border-[#C9A47F]/40 text-[10px] tracking-widest uppercase text-[#C9A47F]">
                          FACIAL AESTHETICS
                        </span>
                      </div>

                      <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-xs text-[#E0C5A8]">
                        <span className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-[#C9A47F]" />
                          {TREATMENTS_DETAILED['rhinoplasty'].duration}
                        </span>
                        <span className="font-mono text-xs text-[#C9A47F]/80">01</span>
                      </div>
                    </div>

                    <div className="p-7 sm:p-9 flex flex-col flex-grow justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-3xl font-serif text-[#F6F0E9] group-hover:text-[#C9A47F] transition-colors">
                            Rhinoplasty
                          </h3>
                          <div className="w-9 h-9 rounded-full border border-[#C9A47F]/40 flex items-center justify-center text-[#C9A47F] group-hover:bg-[#C9A47F] group-hover:text-[#0B0B0B] transition-all">
                            <ArrowUpRight className="w-4 h-4" />
                          </div>
                        </div>
                        <p className="text-xs uppercase tracking-wider text-[#C9A47F] mb-3">
                          {TREATMENTS_DETAILED['rhinoplasty'].tagline}
                        </p>
                        <p className="text-sm text-[#AFA89F] font-light leading-relaxed mb-6 font-sans">
                          {TREATMENTS_DETAILED['rhinoplasty'].summary}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-[#C9A47F]/15 flex items-center justify-between text-xs text-[#C9A47F]">
                        <span className="uppercase tracking-widest text-[11px] font-semibold">
                          Explore Detailed Procedure
                        </span>
                        <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )}

              {/* Facelift & Neck Lift: Vertical Feature (5 cols) */}
              {TREATMENTS_DETAILED['facelift-neck-lift'] && (selectedCategory === 'all' || selectedCategory === 'facial') && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.15 }}
                  className="lg:col-span-5"
                >
                  <Link
                    to="/treatments/facelift-neck-lift"
                    className="group block bg-[#1A1716] border border-[#C9A47F]/30 overflow-hidden hover:border-[#C9A47F] transition-all duration-500 h-full flex flex-col justify-between"
                  >
                    <div className="relative aspect-[4/3] lg:aspect-[1/1] w-full overflow-hidden bg-[#12100F]">
                      <img
                        src={TREATMENTS_DETAILED['facelift-neck-lift'].heroImage}
                        alt="Facelift and Neck Lift"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1A1716] via-transparent to-transparent opacity-85" />
                      
                      <div className="absolute top-4 left-4">
                        <span className="bg-[#0B0B0B]/90 backdrop-blur-md px-3 py-1 border border-[#C9A47F]/40 text-[10px] tracking-widest uppercase text-[#C9A47F]">
                          FACIAL AESTHETICS
                        </span>
                      </div>

                      <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-xs text-[#E0C5A8]">
                        <span className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-[#C9A47F]" />
                          {TREATMENTS_DETAILED['facelift-neck-lift'].duration}
                        </span>
                        <span className="font-mono text-xs text-[#C9A47F]/80">02</span>
                      </div>
                    </div>

                    <div className="p-7 flex flex-col flex-grow justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-2xl sm:text-3xl font-serif text-[#F6F0E9] group-hover:text-[#C9A47F] transition-colors">
                            Facelift &amp; Neck Lift
                          </h3>
                          <div className="w-9 h-9 rounded-full border border-[#C9A47F]/40 flex items-center justify-center text-[#C9A47F] group-hover:bg-[#C9A47F] group-hover:text-[#0B0B0B] transition-all">
                            <ArrowUpRight className="w-4 h-4" />
                          </div>
                        </div>
                        <p className="text-xs uppercase tracking-wider text-[#C9A47F] mb-3">
                          {TREATMENTS_DETAILED['facelift-neck-lift'].tagline}
                        </p>
                        <p className="text-xs sm:text-sm text-[#AFA89F] font-light leading-relaxed mb-6 font-sans">
                          {TREATMENTS_DETAILED['facelift-neck-lift'].summary}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-[#C9A47F]/15 flex items-center justify-between text-xs text-[#C9A47F]">
                        <span className="uppercase tracking-widest text-[11px] font-semibold">
                          Explore Detailed Procedure
                        </span>
                        <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )}
            </div>

            {/* Row 2: Mid-Gallery Architectural Statement Banner */}
            <div className="p-8 sm:p-12 bg-gradient-to-r from-[#171413] via-[#24201E] to-[#171413] border border-[#C9A47F]/30 relative overflow-hidden">
              <div className="max-w-3xl">
                <span className="text-[10px] font-sans tracking-[0.25em] text-[#C9A47F] uppercase font-semibold block mb-2">
                  THE SURGICAL STANDARD
                </span>
                <p className="font-serif italic text-xl sm:text-2xl md:text-3xl text-[#F6F0E9] leading-snug mb-4">
                  &ldquo;Aesthetic surgery should never announce itself. True mastery is the quiet restoration of harmony.&rdquo;
                </p>
                <p className="text-xs text-[#AFA89F] font-sans tracking-wider uppercase">
                  Dr. Samik Sharma · Senior Consultant Plastic &amp; Aesthetic Surgeon
                </p>
              </div>
            </div>

            {/* Row 3: 3-Column Asymmetric Grid for Eyelid, Liposuction, Tummy Tuck */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              
              {/* Eyelid Surgery */}
              {TREATMENTS_DETAILED['eyelid-surgery'] && (selectedCategory === 'all' || selectedCategory === 'facial') && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <Link
                    to="/treatments/eyelid-surgery"
                    className="group block bg-[#1A1716] border border-[#C9A47F]/25 overflow-hidden hover:border-[#C9A47F] transition-all duration-500 h-full flex flex-col justify-between"
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#12100F]">
                      <img
                        src={TREATMENTS_DETAILED['eyelid-surgery'].heroImage}
                        alt="Eyelid Surgery"
                        className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-700"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1A1716] via-transparent to-transparent opacity-85" />
                      <div className="absolute top-4 left-4">
                        <span className="bg-[#0B0B0B]/90 px-2.5 py-1 text-[10px] tracking-widest uppercase text-[#C9A47F] border border-[#C9A47F]/30">
                          PERIORBITAL
                        </span>
                      </div>
                    </div>

                    <div className="p-6 flex flex-col flex-grow justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-2xl font-serif text-[#F6F0E9] group-hover:text-[#C9A47F] transition-colors">
                            Eyelid Surgery
                          </h3>
                          <ArrowUpRight className="w-4 h-4 text-[#C9A47F]" />
                        </div>
                        <p className="text-xs uppercase tracking-wider text-[#C9A47F] mb-3">
                          {TREATMENTS_DETAILED['eyelid-surgery'].tagline}
                        </p>
                        <p className="text-xs text-[#AFA89F] font-light leading-relaxed mb-6">
                          {TREATMENTS_DETAILED['eyelid-surgery'].summary}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-[#C9A47F]/15 flex items-center justify-between text-xs text-[#C9A47F]">
                        <span className="uppercase tracking-wider text-[11px]">View Protocol</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )}

              {/* Liposuction */}
              {TREATMENTS_DETAILED['liposuction'] && (selectedCategory === 'all' || selectedCategory === 'body') && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <Link
                    to="/treatments/liposuction"
                    className="group block bg-[#1A1716] border border-[#C9A47F]/25 overflow-hidden hover:border-[#C9A47F] transition-all duration-500 h-full flex flex-col justify-between"
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#12100F]">
                      <img
                        src={TREATMENTS_DETAILED['liposuction'].heroImage}
                        alt="VASER Liposuction"
                        className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-700"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1A1716] via-transparent to-transparent opacity-85" />
                      <div className="absolute top-4 left-4">
                        <span className="bg-[#0B0B0B]/90 px-2.5 py-1 text-[10px] tracking-widest uppercase text-[#C9A47F] border border-[#C9A47F]/30">
                          BODY CONTOURING
                        </span>
                      </div>
                    </div>

                    <div className="p-6 flex flex-col flex-grow justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-2xl font-serif text-[#F6F0E9] group-hover:text-[#C9A47F] transition-colors">
                            Liposuction
                          </h3>
                          <ArrowUpRight className="w-4 h-4 text-[#C9A47F]" />
                        </div>
                        <p className="text-xs uppercase tracking-wider text-[#C9A47F] mb-3">
                          {TREATMENTS_DETAILED['liposuction'].tagline}
                        </p>
                        <p className="text-xs text-[#AFA89F] font-light leading-relaxed mb-6">
                          {TREATMENTS_DETAILED['liposuction'].summary}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-[#C9A47F]/15 flex items-center justify-between text-xs text-[#C9A47F]">
                        <span className="uppercase tracking-wider text-[11px]">View Protocol</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )}

              {/* Tummy Tuck */}
              {TREATMENTS_DETAILED['tummy-tuck'] && (selectedCategory === 'all' || selectedCategory === 'body') && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Link
                    to="/treatments/tummy-tuck"
                    className="group block bg-[#1A1716] border border-[#C9A47F]/25 overflow-hidden hover:border-[#C9A47F] transition-all duration-500 h-full flex flex-col justify-between"
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#12100F]">
                      <img
                        src={TREATMENTS_DETAILED['tummy-tuck'].heroImage}
                        alt="Tummy Tuck Abdominoplasty"
                        className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-700"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1A1716] via-transparent to-transparent opacity-85" />
                      <div className="absolute top-4 left-4">
                        <span className="bg-[#0B0B0B]/90 px-2.5 py-1 text-[10px] tracking-widest uppercase text-[#C9A47F] border border-[#C9A47F]/30">
                          BODY CONTOURING
                        </span>
                      </div>
                    </div>

                    <div className="p-6 flex flex-col flex-grow justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-2xl font-serif text-[#F6F0E9] group-hover:text-[#C9A47F] transition-colors">
                            Tummy Tuck
                          </h3>
                          <ArrowUpRight className="w-4 h-4 text-[#C9A47F]" />
                        </div>
                        <p className="text-xs uppercase tracking-wider text-[#C9A47F] mb-3">
                          {TREATMENTS_DETAILED['tummy-tuck'].tagline}
                        </p>
                        <p className="text-xs text-[#AFA89F] font-light leading-relaxed mb-6">
                          {TREATMENTS_DETAILED['tummy-tuck'].summary}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-[#C9A47F]/15 flex items-center justify-between text-xs text-[#C9A47F]">
                        <span className="uppercase tracking-wider text-[11px]">View Protocol</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )}

            </div>

            {/* Row 4: Hair Restoration & Reconstructive Surgery Spotlight */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              
              {/* Hair Transplant (7 cols) */}
              {TREATMENTS_DETAILED['hair-transplant'] && (selectedCategory === 'all' || selectedCategory === 'hair') && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="lg:col-span-7"
                >
                  <Link
                    to="/treatments/hair-transplant"
                    className="group block bg-[#1A1716] border border-[#C9A47F]/30 overflow-hidden hover:border-[#C9A47F] transition-all duration-500 h-full flex flex-col justify-between"
                  >
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#12100F]">
                      <img
                        src={TREATMENTS_DETAILED['hair-transplant'].heroImage}
                        alt="Hair Restoration"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1A1716] via-transparent to-transparent opacity-85" />
                      <div className="absolute top-4 left-4">
                        <span className="bg-[#0B0B0B]/90 px-3 py-1 text-[10px] tracking-widest uppercase text-[#C9A47F] border border-[#C9A47F]/40">
                          HAIR RESTORATION
                        </span>
                      </div>
                    </div>

                    <div className="p-7 flex flex-col flex-grow justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-2xl sm:text-3xl font-serif text-[#F6F0E9] group-hover:text-[#C9A47F] transition-colors">
                            Hair Transplant
                          </h3>
                          <ArrowUpRight className="w-4 h-4 text-[#C9A47F]" />
                        </div>
                        <p className="text-xs uppercase tracking-wider text-[#C9A47F] mb-3">
                          {TREATMENTS_DETAILED['hair-transplant'].tagline}
                        </p>
                        <p className="text-xs sm:text-sm text-[#AFA89F] font-light leading-relaxed mb-6 font-sans">
                          {TREATMENTS_DETAILED['hair-transplant'].summary}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-[#C9A47F]/15 flex items-center justify-between text-xs text-[#C9A47F]">
                        <span className="uppercase tracking-widest text-[11px] font-semibold">
                          Explore Detailed Procedure
                        </span>
                        <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )}

              {/* Reconstructive Surgery Spotlight Card (5 cols) */}
              {(selectedCategory === 'all' || selectedCategory === 'reconstructive') && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.15 }}
                  className="lg:col-span-5 bg-[#171413] border border-[#C9A47F]/30 p-7 sm:p-9 flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-[16/10] w-full overflow-hidden mb-6 border border-[#C9A47F]/20">
                      <img
                        src="/src/assets/images/treatment_reconstructive_1794217995258.jpg"
                        alt="Reconstructive Surgery"
                        className="w-full h-full object-cover"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#171413] via-transparent to-transparent opacity-70" />
                      <div className="absolute top-3 left-3 bg-[#0B0B0B]/90 px-2.5 py-1 text-[10px] tracking-widest uppercase text-[#C9A47F] border border-[#C9A47F]/30">
                        RECONSTRUCTIVE SURGERY
                      </div>
                    </div>

                    <span className="text-[10px] font-sans tracking-[0.2em] text-[#C9A47F] uppercase font-semibold block mb-1">
                      CLINICAL SPECIALTY
                    </span>
                    <h3 className="text-2xl font-serif text-[#F6F0E9] font-normal mb-3">
                      Plastic &amp; Reconstructive Surgery
                    </h3>
                    <p className="text-xs text-[#AFA89F] font-light leading-relaxed mb-6 font-sans">
                      Specialized trauma reconstruction, scar revision, post-oncologic defects, and congenital correction performed within the full tertiary infrastructure of Shalby Hospital, Mohali.
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#C9A47F]/20">
                    <button
                      onClick={() => onOpenBooking('Plastic & Reconstructive Surgery')}
                      className="w-full py-3 bg-[#24201E] hover:bg-[#C9A47F] text-[#C9A47F] hover:text-[#0B0B0B] border border-[#C9A47F]/40 text-xs font-sans tracking-widest uppercase font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Inquire for Reconstructive Consultation</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              )}

            </div>

            {/* Row 5: Dynamic Treatments Published via CMS (if additional procedures exist) */}
            {filteredAdditional.length > 0 && (
              <div className="pt-10 border-t border-[#C9A47F]/20 space-y-8">
                <div>
                  <span className="text-[10px] font-sans tracking-[0.25em] text-[#C9A47F] uppercase font-semibold block mb-2">
                    FURTHER CLINICAL DISCIPLINES
                  </span>
                  <h3 className="text-3xl font-serif text-[#F6F0E9] font-light">
                    Specialized Procedures
                  </h3>
                  <p className="text-xs text-[#AFA89F] mt-1 max-w-xl">
                    Additional personalized procedures authored and performed by Dr. Samik Sharma at Shalby Hospital Mohali.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredAdditional.map((item, idx) => (
                    <motion.div
                      key={item.id || item.slug || idx}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: idx * 0.1 }}
                    >
                      <Link
                        to={`/treatments/${item.slug || item.id}`}
                        className="group block bg-[#1A1716] border border-[#C9A47F]/25 overflow-hidden hover:border-[#C9A47F] transition-all duration-500 h-full flex flex-col justify-between"
                      >
                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#12100F]">
                          <img
                            src={item.heroImage || '/src/assets/images/treatments_hero_sculptural_1794217994345.jpg'}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-700"
                            loading="lazy"
                            onError={(e) => ((e.target as any).src = '/src/assets/images/treatments_hero_sculptural_1794217994345.jpg')}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1716] via-transparent to-transparent opacity-85" />
                          <div className="absolute top-4 left-4">
                            <span className="bg-[#0B0B0B]/90 px-2.5 py-1 text-[10px] tracking-widest uppercase text-[#C9A47F] border border-[#C9A47F]/30">
                              {item.category?.toUpperCase() || 'AESTHETIC SURGERY'}
                            </span>
                          </div>
                          {item.duration && (
                            <div className="absolute bottom-3 left-4 text-xs text-[#E0C5A8] flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-[#C9A47F]" />
                              <span>{item.duration}</span>
                            </div>
                          )}
                        </div>

                        <div className="p-6 flex flex-col flex-grow justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-2xl font-serif text-[#F6F0E9] group-hover:text-[#C9A47F] transition-colors">
                                {item.title}
                              </h3>
                              <ArrowUpRight className="w-4 h-4 text-[#C9A47F]" />
                            </div>
                            {item.tagline && (
                              <p className="text-xs uppercase tracking-wider text-[#C9A47F] mb-3">
                                {item.tagline}
                              </p>
                            )}
                            <p className="text-xs text-[#AFA89F] font-light leading-relaxed mb-6 line-clamp-3">
                              {item.summary}
                            </p>
                          </div>

                          <div className="pt-3 border-t border-[#C9A47F]/15 flex items-center justify-between text-xs text-[#C9A47F]">
                            <span className="uppercase tracking-wider text-[11px]">View Protocol</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      </section>

      {/* 4. Final Consultation Section */}
      <FinalCTA onOpenBooking={() => onOpenBooking()} />

    </div>
  );
};
