/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  ArrowLeft,
  Calendar,
  Share2,
  Check,
  Building2,
  Award,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { getBlogPostBySlug, BlogPost } from '../lib/firestoreService';
import { FinalCTA } from '../components/FinalCTA';

interface BlogDetailPageProps {
  onOpenBooking: (treatmentTitle?: string) => void;
}

export const BlogDetailPage: React.FC<BlogDetailPageProps> = ({ onOpenBooking }) => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (slug) {
      setLoading(true);
      getBlogPostBySlug(slug)
        .then((found) => {
          setPost(found);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [slug]);

  useEffect(() => {
    if (post) {
      document.title = `${post.title} | Dr. Samik Sharma Journal`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc && post.excerpt) {
        metaDesc.setAttribute('content', post.excerpt);
      }
    }
  }, [post]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] text-[#F6F0E9] flex items-center justify-center pt-24">
        <div className="w-8 h-8 border-2 border-[#C9A47F]/40 border-t-[#C9A47F] rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  // Render markdown content to formatted paragraphs and headers
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();

      if (trimmed.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-xl sm:text-2xl font-serif font-light text-[#F6F0E9] mt-8 mb-3">
            {trimmed.replace('### ', '')}
          </h3>
        );
      }
      if (trimmed.startsWith('## ')) {
        return (
          <h2 key={idx} className="text-2xl sm:text-3xl font-serif font-light text-[#F6F0E9] mt-10 mb-4 border-b border-white/5 pb-2">
            {trimmed.replace('## ', '')}
          </h2>
        );
      }
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const text = trimmed.replace(/^[-*]\s+/, '');
        return (
          <li key={idx} className="ml-5 text-sm sm:text-base text-[#D4CDC5] font-light leading-relaxed list-disc my-1">
            {renderBoldText(text)}
          </li>
        );
      }
      if (/^\d+\.\s/.test(trimmed)) {
        const text = trimmed.replace(/^\d+\.\s+/, '');
        return (
          <li key={idx} className="ml-5 text-sm sm:text-base text-[#D4CDC5] font-light leading-relaxed list-decimal my-1">
            {renderBoldText(text)}
          </li>
        );
      }
      if (!trimmed) {
        return <div key={idx} className="h-4" />;
      }
      return (
        <p key={idx} className="text-sm sm:text-base text-[#AFA89F] font-light leading-relaxed mb-4">
          {renderBoldText(trimmed)}
        </p>
      );
    });
  };

  const renderBoldText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="text-[#F6F0E9] font-medium">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-[#F6F0E9] pt-24 sm:pt-28 min-w-0 font-sans selection:bg-[#C9A47F]/30 selection:text-[#F6F0E9]">
      {/* Article Header & Breadcrumbs */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 pb-8">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-xs text-[#AFA89F] hover:text-[#C9A47F] uppercase tracking-wider transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Articles</span>
        </Link>

        <div className="inline-flex items-center gap-2 mb-4">
          <span className="w-6 h-[1px] bg-[#C9A47F]" />
          <span className="text-[11px] font-sans tracking-[0.25em] text-[#C9A47F] uppercase font-semibold">
            {post.category}
          </span>
        </div>

        <h1 className="text-[clamp(1.85rem,8.5vw,3rem)] sm:text-4xl md:text-5xl font-serif font-light text-[#F6F0E9] leading-tight mb-6 break-words">
          {post.title}
        </h1>

        {/* Metadata Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-white/5 text-xs text-[#AFA89F]">
          <div className="flex items-center gap-4">
            <span className="text-[#F6F0E9] font-medium">By {post.author || 'Dr. Samik Sharma'}</span>
            <span>·</span>
            <span className="flex items-center gap-1.5 font-mono">
              <Clock className="w-3.5 h-3.5 text-[#C9A47F]" />
              {post.readTime}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5 font-mono">
              <Calendar className="w-3.5 h-3.5 text-[#C9A47F]" />
              {post.publishedAt
                ? new Date(post.publishedAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'Clinical Bulletin'}
            </span>
          </div>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1C1817] border border-white/10 hover:border-[#C9A47F] text-xs text-[#C9A47F] transition-colors cursor-pointer"
            title="Share article link"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied Link</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Guide</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Featured Cover Image */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-12">
        <div className="aspect-[16/10] sm:aspect-[16/8] overflow-hidden border border-[#C9A47F]/20 relative bg-[#141211]">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover filter brightness-[90%]"
          />
        </div>
      </div>

      {/* Article Body */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pb-16">
        {/* Executive Excerpt Callout */}
        <div className="p-6 bg-[#181514] border-l-2 border-[#C9A47F] mb-8 text-sm sm:text-base text-[#F6F0E9] font-serif italic leading-relaxed">
          &quot;{post.excerpt}&quot;
        </div>

        {/* Content stream */}
        <div className="article-body space-y-2">{renderFormattedContent(post.content)}</div>

        {/* Author Bio Card */}
        <div className="mt-16 p-6 sm:p-8 bg-[#141211] border border-[#C9A47F]/30 space-y-4">
          <div className="flex items-center gap-2 text-xs text-[#C9A47F] uppercase tracking-wider font-semibold">
            <Award className="w-4 h-4" />
            <span>Clinical Contributor</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-14 h-14 rounded-full border border-[#C9A47F] flex items-center justify-center font-serif text-lg text-[#C9A47F] bg-[#24211E] shrink-0">
              SS
            </div>
            <div>
              <h3 className="text-xl font-serif text-[#F6F0E9]">Dr. Samik Sharma</h3>
              <p className="text-xs text-[#AFA89F]">
                Senior Consultant Plastic, Cosmetic &amp; Reconstructive Surgeon
              </p>
              <p className="text-[11px] text-[#7C766F] font-mono mt-0.5">
                Shalby Multi-Specialty Hospital, Sector 71, Mohali, Punjab
              </p>
            </div>
          </div>
          <p className="text-xs text-[#AFA89F] font-light leading-relaxed pt-2 border-t border-white/5">
            Trained across leading surgical institutions with UK fellowships in aesthetic and facial contouring surgery. Dr. Sharma delivers patient-centered reconstructive and cosmetic outcomes prioritizing long-term anatomical stability.
          </p>
        </div>

        {/* Next Steps CTA */}
        <div className="mt-8 p-6 bg-[#1C1817] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-base font-serif text-[#F6F0E9]">Considering a Procedure?</h4>
            <p className="text-xs text-[#AFA89F] mt-0.5">
              Schedule a confidential evaluation with Dr. Sharma at Shalby Hospital, Mohali.
            </p>
          </div>
          <button
            onClick={() => onOpenBooking(post.category)}
            className="px-6 py-3 bg-[#C9A47F] text-[#0B0B0B] text-xs font-semibold uppercase tracking-[0.16em] hover:bg-[#DFCAAF] transition-colors cursor-pointer shrink-0"
          >
            Book Consultation
          </button>
        </div>
      </main>

      {/* Global Closing CTA */}
      <FinalCTA onOpenBooking={() => onOpenBooking()} />
    </div>
  );
};
