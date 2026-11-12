/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { TREATMENTS_DETAILED, CLINIC_INFO } from '../data/surgeryData';
import {
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  Clock,
  Activity,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Calendar,
  Building2,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { getTreatmentBySlug } from '../lib/firestoreService';

interface TreatmentDetailPageProps {
  onOpenBooking: (treatmentTitle?: string) => void;
}

export const TreatmentDetailPage: React.FC<TreatmentDetailPageProps> = ({ onOpenBooking }) => {
  const { slug } = useParams<{ slug: string }>();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [treatment, setTreatment] = useState<any>(slug ? TREATMENTS_DETAILED[slug] || null : null);

  useEffect(() => {
    if (slug) {
      getTreatmentBySlug(slug).then((remote) => {
        if (remote) {
          const base = TREATMENTS_DETAILED[slug] || {};
          setTreatment({
            ...base,
            ...remote,
            heroImage: (remote as any).heroImage || remote.image || base.heroImage,
            summary: (remote as any).shortDescription || remote.summary || base.summary,
            recoverySummary: (remote as any).resultsTimeline || remote.recovery || base.recoverySummary,
            clinicalApproach: (remote as any).technique || remote.clinicalApproach || base.clinicalApproach,
            understanding: base.understanding || {
              leadParagraph: (remote as any).overview || remote.summary || '',
              anatomicalDepth: (remote as any).technique || '',
              surgicalTechniques: (remote as any).benefits || [],
            },
            candidacy: base.candidacy || {
              overview: 'Careful candidacy assessment conducted during clinical examination.',
              goodCandidates: (remote as any).idealCandidate || [],
              carefulConsiderations: 'Suitability determined following in-person examination.',
            },
            recovery: base.recovery || {
              intro: (remote as any).resultsTimeline || 'Gradual natural recovery guided by Dr. Sharma.',
              phases: [],
              guidelines: (remote as any).postOpCare || [],
              variabilityDisclaimer: 'Every patient heals at an individualized pace.',
            },
            faqs: (remote as any).faqs || base.faqs || [],
            seo: {
              metaTitle: (remote as any).seoTitle || `${remote.title} | Dr. Samik Sharma, Plastic Surgeon Mohali`,
              metaDescription: (remote as any).seoDescription || remote.summary || '',
              canonicalPath: `/treatments/${slug}`,
            },
          });
        }
      });
    }
  }, [slug]);

  useEffect(() => {
    if (treatment) {
      document.title = treatment.seo?.metaTitle || `${treatment.title} | Dr. Samik Sharma, Plastic Surgeon Mohali`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc && treatment.seo?.metaDescription) {
        metaDesc.setAttribute('content', treatment.seo.metaDescription);
      }
    }
  }, [treatment]);

  if (!treatment) {
    return <Navigate to="/treatments" replace />;
  }

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-[#F6F0E9] pt-24 sm:pt-28">
      
      {/* 1. Cinematic Hero with Tasteful Photograph & Elegant Serif Title */}
      <section className="relative min-h-[70vh] lg:min-h-[80vh] flex items-end pb-16 sm:pb-20 overflow-hidden border-b border-[#C9A47F]/20">
        
        {/* Full-Bleed Photographic Background */}
        <div className="absolute inset-0 z-0">
          <img
            src={treatment.heroImage}
            alt={treatment.title}
            className="w-full h-full object-cover object-center filter brightness-[45%] contrast-[115%]"
            loading="eager"
            referrerPolicy="no-referrer"
          />
          {/* Subtle chiaroscuro gradients */}
          <div className="absolute inset-0 bg-[#0B0B0B]/60 backdrop-blur-[0.5px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B] via-[#0B0B0B]/40 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(201,164,127,0.1)_0%,transparent_65%)] pointer-events-none" />
        </div>

        {/* Hero Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
            className="max-w-3xl"
          >
            {/* 2. Breadcrumb & Subtitle indicating category */}
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2.5 mb-5 text-xs font-sans tracking-[0.16em] uppercase text-[#AFA89F]">
              <Link to="/" className="hover:text-[#C9A47F] transition-colors">
                Home
              </Link>
              <span className="text-[#C9A47F]/60">/</span>
              <Link to="/treatments" className="hover:text-[#C9A47F] transition-colors">
                Treatments
              </Link>
              <span className="text-[#C9A47F]/60">/</span>
              <span className="text-[#C9A47F] font-semibold">{treatment.categoryLabel}</span>
            </nav>

            {/* Large Elegant Serif Procedure Title */}
            <h1 className="text-[clamp(2.1rem,9vw,3rem)] sm:text-6xl md:text-7xl lg:text-[5rem] font-serif font-light text-[#F6F0E9] leading-[1.05] tracking-tight mb-4 text-balance break-words">
              {treatment.title}
            </h1>

            {/* Subtitle Tagline */}
            <p className="text-base sm:text-xl font-serif text-[#C9A47F] italic tracking-wide mb-8">
              {treatment.tagline}
            </p>

            {/* Quick Consultation CTA */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                onClick={() => onOpenBooking(treatment.title)}
                type="button"
                className="px-8 py-4 bg-[#C9A47F] text-[#0B0B0B] text-xs font-sans font-bold tracking-[0.18em] uppercase hover:bg-[#DFCAAF] transition-all duration-300 shadow-xl shadow-[#C9A47F]/15 flex items-center justify-center gap-3 cursor-pointer group"
              >
                <span>Consult for {treatment.title}</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform" />
              </button>

              <div className="px-5 py-3.5 border border-[#C9A47F]/30 bg-[#0B0B0B]/70 backdrop-blur-md text-xs text-[#AFA89F] flex items-center gap-3">
                <Building2 className="w-4 h-4 text-[#C9A47F] shrink-0" />
                <span>Shalby Hospital, Mohali</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Specifications Strip */}
      <section className="py-6 bg-[#171413] border-b border-[#C9A47F]/20 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-4 gap-5 sm:gap-6">
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-[#C9A47F] shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#AFA89F]">Typical Duration</p>
                <p className="text-[#F6F0E9] font-medium">{treatment.duration}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Activity className="w-4 h-4 text-[#C9A47F] shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#AFA89F]">Anesthesia</p>
                <p className="text-[#F6F0E9] font-medium">{treatment.anesthesia}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-[#C9A47F] shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#AFA89F]">Accreditation</p>
                <p className="text-[#F6F0E9] font-medium">NABH Tertiary OT</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-[#C9A47F] shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#AFA89F]">Initial Downtime</p>
                <p className="text-[#F6F0E9] font-medium">{treatment.recoverySummary}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 space-y-24">
        
        {/* 3. "Understanding the Procedure" */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5">
            <span className="text-[10px] font-sans tracking-[0.25em] text-[#C9A47F] uppercase font-semibold block mb-2">
              SURGICAL PERSPECTIVE
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-light text-[#F6F0E9] mb-4">
              Understanding the Procedure
            </h2>
            <div className="w-12 h-[1px] bg-[#C9A47F]/40 mb-6" />
            <p className="text-xs text-[#AFA89F] font-light leading-relaxed">
              Dr. Samik Sharma approaches every operation with an architectural philosophy: structural preservation, tension-free healing, and undetectable refinement.
            </p>
          </div>

          <div className="lg:col-span-7 bg-[#1A1716] border border-[#C9A47F]/25 p-7 sm:p-9 space-y-6 shadow-xl">
            <p className="text-sm sm:text-base text-[#F6F0E9]/90 font-light leading-relaxed font-sans">
              {treatment.understanding.leadParagraph}
            </p>

            <p className="text-xs sm:text-sm text-[#AFA89F] font-light leading-relaxed font-sans">
              {treatment.understanding.anatomicalDepth}
            </p>

            <div className="pt-6 border-t border-[#C9A47F]/20">
              <h3 className="text-xs uppercase tracking-[0.18em] text-[#C9A47F] font-semibold mb-4">
                Clinical Techniques &amp; Methodology
              </h3>
              <div className="space-y-3">
                {treatment.understanding.surgicalTechniques.map((tech: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 text-xs sm:text-[13px] text-[#F6F0E9]/85">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#C9A47F] mt-2 shrink-0" />
                    <span>{tech}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 4. "Who May Be a Suitable Candidate?" */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5">
            <span className="text-[10px] font-sans tracking-[0.25em] text-[#C9A47F] uppercase font-semibold block mb-2">
              CLINICAL SUITABILITY
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-light text-[#F6F0E9] mb-4">
              Who May Be a Suitable Candidate?
            </h2>
            <div className="w-12 h-[1px] bg-[#C9A47F]/40 mb-6" />
            <p className="text-xs text-[#AFA89F] font-light leading-relaxed">
              Suitability is determined during a private anatomical examination with Dr. Sharma, weighing patient goals, tissue characteristics, and overall medical health.
            </p>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="bg-[#1A1716] border border-[#C9A47F]/25 p-7 sm:p-9 shadow-xl">
              <p className="text-sm text-[#F6F0E9]/90 font-light leading-relaxed mb-6">
                {treatment.candidacy.overview}
              </p>

              <div className="space-y-3 mb-8">
                {treatment.candidacy.goodCandidates.map((crit: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 text-xs sm:text-[13px] text-[#AFA89F]">
                    <Check className="w-4 h-4 text-[#C9A47F] shrink-0 mt-0.5" />
                    <span>{crit}</span>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-[#12100F] border border-[#C9A47F]/20 text-xs text-[#AFA89F]">
                <strong className="text-[#C9A47F] font-medium">Consideration Notice: </strong>
                {treatment.candidacy.carefulConsiderations}
              </div>
            </div>
          </div>
        </section>

        {/* 5. "The Consultation & Treatment Journey" (Visually Elegant Numbered Timeline) */}
        <section>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[10px] font-sans tracking-[0.25em] text-[#C9A47F] uppercase font-semibold block mb-2">
              PATIENT PROTOCOL
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-light text-[#F6F0E9] mb-4">
              The Consultation &amp; Treatment Journey
            </h2>
            <div className="w-12 h-[1px] bg-[#C9A47F]/40 mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {treatment.journey.map((step: any) => (
              <div
                key={step.step}
                className="bg-[#1A1716] border border-[#C9A47F]/20 p-6 flex flex-col justify-between hover:border-[#C9A47F]/60 transition-colors shadow-lg"
              >
                <div>
                  <div className="font-mono text-2xl text-[#C9A47F] mb-3">
                    {step.step}
                  </div>
                  <h3 className="text-base font-serif text-[#F6F0E9] font-medium mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs text-[#AFA89F] font-light leading-relaxed font-sans">
                    {step.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-white/5 flex items-center gap-1.5 text-[10px] text-[#C9A47F] uppercase tracking-wider">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Verified Pathway</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6. "Recovery & Considerations" */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5">
            <span className="text-[10px] font-sans tracking-[0.25em] text-[#C9A47F] uppercase font-semibold block mb-2">
              POST-OPERATIVE PROTOCOL
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-light text-[#F6F0E9] mb-4">
              Recovery &amp; Considerations
            </h2>
            <div className="w-12 h-[1px] bg-[#C9A47F]/40 mb-6" />
            <p className="text-xs text-[#AFA89F] font-light leading-relaxed">
              Every surgical healing trajectory is individualized. We emphasize conservative expectations, guided milestone checkups, and transparent risk education.
            </p>
          </div>

          <div className="lg:col-span-7 space-y-6">
            {/* Recovery Phases Table / Strip */}
            <div className="bg-[#1A1716] border border-[#C9A47F]/25 p-7 sm:p-9 shadow-xl space-y-6">
              <p className="text-xs sm:text-sm text-[#F6F0E9]/90 font-light leading-relaxed">
                {treatment.recovery.intro}
              </p>

              <div className="divide-y divide-white/5 border-y border-[#C9A47F]/20 py-2">
                {treatment.recovery.phases.map((ph: any, idx: number) => (
                  <div key={idx} className="py-4 grid grid-cols-1 sm:grid-cols-12 gap-3 items-start text-xs">
                    <div className="sm:col-span-4 font-serif text-sm text-[#C9A47F]">
                      {ph.phase}
                      <p className="text-[10px] font-sans uppercase tracking-wider text-[#AFA89F] font-normal">
                        {ph.timeline}
                      </p>
                    </div>
                    <div className="sm:col-span-8 text-[#AFA89F] font-light leading-relaxed font-sans">
                      {ph.milestones}
                    </div>
                  </div>
                ))}
              </div>

              {/* Guidelines */}
              <div className="space-y-2 pt-2">
                <p className="text-xs uppercase tracking-wider text-[#C9A47F] font-medium">
                  General Post-Operative Directives:
                </p>
                {treatment.recovery.guidelines.map((g: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-[#AFA89F]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#C9A47F] mt-1.5 shrink-0" />
                    <span>{g}</span>
                  </div>
                ))}
              </div>

              {/* Variability Disclaimer */}
              <div className="p-4 bg-[#12100F] border border-white/5 text-[11px] text-[#AFA89F] leading-relaxed">
                <span className="text-[#F6F0E9] font-medium">Biological Variability: </span>
                {treatment.recovery.variabilityDisclaimer}
              </div>
            </div>
          </div>
        </section>

        {/* 7. "Frequently Asked Questions" */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5">
            <span className="text-[10px] font-sans tracking-[0.25em] text-[#C9A47F] uppercase font-semibold block mb-2">
              PATIENT CLARIFICATIONS
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-light text-[#F6F0E9] mb-4">
              Frequently Asked Questions
            </h2>
            <div className="w-12 h-[1px] bg-[#C9A47F]/40 mb-6" />
            <p className="text-xs text-[#AFA89F] font-light leading-relaxed">
              These responses provide educational perspective based on established surgical guidelines. Formal medical advice requires your private consultation.
            </p>
          </div>

          <div className="lg:col-span-7 space-y-4">
            {treatment.faqs.map((faq: any, index: number) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="border border-[#C9A47F]/20 bg-[#161413] overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-white/[0.02] cursor-pointer"
                  >
                    <span className="text-sm sm:text-base font-serif text-[#F6F0E9] font-normal">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#C9A47F] shrink-0 transition-transform duration-300 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 pt-1 text-xs sm:text-[13px] text-[#AFA89F] font-light leading-relaxed font-sans border-t border-white/5">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>

      </div>

      {/* 8. Beautiful Final Consultation Banner */}
      <section className="relative py-24 sm:py-32 overflow-hidden border-t border-[#C9A47F]/20">
        <div className="absolute inset-0 z-0">
          <img
            src="/src/assets/images/cta_bronze_silk_1794213538249.jpg"
            alt="Bronze Silk Background"
            className="w-full h-full object-cover filter brightness-[35%] contrast-[120%]"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-[#0B0B0B]/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B] via-transparent to-[#0B0B0B]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-[10px] font-sans tracking-[0.25em] text-[#C9A47F] uppercase font-semibold block mb-3">
            TERTIARY CONSULTATION DESK
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif text-[#F6F0E9] font-light mb-6">
            Consult Dr. Samik Sharma for{' '}
            <span className="italic text-[#C9A47F]">{treatment.title}</span>
          </h2>
          <p className="text-sm text-[#F6F0E9]/80 font-light max-w-xl mx-auto mb-10 font-sans leading-relaxed">
            Personalized clinical assessments hosted at Shalby Hospital, Mohali or via secure teleconsultation for outstation patients.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onOpenBooking(treatment.title)}
              type="button"
              className="px-9 py-4 bg-[#C9A47F] text-[#0B0B0B] text-xs font-sans font-bold tracking-[0.18em] uppercase hover:bg-[#DFCAAF] transition-all duration-300 shadow-2xl cursor-pointer"
            >
              Request Private Consultation
            </button>
            <Link
              to="/treatments"
              className="px-7 py-4 border border-[#C9A47F]/40 text-[#F6F0E9] text-xs font-sans font-medium tracking-[0.16em] uppercase hover:border-[#C9A47F] transition-all"
            >
              Explore All Treatments
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};
