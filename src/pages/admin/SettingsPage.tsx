/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  UserPlus,
  Trash2,
  Lock,
  Building,
  Phone,
  Mail,
  MapPin,
  Instagram,
  MessageSquare,
} from 'lucide-react';
import {
  getSettings,
  updateSettings,
  getAdminUsers,
  addAdminUser,
  removeAdminUser,
  ClinicSettings,
  AdminUserRecord,
  DEFAULT_SETTINGS,
} from '../../lib/firestoreService';
import { useAuth, OWNER_EMAIL } from '../../context/AuthContext';

export const SettingsPage: React.FC = () => {
  const { user, isOwner } = useAuth();
  const [settings, setSettings] = useState<ClinicSettings>(DEFAULT_SETTINGS);
  const [admins, setAdmins] = useState<AdminUserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // New admin form
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [addingAdmin, setAddingAdmin] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [sett, adminList] = await Promise.all([getSettings(), getAdminUsers()]);
      setSettings(sett);
      setAdmins(adminList);
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setNotification(null);
    try {
      await updateSettings(settings, user?.email || undefined);
      setNotification({
        type: 'success',
        message: 'Practice settings & contact details successfully updated.',
      });
    } catch (err: any) {
      console.error('Error updating settings:', err);
      setNotification({ type: 'error', message: err.message || 'Failed to update settings.' });
    } finally {
      setSavingSettings(false);
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail.trim()) return;

    if (!isOwner) {
      alert('Only the primary Practice Owner can authorize new administrative accounts.');
      return;
    }

    setAddingAdmin(true);
    try {
      // Use clean UID key based on sanitized email or generated ID
      const uidKey = newAdminEmail.trim().toLowerCase().replace(/[^a-zA-Z0-9]/g, '_');
      await addAdminUser(
        {
          uid: uidKey,
          email: newAdminEmail.trim().toLowerCase(),
          displayName: newAdminName.trim() || 'Clinical Admin',
          role: 'admin',
        },
        user?.email || undefined
      );

      setNewAdminEmail('');
      setNewAdminName('');
      setNotification({
        type: 'success',
        message: `Administrator authorization granted to ${newAdminEmail}.`,
      });
      const list = await getAdminUsers();
      setAdmins(list);
    } catch (err: any) {
      console.error('Failed to add admin:', err);
      alert(err.message || 'Failed to authorize administrator.');
    } finally {
      setAddingAdmin(false);
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleRemoveAdmin = async (adminUid: string, adminEmail: string) => {
    if (adminEmail.toLowerCase() === OWNER_EMAIL.toLowerCase()) {
      alert('The root practice owner account cannot be deleted.');
      return;
    }

    if (!isOwner) {
      alert('Only the primary Practice Owner can revoke administrator privileges.');
      return;
    }

    if (!window.confirm(`Revoke administrative access for ${adminEmail}?`)) return;

    try {
      await removeAdminUser(adminUid, user?.email || undefined);
      setNotification({ type: 'success', message: `Revoked access for ${adminEmail}.` });
      const list = await getAdminUsers();
      setAdmins(list);
    } catch (err) {
      console.error('Failed to remove admin:', err);
      alert('Failed to revoke administrator.');
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-xs text-[#AFA89F]">Loading Practice Settings...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-[#C9A47F]/20">
        <div>
          <span className="text-[10px] font-sans tracking-[0.25em] text-[#C9A47F] uppercase font-semibold">
            PRACTICE CONFIGURATION
          </span>
          <h1 className="text-3xl font-serif text-[#F6F0E9] font-light mt-1">
            Clinic Settings &amp; Access Control
          </h1>
          <p className="text-xs text-[#AFA89F] mt-1">
            Hospital contact coordinates, consultation dispatch targets, and verified administrator authorization.
          </p>
        </div>
      </div>

      {notification && (
        <div
          className={`p-3.5 border text-xs flex items-center gap-2.5 ${
            notification.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Hospital Coordinates & Clinical Channels */}
      <form onSubmit={handleSaveSettings} className="bg-[#181514] border border-[#C9A47F]/20 p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div>
            <h2 className="text-xl font-serif text-[#F6F0E9]">Hospital &amp; Practice Details</h2>
            <p className="text-xs text-[#AFA89F]">Location and patient contact coordinates shown on the public site.</p>
          </div>
          <button
            type="submit"
            disabled={savingSettings}
            className="px-6 py-2.5 bg-[#C9A47F] hover:bg-[#DFCAAF] text-[#0B0B0B] text-xs font-semibold uppercase tracking-[0.14em] transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{savingSettings ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-xs uppercase tracking-wider text-[#C9A47F] mb-1 font-medium">
              Hospital Name
            </label>
            <input
              type="text"
              value={settings.hospitalName}
              onChange={(e) => setSettings({ ...settings, hospitalName: e.target.value })}
              className="w-full bg-[#12100F] border border-white/10 p-2.5 text-xs text-[#F6F0E9]"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[#C9A47F] mb-1 font-medium">
              Department
            </label>
            <input
              type="text"
              value={settings.department}
              onChange={(e) => setSettings({ ...settings, department: e.target.value })}
              className="w-full bg-[#12100F] border border-white/10 p-2.5 text-xs text-[#F6F0E9]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs uppercase tracking-wider text-[#C9A47F] mb-1 font-medium">
              Physical Address
            </label>
            <input
              type="text"
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              className="w-full bg-[#12100F] border border-white/10 p-2.5 text-xs text-[#F6F0E9]"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[#C9A47F] mb-1 font-medium">
              City, State &amp; Pincode
            </label>
            <div className="grid grid-cols-1 min-[440px]:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="City"
                value={settings.city}
                onChange={(e) => setSettings({ ...settings, city: e.target.value })}
                className="bg-[#12100F] border border-white/10 p-2 text-xs text-[#F6F0E9]"
              />
              <input
                type="text"
                placeholder="State"
                value={settings.state}
                onChange={(e) => setSettings({ ...settings, state: e.target.value })}
                className="bg-[#12100F] border border-white/10 p-2 text-xs text-[#F6F0E9]"
              />
              <input
                type="text"
                placeholder="Pincode"
                value={settings.pincode}
                onChange={(e) => setSettings({ ...settings, pincode: e.target.value })}
                className="bg-[#12100F] border border-white/10 p-2 text-xs text-[#F6F0E9]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[#C9A47F] mb-1 font-medium">
              Patient Desk Phone
            </label>
            <input
              type="text"
              value={settings.phone}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              className="w-full bg-[#12100F] border border-white/10 p-2.5 text-xs text-[#F6F0E9] font-mono"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[#C9A47F] mb-1 font-medium">
              Clinical Email Address
            </label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              className="w-full bg-[#12100F] border border-white/10 p-2.5 text-xs text-[#F6F0E9] font-mono"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[#C9A47F] mb-1 font-medium">
              WhatsApp Integration Number
            </label>
            <input
              type="text"
              value={settings.whatsappNumber}
              onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
              placeholder="+919876543210"
              className="w-full bg-[#12100F] border border-white/10 p-2.5 text-xs text-[#F6F0E9] font-mono"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[#C9A47F] mb-1 font-medium">
              Instagram Handle
            </label>
            <input
              type="text"
              value={settings.instagramHandle}
              onChange={(e) => setSettings({ ...settings, instagramHandle: e.target.value })}
              className="w-full bg-[#12100F] border border-white/10 p-2.5 text-xs text-[#F6F0E9]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs uppercase tracking-wider text-[#C9A47F] mb-1 font-medium">
              Consultation Desk Notice
            </label>
            <input
              type="text"
              value={settings.consultationDeskNote}
              onChange={(e) => setSettings({ ...settings, consultationDeskNote: e.target.value })}
              className="w-full bg-[#12100F] border border-white/10 p-2.5 text-xs text-[#F6F0E9]"
            />
          </div>
        </div>
      </form>

      {/* Role Management & Authorized Admins */}
      <div className="bg-[#181514] border border-[#C9A47F]/20 p-6 sm:p-8 space-y-6">
        <div className="border-b border-white/5 pb-4">
          <div className="flex items-center gap-2 text-xs text-[#C9A47F] font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Role-Based Access Control (RBAC)</span>
          </div>
          <h2 className="text-xl font-serif text-[#F6F0E9] mt-1">Authorized Practice Administrators</h2>
          <p className="text-xs text-[#AFA89F] mt-1">
            Accounts permitted to log in, review confidential patient data, and publish CMS content.
          </p>
        </div>

        {/* Add New Admin (Owner Only) */}
        {isOwner ? (
          <form onSubmit={handleAddAdmin} className="p-4 bg-[#141211] border border-white/5 space-y-3 text-xs">
            <span className="text-[10px] uppercase font-mono text-[#C9A47F] font-semibold">
              Authorize New Administrative Account
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-5">
                <label className="block text-[10px] text-[#AFA89F] mb-1">Google Account Email *</label>
                <input
                  type="email"
                  required
                  placeholder="surgeon.associate@gmail.com"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  className="w-full bg-[#12100F] border border-white/10 p-2 text-xs text-[#F6F0E9]"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block text-[10px] text-[#AFA89F] mb-1">Full Name / Role Title</label>
                <input
                  type="text"
                  placeholder="e.g. Clinical Coordinator"
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  className="w-full bg-[#12100F] border border-white/10 p-2 text-xs text-[#F6F0E9]"
                />
              </div>

              <div className="sm:col-span-3">
                <button
                  type="submit"
                  disabled={addingAdmin}
                  className="w-full px-4 py-2 bg-[#24211E] hover:bg-[#C9A47F] text-[#C9A47F] hover:text-[#0B0B0B] border border-[#C9A47F]/40 text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{addingAdmin ? 'Authorizing...' : 'Authorize User'}</span>
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="p-3 bg-[#141211] border border-white/5 text-xs text-[#AFA89F]">
            Note: Admin delegation is restricted to the primary Practice Owner (<strong className="text-[#C9A47F]">{OWNER_EMAIL}</strong>).
          </div>
        )}

        {/* Current Admins List */}
        <div className="space-y-2">
          {/* Always display owner first */}
          <div className="p-3.5 bg-[#1C1817] border border-[#C9A47F]/40 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full border border-[#C9A47F] flex items-center justify-center text-xs font-serif text-[#C9A47F] bg-[#24211E]">
                SS
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-[#F6F0E9]">Dr. Samik Sharma (Primary Owner)</span>
                  <span className="px-1.5 py-0.5 text-[9px] uppercase font-mono bg-[#C9A47F] text-[#0B0B0B] font-bold">
                    ROOT OWNER
                  </span>
                </div>
                <p className="text-[11px] text-[#AFA89F] font-mono break-all">{OWNER_EMAIL}</p>
              </div>
            </div>
            <span className="text-[10px] text-[#7C766F] font-mono">Immutable</span>
          </div>

          {/* Additional registered admins */}
          {admins
            .filter((a) => a.email.toLowerCase() !== OWNER_EMAIL.toLowerCase())
            .map((admin) => (
              <div
                key={admin.uid}
                className="p-3.5 bg-[#141211] border border-white/5 flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-medium text-[#F6F0E9] break-words">{admin.displayName || 'Clinical Staff'}</p>
                  <p className="text-[11px] text-[#AFA89F] font-mono break-all">{admin.email}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-1.5 py-0.5 text-[9px] uppercase font-mono bg-white/5 text-[#C9A47F] border border-white/10">
                    {admin.role}
                  </span>
                  {isOwner && (
                    <button
                      onClick={() => handleRemoveAdmin(admin.uid, admin.email)}
                      className="p-1 text-[#AFA89F] hover:text-rose-400 transition-colors cursor-pointer"
                      title="Revoke Admin Access"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
