/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
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
} from 'lucide-react';
import {
  getEnquiries,
  updateEnquiryStatus,
  deleteEnquiry,
  EnquiryRecord,
} from '../../lib/firestoreService';
import { useAuth } from '../../context/AuthContext';

export const AppointmentManagerPage: React.FC = () => {
  const { user } = useAuth();
  const [enquiries, setEnquiries] = useState<EnquiryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [procedureFilter, setProcedureFilter] = useState<string>('all');
  const [activeEnquiry, setActiveEnquiry] = useState<EnquiryRecord | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadList();
  }, []);

  const loadList = async () => {
    setLoading(true);
    try {
      const data = await getEnquiries();
      setEnquiries(data);
    } catch (err) {
      console.error('Error loading enquiries:', err);
    } finally {
      setLoading(false);
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
    const headers = ['Reference Code','Full Name','Phone','Email','Treatment','Consultation Type','Preferred Date','Preferred Time','Status','Created At','Clinical Notes','Admin Notes'];
    const cell = (value: unknown) => {
      const raw = String(value ?? '');
      const safe = /^\s*[=+\-@]/.test(raw) ? "'" + raw : raw;
      return '"' + safe.replace(/"/g, '""') + '"';
    };
    const rows = filteredEnquiries.map(e => [e.referenceCode,e.fullName,e.phone,e.email,e.treatmentInterest,e.consultationType,e.preferredDate,e.preferredTime,e.status,e.createdAt,e.clinicalNotes || '',e.adminNotes || '']);
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

      return matchSearch && matchStatus && matchProcedure;
    });
  }, [enquiries, searchQuery, statusFilter, procedureFilter]);

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

      {/* Search and Filters Bar */}
      <div className="bg-[#181514] border border-[#C9A47F]/20 p-4 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        {/* Search */}
        <div className="sm:col-span-6 relative">
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
        <div className="sm:col-span-3">
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
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 bg-[#141211] text-[10px] text-[#C9A47F] uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Ref Code</th>
                  <th className="py-3 px-4">Patient Information</th>
                  <th className="py-3 px-4">Procedure</th>
                  <th className="py-3 px-4">Requested Slot</th>
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
                    onClick={() => {
                      setActiveEnquiry(enq);
                      setAdminNotes(enq.adminNotes || '');
                    }}
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
        )}
      </div>

      {/* Patient Detail & Clinical Notes Drawer / Modal */}
      {activeEnquiry && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setActiveEnquiry(null)}
        >
          <div
            className="bg-[#1C1817] border border-[#C9A47F] max-w-xl w-full p-6 sm:p-8 space-y-6 my-8 max-h-[85vh] overflow-y-auto text-[#F6F0E9]"
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
            <div className="grid grid-cols-2 gap-3 text-xs p-4 bg-[#141211] border border-white/5">
              <div>
                <span className="text-[10px] text-[#7C766F] uppercase font-mono">Contact Phone:</span>
                <p className="font-mono text-[#F6F0E9] font-medium">{activeEnquiry.phone}</p>
              </div>
              <div>
                <span className="text-[10px] text-[#7C766F] uppercase font-mono">Email Address:</span>
                <p className="font-mono text-[#F6F0E9] truncate font-medium">{activeEnquiry.email}</p>
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
