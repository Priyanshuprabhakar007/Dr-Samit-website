/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Home,
  UserCheck,
  Sparkles,
  CalendarCheck,
  BookOpen,
  Image as ImageIcon,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ShieldCheck,
  Bell,
  RefreshCw,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { useAuth, OWNER_EMAIL } from '../../context/AuthContext';
import { getEnquiries, seedInitialDataIfEmpty } from '../../lib/firestoreService';

export const AdminLayout: React.FC = () => {
  const { user, isAdmin, isOwner, loading, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pendingEnquiriesCount, setPendingEnquiriesCount] = useState<number>(0);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileMenuOpen(false);
    };
    const onResize = () => {
      if (window.innerWidth >= 768) setMobileMenuOpen(false);
    };
    document.addEventListener('keydown', onEscape);
    window.addEventListener('resize', onResize);
    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', onEscape);
      window.removeEventListener('resize', onResize);
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/admin/login', { replace: true, state: { from: location.pathname } });
    }
  }, [user, loading, navigate, location]);

  useEffect(() => {
    if (user && isAdmin) {
      // Fetch new enquiries count
      getEnquiries().then((items) => {
        const newCount = items.filter((i) => i.status === 'new').length;
        setPendingEnquiriesCount(newCount);
      }).catch((err) => {
        console.error('Unable to load pending enquiry count:', err);
      });
    }
  }, [user, isAdmin]);

  const handleManualSeed = async () => {
    setIsSeeding(true);
    try {
      await seedInitialDataIfEmpty(user?.email || undefined);
      setSeedSuccess(true);
      setTimeout(() => setSeedSuccess(false), 3000);
    } catch (err) {
      console.error('Seed error:', err);
    } finally {
      setIsSeeding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center text-[#F6F0E9]">
        <div className="w-12 h-12 border-2 border-[#C9A47F]/30 border-t-[#C9A47F] rounded-full animate-spin mb-4" />
        <p className="font-serif text-lg tracking-wider text-[#C9A47F]">DR. SAMIK SHARMA</p>
        <p className="text-xs uppercase tracking-[0.2em] text-[#AFA89F] mt-1 font-sans">
          Authenticating Practice Administrator...
        </p>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#121212] text-[#F6F0E9] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#1C1817] border border-[#C9A47F]/30 p-8 text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#24211E] border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <span className="text-[10px] font-sans tracking-[0.25em] text-[#C9A47F] uppercase font-semibold">
              AUTHORIZATION REQUIRED
            </span>
            <h1 className="text-2xl font-serif text-[#F6F0E9] mt-1">Access Pending Approval</h1>
            <p className="text-xs text-[#AFA89F] mt-2 leading-relaxed">
              Signed in as <span className="text-[#F6F0E9] font-mono">{user.email}</span>.
              <br />
              This Google account does not currently hold administrator privileges for Dr. Samik Sharma&apos;s practice management system.
            </p>
          </div>

          <div className="p-3.5 bg-[#121212] border border-white/5 text-[11px] text-[#AFA89F] text-left">
            <p className="text-[#C9A47F] font-semibold mb-1">Practice Owner Contact:</p>
            <p>To grant admin rights to this email, contact the primary owner at <strong className="text-[#F6F0E9]">{OWNER_EMAIL}</strong> or sign in with the verified owner account.</p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => logout().then(() => navigate('/admin/login'))}
              className="px-5 py-2.5 bg-[#C9A47F] text-[#0B0B0B] text-xs font-semibold uppercase tracking-wider hover:bg-[#DFCAAF] transition-colors cursor-pointer"
            >
              Sign In With Different Account
            </button>
            <Link
              to="/"
              className="px-4 py-2.5 border border-white/10 text-xs text-[#AFA89F] hover:text-[#F6F0E9] uppercase tracking-wider"
            >
              Back to Site
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: 'Overview', to: '/admin', icon: LayoutDashboard, end: true },
    { label: 'Appointments', to: '/admin/appointments', icon: CalendarCheck, badge: pendingEnquiriesCount },
    { label: 'Treatments CMS', to: '/admin/treatments', icon: Sparkles },
    { label: 'Homepage Editor', to: '/admin/homepage', icon: Home },
    { label: 'About Surgeon', to: '/admin/about', icon: UserCheck },
    { label: 'Journal & Blog', to: '/admin/blog', icon: BookOpen },
    { label: 'Media Library', to: '/admin/media', icon: ImageIcon },
    { label: 'Practice Settings', to: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#121212] text-[#F6F0E9] flex flex-col md:flex-row font-sans">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#1C1817] border-b border-[#C9A47F]/20 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full border border-[#C9A47F] flex items-center justify-center text-xs font-serif text-[#C9A47F]">
            SS
          </div>
          <div>
            <p className="font-serif text-sm tracking-wide text-[#F6F0E9]">DR. SAMIK SHARMA</p>
            <p className="text-[9px] uppercase tracking-[0.2em] text-[#C9A47F]">Administration</p>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="w-11 h-11 inline-flex items-center justify-center shrink-0 text-[#C9A47F] hover:text-[#F6F0E9]"
          aria-label={mobileMenuOpen ? "Close admin navigation" : "Open admin navigation"}
          aria-expanded={mobileMenuOpen}
          aria-controls="admin-mobile-navigation"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile backdrop: closes the drawer without navigating. */}
      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Close admin navigation"
          className="fixed inset-0 z-40 bg-black/75 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        id="admin-mobile-navigation"
        className={`fixed md:sticky top-0 left-0 h-[100dvh] md:h-screen w-[min(18rem,85vw)] md:w-64 bg-[#181514] border-r border-[#C9A47F]/20 flex flex-col justify-between overflow-y-auto overscroll-contain z-50 md:z-30 transition-transform duration-300 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Brand Monogram & Header */}
          <div className="p-5 md:p-6 border-b border-[#C9A47F]/20 relative">
            <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 group pr-7">
              <div className="w-10 h-10 shrink-0 rounded-full border border-[#C9A47F] flex items-center justify-center text-sm font-serif text-[#C9A47F] group-hover:bg-[#C9A47F] group-hover:text-[#0B0B0B] transition-colors">
                SS
              </div>
              <div>
                <span className="font-serif text-base tracking-wider text-[#F6F0E9] block font-light">
                  DR. SAMIK SHARMA
                </span>
                <span className="text-[9px] uppercase tracking-[0.22em] text-[#C9A47F] block">
                  PRACTICE CMS &amp; PORTAL
                </span>
              </div>
            </Link>

            {/* Role indicator pill */}
            <div className="mt-4 flex items-center gap-2 px-2.5 py-1.5 bg-[#24211E] border border-[#C9A47F]/30 text-[10px]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C9A47F]" />
              <span className="text-[#C9A47F] font-semibold uppercase tracking-wider">
                {isOwner ? 'Practice Owner' : 'Authorized Surgeon / Admin'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="absolute top-5 right-3 md:hidden w-10 h-10 flex items-center justify-center text-[#C9A47F] border border-[#C9A47F]/30"
            aria-label="Close admin navigation"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 text-xs tracking-wider transition-colors border-l-2 ${
                      isActive
                        ? 'border-[#C9A47F] bg-[#24211E] text-[#C9A47F] font-medium'
                        : 'border-transparent text-[#AFA89F] hover:text-[#F6F0E9] hover:bg-white/5'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-mono bg-[#C9A47F] text-[#0B0B0B] font-bold rounded-full">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[#C9A47F]/20 bg-[#12100F] space-y-3">
          {/* Quick sync button */}
          <button
            onClick={handleManualSeed}
            disabled={isSeeding}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#24211E] hover:bg-[#2F2A27] border border-[#C9A47F]/30 text-[11px] text-[#AFA89F] hover:text-[#C9A47F] transition-colors cursor-pointer"
            title="Ensure default treatments and pages are published in database"
          >
            {seedSuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Database Synced</span>
              </>
            ) : (
              <>
                <RefreshCw className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
                <span>{isSeeding ? 'Syncing Schema...' : 'Sync Clinical Defaults'}</span>
              </>
            )}
          </button>

          {/* User profile & Logout */}
          <div className="flex items-center justify-between pt-1">
            <div className="truncate max-w-[140px]">
              <p className="text-xs text-[#F6F0E9] truncate font-medium">{user.displayName || 'Admin'}</p>
              <p className="text-[10px] text-[#AFA89F] truncate font-mono">{user.email}</p>
            </div>
            <button
              onClick={() => logout().then(() => navigate('/admin/login'))}
              className="p-2 text-[#AFA89F] hover:text-rose-400 hover:bg-white/5 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Public Website Shortcut */}
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 text-[11px] text-[#C9A47F] hover:text-[#DFCAAF] pt-1"
          >
            <span>View Public Website</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#121212]">
        {/* Desktop Top Bar */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-[#181514] border-b border-[#C9A47F]/20 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-[0.2em] text-[#C9A47F] font-semibold">
              Shalby Multi-Specialty Hospital, Mohali
            </span>
            <span className="text-white/20">|</span>
            <span className="text-xs text-[#AFA89F]">Department of Plastic, Cosmetic &amp; Reconstructive Surgery</span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/admin/appointments"
              className="relative p-2 text-[#AFA89F] hover:text-[#C9A47F] transition-colors"
              title="Patient Inquiries"
            >
              <Bell className="w-4 h-4" />
              {pendingEnquiriesCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#C9A47F] animate-pulse" />
              )}
            </Link>

            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#C9A47F]/40 text-xs text-[#C9A47F] hover:bg-[#C9A47F] hover:text-[#0B0B0B] transition-colors"
            >
              <span>Live Site</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            <button
              onClick={() => logout().then(() => navigate('/admin/login'))}
              className="text-xs text-[#AFA89F] hover:text-rose-400 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Dynamic Page Outlet */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
