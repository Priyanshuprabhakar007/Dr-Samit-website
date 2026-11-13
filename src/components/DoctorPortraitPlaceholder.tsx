/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface DoctorPortraitPlaceholderProps {
  className?: string;
}

/**
 * Read-only public fallback shown until an administrator publishes a portrait.
 * Never accept file uploads from public-facing site components.
 */
export const DoctorPortraitPlaceholder: React.FC<DoctorPortraitPlaceholderProps> = ({
  className = '',
}) => {
  return (
    <div
      role="img"
      aria-label="Dr. Samik Sharma profile portrait placeholder"
      className={`relative aspect-[3/4] w-full overflow-hidden bg-gradient-to-b from-[#201B17] via-[#171412] to-[#0B0B0B] border border-[#C9A47F]/25 ${className}`}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,rgba(201,164,127,0.16),transparent_68%)]"
      />
      <div aria-hidden="true" className="absolute inset-5 border border-[#C9A47F]/20" />
      <div
        aria-hidden="true"
        className="absolute -right-20 top-1/2 h-[440px] w-[440px] -translate-y-1/2 rounded-full border border-[#C9A47F]/10"
      />
      <div className="relative flex h-full flex-col items-center justify-center gap-4 px-5 text-center">
        <span className="font-serif text-[clamp(3.5rem,9vw,6rem)] font-normal tracking-[-0.05em] text-[#D4B08D]">SS</span>
        <span aria-hidden="true" className="h-px w-16 bg-[#C9A47F]/65" />
        <span className="font-serif text-2xl sm:text-3xl text-[#F6F0E9]">Dr. Samik Sharma</span>
        <span className="max-w-[230px] text-[10px] font-medium uppercase tracking-[0.17em] leading-relaxed text-[#B99B7C]">
          Plastic &amp; Aesthetic Surgery
        </span>
      </div>
    </div>
  );
};
