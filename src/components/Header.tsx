/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  onOpenBooking: (preferredTreatment?: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenBooking }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const location = useLocation();
  const isHome = location.pathname === '/';
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const menuCloseRef = useRef<HTMLButtonElement>(null);

  // Prevent the page from scrolling behind the navigation drawer.
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    menuCloseRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileMenuOpen(false);
    };
    const onResize = () => {
      if (window.innerWidth >= 1024) setMobileMenuOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onResize);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onResize);
      menuTriggerRef.current?.focus();
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'About', href: isHome ? '#about' : '/#about' },
    { label: 'Treatments', href: '/treatments' },
    { label: 'Journal', href: '/blog' },
    { label: 'Expertise', href: isHome ? '#approach' : '/#approach' },
    { label: 'Patient Guide', href: isHome ? '#guide' : '/#guide' },
    { label: 'Contact', href: isHome ? '#contact' : '/#contact' },
  ];

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
          isScrolled
            ? 'bg-[#0B0B0B]/85 backdrop-blur-xl border-b border-[#C9A47F]/20 py-3.5 shadow-2xl shadow-black/80'
            : 'bg-transparent py-5 sm:py-6 border-b border-white/5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-2 sm:gap-4 xl:gap-8">
            
            {/* Left: Brand Monogram and Identity */}
            <Link
              to="/"
              className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 group focus:outline-none focus-visible:ring-1 focus-visible:ring-[#C9A47F]"
              aria-label="Dr. Samik Sharma - Plastic & Aesthetic Surgeon"
            >
              {/* Elegant SS Monogram Badge */}
              <div className="relative shrink-0 w-9 sm:w-11 h-9 sm:h-11 border border-[#C9A47F]/50 rounded-[1px] flex items-center justify-center bg-gradient-to-br from-[#24201E] to-[#12100F] shadow-md group-hover:border-[#C9A47F] group-hover:shadow-[0_0_15px_rgba(201,164,127,0.2)] transition-all duration-300">
                <span className="font-serif text-base sm:text-lg font-light tracking-wider text-[#C9A47F] select-none">
                  SS
                </span>
                <span className="absolute -bottom-0.5 -right-0.5 w-1 h-1 bg-[#C9A47F] opacity-90" />
              </div>

              <div className="flex flex-col min-w-0">
                <span className="text-[15px] sm:text-[19px] md:text-[21px] font-serif font-semibold tracking-[0.075em] text-[#F6F0E9] group-hover:text-white transition-colors duration-200 leading-tight uppercase">
                  DR. SAMIK SHARMA
                </span>
                <span className="text-[9px] sm:text-[10px] font-sans tracking-[0.19em] text-[#C9A47F] uppercase font-light">
                  PLASTIC &amp; AESTHETIC SURGEON
                </span>
              </div>
            </Link>

            {/* Middle: Desktop Navigation Links with Smooth Underline */}
            <nav className="hidden lg:flex items-center gap-8 xl:gap-9 text-[13px] font-sans font-medium tracking-[0.025em] text-[#AFA89F]">
              {navLinks.map((link) => {
                const isAnchor = link.href.includes('#');
                const isActive = link.href === location.pathname;

                return isAnchor ? (
                  <a
                    key={link.label}
                    href={link.href}
                    onMouseEnter={() => setHoveredLink(link.label)}
                    onMouseLeave={() => setHoveredLink(null)}
                    className="relative py-1 text-[#AFA89F] hover:text-[#F6F0E9] transition-colors duration-200 tracking-wider whitespace-nowrap"
                  >
                    <span>{link.label}</span>
                    {hoveredLink === link.label ? (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#C9A47F]"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    ) : (
                      <span className="absolute bottom-0 left-0 right-0 h-[1px] bg-transparent" />
                    )}
                  </a>
                ) : (
                  <Link
                    key={link.label}
                    to={link.href}
                    onMouseEnter={() => setHoveredLink(link.label)}
                    onMouseLeave={() => setHoveredLink(null)}
                    className={`relative py-1 transition-colors duration-200 tracking-wider whitespace-nowrap ${
                      isActive ? 'text-[#F6F0E9]' : 'text-[#AFA89F] hover:text-[#F6F0E9]'
                    }`}
                  >
                    <span>{link.label}</span>
                    {hoveredLink === link.label || isActive ? (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#C9A47F]"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    ) : (
                      <span className="absolute bottom-0 left-0 right-0 h-[1px] bg-transparent" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right: Outlined Consultation CTA & Mobile Toggle */}
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              <button
                onClick={() => onOpenBooking()}
                type="button"
                className="hidden lg:inline-flex items-center gap-2.5 px-5 sm:px-6 py-2.5 text-xs font-sans tracking-[0.14em] uppercase font-semibold text-[#F6F0E9] border border-[#C9A47F] hover:bg-[#C9A47F] hover:text-[#0B0B0B] hover:shadow-[0_0_20px_rgba(201,164,127,0.25)] transition-all duration-300 rounded-none cursor-pointer"
              >
                <span>Book Consultation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {/* Mobile Menu Button */}
              <button
                ref={menuTriggerRef}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                type="button"
                className="lg:hidden w-11 h-11 inline-flex items-center justify-center text-[#F6F0E9] hover:text-[#C9A47F] border border-[#C9A47F]/30 hover:border-[#C9A47F] transition-colors focus:outline-none"
                aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-site-navigation"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Accessible Mobile Menu Drawer with Framer Motion */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 lg:hidden bg-black/85 backdrop-blur-md"
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="fixed top-0 right-0 w-full max-w-sm h-[100dvh] bg-[#12100F] border-l border-[#C9A47F]/30 p-5 sm:p-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] flex flex-col justify-between gap-8 overflow-y-auto overscroll-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              id="mobile-site-navigation"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile site navigation"
            >
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-[#C9A47F]/20">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 border border-[#C9A47F]/60 flex items-center justify-center font-serif text-[#C9A47F] text-sm bg-[#24201E]">
                      SS
                    </div>
                    <div>
                      <p className="font-serif text-sm tracking-widest text-[#F6F0E9]">
                        DR. SAMIK SHARMA
                      </p>
                      <p className="text-[9px] font-sans tracking-[0.2em] text-[#C9A47F] uppercase">
                        PLASTIC SURGEON
                      </p>
                    </div>
                  </div>
                  <button
                    ref={menuCloseRef}
                    onClick={() => setMobileMenuOpen(false)}
                    className="min-w-11 min-h-11 inline-flex items-center justify-center text-[#AFA89F] hover:text-[#F6F0E9] border border-white/10"
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="mt-5 sm:mt-8 flex flex-col gap-1.5 sm:gap-3">
                  {navLinks.map((link, idx) => {
                    const isAnchor = link.href.includes('#');

                    return isAnchor ? (
                      <motion.a
                        key={link.label}
                        href={link.href}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * idx, duration: 0.3 }}
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-lg font-serif tracking-wider text-[#F6F0E9] hover:text-[#C9A47F] transition-colors py-3 border-b border-white/5 flex items-center justify-between"
                      >
                        <span>{link.label}</span>
                        <span className="text-xs text-[#C9A47F]/60 font-mono">0{idx + 1}</span>
                      </motion.a>
                    ) : (
                      <motion.div
                        key={link.label}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * idx, duration: 0.3 }}
                      >
                        <Link
                          to={link.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="text-lg font-serif tracking-wider text-[#F6F0E9] hover:text-[#C9A47F] transition-colors py-3 border-b border-white/5 flex items-center justify-between block"
                        >
                          <span>{link.label}</span>
                          <span className="text-xs text-[#C9A47F]/60 font-mono">0{idx + 1}</span>
                        </Link>
                      </motion.div>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-6 border-t border-[#C9A47F]/20 space-y-4">
                <div className="text-xs text-[#AFA89F] space-y-1.5">
                  <div className="flex items-center gap-2 text-[#C9A47F]">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>Shalby Hospital, Mohali</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#AFA89F]">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-[#C9A47F]" />
                    <span>UK Fellowship Trained Senior Consultant</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenBooking();
                  }}
                  className="w-full py-3.5 bg-[#C9A47F] text-[#0B0B0B] text-xs font-semibold tracking-widest uppercase hover:bg-[#E0C5A8] transition-colors shadow-lg shadow-[#C9A47F]/20 cursor-pointer"
                >
                  Book Consultation
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
