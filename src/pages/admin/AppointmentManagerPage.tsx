/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  CalendarCheck,
  Search,
  Filter,
  Download,
  Phone,
  Mail,
  MapPin,
  Video,
  Clock,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Edit3,
  X,
  FileSpreadsheet,
  CalendarClock,
  Flag,
  RefreshCw,
} from 'lucide-react';
import {
  getEnquiries,
  updateEnquiryStatus,
  updateEnquiryFollowUp,
  deleteEnquiry,
  EnquiryRecord,
} from '../../lib/firestoreService';
import { useAuth } from '../../context/AuthContext';
import { isFollowUpDue, isFollowUpUpcoming, localDateKey } from '../../lib/enquiryFollowUp';

export const AppointmentManagerPage: React.FC = () => {
  const { user } = useAuth();
  const [enquiries, setEnquiries] = useState<EnquiryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [procedureFilter, setProcedureFilter] = useState<string>('all');
  const [searchParams] = useSearchParams();
  const [followUpFilter, setFollowUpFilter] = useState<'all' | 'due' | 'upcoming' | 'unscheduled'>(() => {
    const requested = searchParams.get('followUp');
    return requested === 'due' || requested === 'upcoming' || requested === 'unscheduled' ? requested : 'all';
  });
  const [followUpDate, setFollowUpDate] = useState('');
  const [priority, setPriority] = useState<'normal' | 'high'>('normal');
  const [savingFollowUp, setSavingFollowUp] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeEnquiry, setActiveEnquiry] = useState<EnquiryRecord | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Patient details should scroll inside the sheet, not behind it.
  useEffect(() => {
    if (!activeEnquiry) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveEnquiry(null);
    };
    document.addEventListener('keydown', onEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onEscape);
    };
  }, [Boolean(activeEnquiry)]);

  useEffect(() => {
    loadList();
  }, []);

  const loadList = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await getEnquiries();
      setEnquiries(data);
    } catch (err) {
      console.error('Error loading enquiries:', err);
      setLoadError('Unable to load enquiries. Check your connection and permissions, then retry.');
    } finally {
      setLoading(false);
    }
  };

  const openEnquiry = (enq: EnquiryRecord) => {
    setActiveEnquiry(enq);
    setAdminNotes(enq.adminNotes || '');
    setFollowUpDate(enq.followUpDate || '');
    setPriority(enq.priority === 'high' ? 'high' : 'normal');
  };

  const handleSaveFollowUp = async () => {
    if (!activeEnquiry?.id) return;
    setSavingFollowUp(true);
    try {
      await updateEnquiryFollowUp(activeEnquiry.id, followUpDate, priority, user?.email || undefined);
      const update = { followUpDate, priority };
      setEnquiries(prev => prev.map(e => e.id === activeEnquiry.id ? { ...e, ...update } : e));
      setActiveEnquiry({ ...activeEnquiry, ...update });
      setNotification({ type: 'success', message: 'Follow-up plan saved successfully.' });
    } catch (err) {
      setNotification({ type: 'error', message: err instanceof Error ? err.message : 'Unable to save follow-up.' });
    } finally {
      setSavingFollowUp(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: EnquiryRecord['status']) => {
    try {
      await updateEnquiryStatus(id, newStatus, undefined, user?.email || undefined);
      setEnquiries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e))
      );
      if (activeEnquiry && activeEnquiry.id === id) {
        setActiveEnquiry({ ...activeEnquiry, status: newStatus });
      }
      setNotification({
        type: 'success',
        message: `Status updated to ${newStatus.toUpperCase()}`,
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  const handleSaveNotes = async () => {
    if (!activeEnquiry || !activeEnquiry.id) return;
    setSavingNote(true);
    try {
      await updateEnquiryStatus(activeEnquiry.id, activeEnquiry.status, adminNotes, user?.email || undefined);
      setEnquiries((prev) =>
        prev.map((e) => (e.id === activeEnquiry.id ? { ...e, adminNotes } : e))
      );
      setActiveEnquiry({ ...activeEnquiry, adminNotes });
      setNotification({ type: 'success', message: 'Clinical coordination notes saved.' });
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error('Failed to save notes:', err);
    } finally {
      setSavingNote(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Permanently delete consultation request for ${name}?`)) return;
    try {
      await deleteEnquiry(id, user?.email || undefined);
      setEnquiries((prev) => prev.filter((e) => e.id !== id));
      if (activeEnquiry?.id === id) setActiveEnquiry(null);
      setNotification({ type: 'success', message: 'Enquiry record deleted.' });
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error('Failed to delete enquiry:', err);
    }
  };

  // Export the currently filtered records, escaping spreadsheet formula prefixes.
  const handleExportCSV = () => {
    if (!filteredEnquiries.length) {
      setNotification({ type: 'error', message: 'No matching enquiries to export.' });
      return;
    }
    const headers = ['Reference Code','Full Name','Phone','Email','Treatment','Consultation Type','Preferred Date','Preferred Time','Status','Follow-up Date','Priority','Created At','Clinical Notes','Admin Notes'];
    const cell = (value: unknown) => {
      const raw = String(value ?? '');
      const safe = /^\s*[=+\-@]/.test(raw) ? "'" + raw : raw;
      return '"' + safe.replace(/"/g, '""') + '"';
    };
    const rows = filteredEnquiries.map(e => [e.referenceCode,e.fullName,e.phone,e.email,e.treatmentInterest,e.consultationType,e.preferredDate,e.preferredTime,e.status,e.followUpDate || '',e.priority || 'normal',e.createdAt,e.clinicalNotes || '',e.adminNotes || '']);
    const csv = '\uFEFF' + [headers,...rows].map(row => row.map(cell).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Dr_Samik_Sharma_Enquiries_' + new Date().toISOString().slice(0,10) + '.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // Date-only follow-ups use the local calendar day (not UTC).
  const today = localDateKey();
  const dueCount = enquiries.filter(e => isFollowUpDue(e, today)).length;
  const upcomingCount = enquiries.filter(e => isFollowUpUpcoming(e, today)).length;
  const highPriorityCount = enquiries.filter(e => e.priority === 'high' && e.status !== 'closed').length;

  // Filtered List
  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((e) => {
      const matchSearch =
        searchQuery === '' ||
        e.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.phone.includes(searchQuery) ||
        e.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.referenceCode.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = statusFilter === 'all' || e.status === statusFilter;
      const matchProcedure = procedureFilter === 'all' || e.treatmentInterest === procedureFilter;
      const matchFollowUp = followUpFilter === 'all' ||
        (followUpFilter === 'due' && isFollowUpDue(e, today)) ||
        (followUpFilter === 'upcoming' && isFollowUpUpcoming(e, today)) ||
        (followUpFilter === 'unscheduled' && !e.followUpDate);

      return matchSearch && matchStatus && matchProcedure && matchFollowUp;
    }).sort((a, b) => {
      const dueA = isFollowUpDue(a, today) ? 1 : 0;
      const dueB = isFollowUpDue(b, today) ? 1 : 0;
      if (dueA !== dueB) return dueB - dueA;
      if ((a.priority === 'high') !== (b.priority === 'high')) return a.priority === 'high' ? -1 : 1;
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [enquiries, searchQuery, statusFilter, procedureFilter, followUpFilter, today]);

  const uniqueProcedures = useMemo(() => {
    const list = Array.from(new Set(enquiries.map((e) => e.treatmentInterest))).filter(Boolean);
    return list;
  }, [enquiries]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-[#C9A47F]/20">
        <div>
          <span className="text-[10px] font-sans tracking-[0.25em] text-[#C9A47F] uppercase font-semibold">
            PATIENT INTAKE &amp; CLINICAL COORDINATION
          </span>
          <h1 className="text-3xl font-serif text-[#F6F0E9] font-light mt-1">
            Appointments &amp; Enquiries
          </h1>
          <p className="text-xs text-[#AFA89F] mt-1">
            Strictly confidential patient consult inquiries for Shalby Hospital, Mohali.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 bg-[#24211E] hover:bg-[#2F2A27] text-xs text-[#C9A47F] border border-[#C9A47F]/30 uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer self-start md:self-auto"
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Export CSV ({filteredEnquiries.length})</span>
        </button>
      </div>

      {notification && (
        <div
          className={`p-3.5 border text-xs flex items-center gap-2.5 ${
            notification.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Follow-up work queue summary; limited to the most recent 100 enquiries loaded. */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" aria-label="Follow-up summary">
        <button type="button" onClick={() => setFollowUpFilter('due')} className={`text-left bg-[#181514] border p-4 hover:border-[#C9A47F] transition-colors ${followUpFilter === 'due' ? 'border-[#C9A47F]' : 'border-white/10'}`}>
          <div className="flex items-center gap-2 text-amber-300 text-[11px] uppercase tracking-widest"><CalendarClock className="w-4 h-4" /> Due or overdue</div>
          <div className="text-3xl font-serif text-[#F6F0E9] mt-2">{dueCount}</div>
        </button>
        <button type="button" onClick={() => setFollowUpFilter('upcoming')} className={`text-left bg-[#181514] border p-4 hover:border-[#C9A47F] transition-colors ${followUpFilter === 'upcoming' ? 'border-[#C9A47F]' : 'border-white/10'}`}>
          <div className="flex items-center gap-2 text-[#C9A47F] text-[11px] uppercase tracking-widest"><Clock className="w-4 h-4" /> Upcoming follow-ups</div>
          <div className="text-3xl font-serif text-[#F6F0E9] mt-2">{upcomingCount}</div>
        </button>
        <div className="bg-[#181514] border border-white/10 p-4">
          <div className="flex items-center gap-2 text-rose-300 text-[11px] uppercase tracking-widest"><Flag className="w-4 h-4" /> High priority</div>
          <div className="text-3xl font-serif text-[#F6F0E9] mt-2">{highPriorityCount}</div>
        </div>
      </div>
      <p className="text-[11px] text-[#7C766F]">Work queue covers up to 100 most recent enquiries. Dates are for staff follow-up only, not confirmed appointment slots.</p>

      {loadError && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 border border-rose-500/40 bg-rose-950/30 p-3 text-xs text-rose-200"><span>{loadError}</span><button type="button" className="inline-flex items-center gap-2 underline" onClick={loadList}><RefreshCw className="w-3.5 h-3.5"/>Retry</button></div>}

      {/* Search and Filters Bar */}
      <div className="bg-[#181514] border border-[#C9A47F]/20 p-4 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        {/* Search */}
        <div className="sm:col-span-5 relative">
          <Search className="w-4 h-4 text-[#AFA89F] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by patient name, phone, email, or ref code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#12100F] border border-white/10 pl-9 pr-3 py-2 text-xs text-[#F6F0E9] focus:outline-none focus:border-[#C9A47F]"
          />
        </div>

        {/* Status Filter */}
        <div className="sm:col-span-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-[#12100F] border border-white/10 p-2 text-xs text-[#F6F0E9] focus:outline-none focus:border-[#C9A47F]"
          >
            <option value="all">All Statuses ({enquiries.length})</option>
            <option value="new">New ({enquiries.filter((e) => e.status === 'new').length})</option>
            <option value="contacted">Contacted ({enquiries.filter((e) => e.status === 'contacted').length})</option>
            <option value="scheduled">Scheduled ({enquiries.filter((e) => e.status === 'scheduled').length})</option>
            <option value="closed">Closed ({enquiries.filter((e) => e.status === 'closed').length})</option>
          </select>
        </div>

        {/* Procedure Filter */}
        <div className="sm:col-span-3">
          <select
            value={procedureFilter}
            onChange={(e) => setProcedureFilter(e.target.value)}
            className="w-full bg-[#12100F] border border-white/10 p-2 text-xs text-[#F6F0E9] focus:outline-none focus:border-[#C9A47F]"
          >
            <option value="all">All Procedures</option>
            {uniqueProcedures.map((proc) => (
              <option key={proc} value={proc}>
                {proc}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <select aria-label="Follow-up filter" value={followUpFilter} onChange={e => setFollowUpFilter(e.target.value as typeof followUpFilter)} className="w-full bg-[#12100F] border border-white/10 p-2 text-xs text-[#F6F0E9] focus:outline-none focus:border-[#C9A47F]">
            <option value="all">All follow-ups</option>
            <option value="due">Due / overdue</option>
            <option value="upcoming">Upcoming</option>
            <option value="unscheduled">No follow-up date</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-[#181514] border border-[#C9A47F]/20 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-[#AFA89F]">Loading patient inquiries...</div>
        ) : filteredEnquiries.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#AFA89F] space-y-2">
            <CalendarCheck className="w-8 h-8 text-[#C9A47F] mx-auto opacity-40" />
            <p>No consultation records matched your filters.</p>
          </div>
        ) : (
          <>
            {/* On phones, show useful readable cards instead of a wide table. */}
            <div className="md:hidden divide-y divide-white/10">
              {filteredEnquiries.map(enq => (
                <article key={enq.id || enq.referenceCode} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] font-mono tracking-wide text-[#C9A47F] break-all">{enq.referenceCode}</p>
                      <h2 className="mt-1 text-lg font-serif text-[#F6F0E9] break-words">{enq.fullName}</h2>
                      <p className="text-xs text-[#AFA89F] break-words">{enq.treatmentInterest}</p>
                    </div>
                    {enq.priority === 'high' && <span className="shrink-0 border border-rose-500/40 px-2 py-1 text-[10px] text-rose-300 uppercase">High</span>}
                  </div>
                  <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-3 text-xs">
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-wider text-[#7C766F] mb-1">Requested consultation</p>
                      <p className="text-[#F6F0E9]">{enq.preferredDate || 'Not specified'} · {enq.preferredTime}</p>
                      <p className="text-[#AFA89F]">{enq.consultationType === 'in-person' ? 'Shalby OPD' : 'Teleconsultation'}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-wider text-[#7C766F] mb-1">Staff follow-up</p>
                      <p className={isFollowUpDue(enq, today) ? 'font-semibold text-amber-300' : 'text-[#F6F0E9]'}>{enq.followUpDate || 'Not scheduled'}</p>
                      <p className="text-[#AFA89F] break-all">{enq.phone}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10">
                    <select
                      aria-label={`Status for ${enq.fullName}`}
                      value={enq.status}
                      onChange={event => enq.id && handleStatusChange(enq.id, event.target.value as EnquiryRecord['status'])}
                      className="min-w-0 flex-1 bg-[#12100F] border border-[#C9A47F]/30 text-[#F6F0E9] px-2 py-2.5 text-sm"
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="closed">Closed</option>
                    </select>
                    <a href={`tel:${enq.phone}`} title="Call patient" aria-label={`Call ${enq.fullName}`} className="w-11 h-11 shrink-0 inline-flex items-center justify-center border border-white/10 text-[#C9A47F]"><Phone className="w-4 h-4" /></a>
                    <button type="button" onClick={() => openEnquiry(enq)} className="px-3 h-11 shrink-0 border border-[#C9A47F]/40 text-[#C9A47F] text-xs font-semibold uppercase tracking-wide">View / edit</button>
                  </div>
                </article>
              ))}
            </div>
            <div className="hidden md:block overflow-x-auto" aria-label="Consultation enquiry table">
              <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 bg-[#141211] text-[10px] text-[#C9A47F] uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Ref Code</th>
                  <th className="py-3 px-4">Patient Information</th>
                  <th className="py-3 px-4">Procedure</th>
                  <th className="py-3 px-4">Requested Slot</th>
                  <th className="py-3 px-4">Follow-up</th>
                  <th className="py-3 px-4">Format</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredEnquiries.map((enq) => (
                  <tr
                    key={enq.id || enq.referenceCode}
                    className="hover:bg-white/[0.02] cursor-pointer transition-colors"
                    onClick={() => openEnquiry(enq)}
                  >
                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#C9A47F] whitespace-nowrap">
                      {enq.referenceCode}
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-medium text-[#F6F0E9]">{enq.fullName}</p>
                      <div className="flex items-center gap-3 text-[11px] text-[#AFA89F] font-mono mt-0.5">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-[#7C766F]" />
                          {enq.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-[#7C766F]" />
                          {enq.email}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-[#F6F0E9] font-medium">{enq.treatmentInterest}</span>
                      {enq.clinicalNotes && (
                        <p className="text-[10px] text-[#7C766F] truncate max-w-xs mt-0.5">
                          Note: {enq.clinicalNotes}
                        </p>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <p className="text-[#F6F0E9]">{enq.preferredDate || 'Not specified'}</p>
                      <p className="text-[10px] text-[#AFA89F]">{enq.preferredTime}</p>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <p className={`text-[11px] ${isFollowUpDue(enq, today) ? 'font-semibold text-amber-300' : 'text-[#AFA89F]'}`}>
                        {enq.followUpDate || 'Not set'}
                      </p>
                      {enq.priority === 'high' && <span className="text-[9px] uppercase tracking-wider text-rose-300">High priority</span>}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {enq.consultationType === 'in-person' ? (
                          <>
                            <MapPin className="w-3.5 h-3.5 text-[#C9A47F]" />
                            <span className="text-[11px] text-[#AFA89F]">Shalby OPD</span>
                          </>
                        ) : (
                          <>
                            <Video className="w-3.5 h-3.5 text-blue-400" />
                            <span className="text-[11px] text-blue-300">Teleconsult</span>
                          </>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={enq.status}
                        onChange={(e) => handleStatusChange(enq.id!, e.target.value as any)}
                        className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-1 bg-[#12100F] border cursor-pointer ${
                          enq.status === 'new'
                            ? 'border-amber-500/40 text-amber-300'
                            : enq.status === 'contacted'
                            ? 'border-blue-500/40 text-blue-300'
                            : enq.status === 'scheduled'
                            ? 'border-emerald-500/40 text-emerald-300'
                            : 'border-white/20 text-[#AFA89F]'
                        }`}
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="closed">Closed</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="inline-flex items-center gap-2">
                        <a
                          href={`tel:${enq.phone}`}
                          className="p-1.5 text-[#AFA89F] hover:text-[#C9A47F] transition-colors"
                          title="Call Patient"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                        <a
                          href={`mailto:${enq.email}?subject=Dr.%20Samik%20Sharma%20Consultation%20Appointment%20-%20Ref%20${enq.referenceCode}`}
                          className="p-1.5 text-[#AFA89F] hover:text-[#C9A47F] transition-colors"
                          title="Email Patient"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </a>
                        {enq.id && (
                          <button
                            onClick={() => handleDelete(enq.id!, enq.fullName)}
                            className="p-1.5 text-[#AFA89F] hover:text-rose-400 transition-colors"
                            title="Delete Enquiry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}
      </div>

      {/* Patient Detail & Clinical Notes Drawer / Modal */}
      {activeEnquiry && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setActiveEnquiry(null)}
        >
          <div
            className="bg-[#1C1817] border border-[#C9A47F] max-w-xl w-full min-w-0 p-4 sm:p-8 space-y-6 my-0 sm:my-4 max-h-[calc(100dvh-1rem)] sm:max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain text-[#F6F0E9]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <span className="text-[10px] font-sans tracking-[0.25em] text-[#C9A47F] uppercase font-semibold">
                  CONFIDENTIAL INTAKE FILE
                </span>
                <h3 className="text-2xl font-serif text-[#F6F0E9] mt-0.5">{activeEnquiry.fullName}</h3>
                <p className="text-xs text-[#AFA89F] font-mono">Ref: {activeEnquiry.referenceCode}</p>
              </div>
              <button
                onClick={() => setActiveEnquiry(null)}
                className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-[#AFA89F] hover:text-[#F6F0E9]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Contact & Details */}
            <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-3 text-xs p-3 sm:p-4 bg-[#141211] border border-white/5">
              <div>
                <span className="text-[10px] text-[#7C766F] uppercase font-mono">Contact Phone:</span>
                <p className="font-mono text-[#F6F0E9] font-medium">{activeEnquiry.phone}</p>
              </div>
              <div>
                <span className="text-[10px] text-[#7C766F] uppercase font-mono">Email Address:</span>
                <p className="font-mono text-[#F6F0E9] break-all font-medium">{activeEnquiry.email}</p>
              </div>
              <div>
                <span className="text-[10px] text-[#7C766F] uppercase font-mono">Target Procedure:</span>
                <p className="text-[#C9A47F] font-medium">{activeEnquiry.treatmentInterest}</p>
              </div>
              <div>
                <span className="text-[10px] text-[#7C766F] uppercase font-mono">Slot &amp; Format:</span>
                <p className="text-[#F6F0E9]">
                  {activeEnquiry.preferredDate} ({activeEnquiry.preferredTime})
                </p>
                <p className="text-[10px] text-[#AFA89F] capitalize">{activeEnquiry.consultationType}</p>
              </div>
            </div>

            {/* Patient Clinical Notes */}
            {activeEnquiry.clinicalNotes && (
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#C9A47F] mb-1 font-medium">
                  Patient Self-Reported Clinical Notes / Concerns
                </label>
                <div className="p-3 bg-[#12100F] border border-white/10 text-xs text-[#AFA89F] leading-relaxed italic">
                  &quot;{activeEnquiry.clinicalNotes}&quot;
                </div>
              </div>
            )}

            {/* Internal follow-up plan */}
            <div className="bg-[#141211] border border-[#C9A47F]/20 p-4 space-y-3">
              <div className="flex items-center gap-2 text-[#C9A47F] text-xs uppercase tracking-wider font-medium"><CalendarClock className="w-4 h-4"/> Follow-up Plan</div>
              <p className="text-[11px] text-[#AFA89F]">Internal staff reminder only. Does not send notifications or confirm an appointment.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="text-xs text-[#AFA89F] space-y-1.5">
                  <span className="block">Next contact date</span>
                  <input aria-label="Next contact date" type="date" value={followUpDate} onChange={e => setFollowUpDate(e.target.value)} className="w-full bg-[#12100F] border border-white/10 p-2.5 text-[#F6F0E9] focus:border-[#C9A47F]"/>
                </label>
                <label className="text-xs text-[#AFA89F] space-y-1.5">
                  <span className="block">Priority</span>
                  <select aria-label="Lead priority" value={priority} onChange={e => setPriority(e.target.value as 'normal' | 'high')} className="w-full bg-[#12100F] border border-white/10 p-2.5 text-[#F6F0E9] focus:border-[#C9A47F]">
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                  </select>
                </label>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-3">
                <button type="button" onClick={() => setFollowUpDate('')} className="text-xs text-[#AFA89F] hover:text-[#F6F0E9] underline">Clear date</button>
                <button type="button" onClick={handleSaveFollowUp} disabled={savingFollowUp} className="px-4 py-2 bg-[#C9A47F] text-[#0B0B0B] text-xs font-semibold uppercase tracking-wider disabled:opacity-60">{savingFollowUp ? 'Saving...' : 'Save follow-up'}</button>
              </div>
            </div>

            {/* Internal Staff Notes */}
            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-wider text-[#C9A47F] font-medium">
                Internal Administrative / Coordination Notes
              </label>
              <textarea
                rows={4}
                placeholder="Log doctor consultation confirmation, WhatsApp follow-up details, or quotation status..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full bg-[#12100F] border border-white/10 p-3 text-xs text-[#F6F0E9] focus:outline-none focus:border-[#C9A47F] resize-none"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleSaveNotes}
                  disabled={savingNote}
                  className="px-4 py-2 bg-[#C9A47F] hover:bg-[#DFCAAF] text-[#0B0B0B] text-xs font-semibold uppercase tracking-wider disabled:opacity-50"
                >
                  {savingNote ? 'Saving...' : 'Save Staff Notes'}
                </button>
              </div>
            </div>

            {/* Contact Shortcuts */}
            <div className="pt-2 flex items-center justify-between border-t border-white/10 text-xs">
              <div className="flex gap-2">
                <a
                  href={`tel:${activeEnquiry.phone}`}
                  className="px-3 py-1.5 bg-[#24211E] border border-white/10 text-[#F6F0E9] hover:text-[#C9A47F] flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Patient</span>
                </a>
                <a
                  href={`mailto:${activeEnquiry.email}?subject=Dr.%20Samik%20Sharma%20Consultation%20Appointment`}
                  className="px-3 py-1.5 bg-[#24211E] border border-white/10 text-[#F6F0E9] hover:text-[#C9A47F] flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Send Email</span>
                </a>
              </div>

              <button
                onClick={() => setActiveEnquiry(null)}
                className="px-4 py-1.5 border border-white/10 text-[#AFA89F] hover:text-white"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
