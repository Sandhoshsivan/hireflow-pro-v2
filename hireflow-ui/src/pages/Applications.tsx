import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Plus,
  Search,
  X,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  Link2,
  Send,
} from 'lucide-react';
import clsx from 'clsx';
import TopBar from '../components/TopBar';
import api from '../lib/api';
import { useToastStore } from '../components/Toast';
import type { Application, ApplicationStatus, Priority, TimelineEntry, Contact } from '../types';
import { extractApplications } from '../lib/normalize';

const statusOptions: ApplicationStatus[] = [
  'saved',
  'applied',
  'interview',
  'offer',
  'rejected',
  'ghosted',
];

const priorityOptions: Priority[] = ['low', 'medium', 'high'];

/* ── Status badge styling ── */
const statusColors: Record<string, string> = {
  saved: 'bg-cyan-50 text-cyan-700 border border-cyan-200',
  applied: 'bg-blue-50 text-blue-700 border border-blue-200',
  interview: 'bg-amber-50 text-amber-700 border border-amber-200',
  offer: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  rejected: 'bg-red-50 text-red-700 border border-red-200',
  ghosted: 'bg-slate-100 text-slate-500 border border-slate-200',
};

const statusDots: Record<string, string> = {
  saved: 'bg-cyan-600',
  applied: 'bg-blue-600',
  interview: 'bg-amber-500',
  offer: 'bg-emerald-600',
  rejected: 'bg-red-500',
  ghosted: 'bg-slate-400',
};

/* ── Priority styling ── */
const priorityDots: Record<string, string> = {
  high: 'bg-red-500 shadow-[0_0_0_2px_rgba(220,38,38,.15)]',
  medium: 'bg-amber-500 shadow-[0_0_0_2px_rgba(217,119,6,.15)]',
  low: 'bg-emerald-500 shadow-[0_0_0_2px_rgba(5,150,105,.15)]',
};

const priorityLabels: Record<string, string> = {
  high: 'text-red-600',
  medium: 'text-amber-600',
  low: 'text-slate-400',
};

/* ── Avatar color from company name (matches Flask) ── */
const AVATAR_COLORS = ['#2563EB', '#059669', '#D97706', '#7C3AED', '#DC2626', '#0891B2', '#EC4899'];
function avatarColor(name: string): string {
  let h = 0;
  for (const ch of name || 'X') h = (h * 31 + ch.charCodeAt(0)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[h];
}

/* ── Helpers ── */
function daysAgo(dateStr: string): number {
  const d = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - d.getTime()) / 86400000);
}

function isOverdue(dateStr?: string): boolean {
  if (!dateStr) return false;
  return new Date(dateStr) <= new Date();
}

interface FormData {
  company: string;
  role: string;
  status: ApplicationStatus;
  salary: string;
  location: string;
  source: string;
  url: string;
  notes: string;
  priority: Priority;
  followUpDate: string;
}

const emptyForm: FormData = {
  company: '',
  role: '',
  status: 'saved',
  salary: '',
  location: '',
  source: '',
  url: '',
  notes: '',
  priority: 'medium',
  followUpDate: '',
};

function FormField({
  label,
  children,
  required,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-[.6px] mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  'w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none bg-slate-50 focus:bg-white transition-all duration-150';

export default function Applications() {
  const [searchParams] = useSearchParams();
  const statusFilter = searchParams.get('status') ?? '';

  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState(statusFilter);
  const [sortBy, setSortBy] = useState('createdAt_desc');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  // Drawer state
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [timelineOpen, setTimelineOpen] = useState(true);
  const [contactsOpen, setContactsOpen] = useState(true);
  const [timelineNote, setTimelineNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  // Quick status in drawer
  const [drawerStatus, setDrawerStatus] = useState<ApplicationStatus | ''>('');

  const addToast = useToastStore((s) => s.addToast);

  const fetchApps = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (filterStatus) params.set('status', filterStatus);
      if (sortBy) params.set('sort', sortBy);
      const { data } = await api.get(`/applications?${params}`);
      setApps(extractApplications(data));
    } catch {
      // empty
    } finally {
      setLoading(false);
    }
  }, [search, filterStatus, sortBy]);

  useEffect(() => {
    fetchApps();
  }, [fetchApps]);

  useEffect(() => {
    setFilterStatus(statusFilter);
  }, [statusFilter]);

  const openAdd = () => {
    setEditingApp(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (app: Application) => {
    setEditingApp(app);
    setForm({
      company: app.company,
      role: app.role,
      status: app.status,
      salary: app.salary ?? '',
      location: app.location ?? '',
      source: app.source ?? '',
      url: app.url ?? '',
      notes: app.notes ?? '',
      priority: app.priority,
      followUpDate: app.followUpDate ? app.followUpDate.slice(0, 10) : '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        jobTitle: form.role,
        company: form.company,
        status: form.status,
        priority: form.priority,
        salaryRange: form.salary,
        location: form.location,
        source: form.source,
        jobUrl: form.url,
        notes: form.notes,
        followUpDate: form.followUpDate || undefined,
      };
      if (editingApp) {
        await api.put(`/applications/${editingApp.id}`, payload);
        addToast('success', 'Application updated');
      } else {
        await api.post('/applications', payload);
        addToast('success', 'Application created');
      }
      setShowModal(false);
      fetchApps();
    } catch {
      addToast('error', 'Failed to save application');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this application?')) return;
    try {
      await api.delete(`/applications/${id}`);
      addToast('success', 'Application deleted');
      if (selectedApp?.id === id) setSelectedApp(null);
      fetchApps();
    } catch {
      addToast('error', 'Failed to delete');
    }
  };

  const openDetail = async (app: Application) => {
    setSelectedApp(app);
    setDrawerStatus(app.status);
    setTimelineNote('');
    try {
      const [tlRes, ctRes] = await Promise.all([
        api.get(`/applications/${app.id}/timeline`),
        api.get(`/applications/${app.id}/contacts`),
      ]);
      const rawTimeline: Record<string, unknown>[] = tlRes.data ?? [];
      setTimeline(rawTimeline.map((t) => ({
        id: t.id as number,
        applicationId: (t.applicationId as number) ?? 0,
        action: (t.action as string) ?? `${t.fromStatus} \u2192 ${t.toStatus}`,
        details: (t.details as string) ?? (t.note as string),
        createdAt: t.createdAt as string,
      })));
      const rawContacts: Record<string, unknown>[] = ctRes.data ?? [];
      setContacts(rawContacts.map((c) => ({
        id: c.id as number,
        applicationId: (c.applicationId as number) ?? 0,
        name: (c.name as string) ?? '',
        title: c.title as string,
        email: c.email as string,
        phone: c.phone as string,
        notes: c.notes as string,
      })));
    } catch {
      setTimeline([]);
      setContacts([]);
    }
  };

  const handleQuickStatus = async (newStatus: ApplicationStatus) => {
    if (!selectedApp || newStatus === selectedApp.status) return;
    try {
      await api.patch(`/applications/${selectedApp.id}/status`, { status: newStatus });
      addToast('success', `Status updated to ${newStatus}`);
      setDrawerStatus(newStatus);
      fetchApps();
      openDetail({ ...selectedApp, status: newStatus });
    } catch {
      addToast('error', 'Failed to update status');
    }
  };

  const handleAddTimelineNote = async () => {
    if (!selectedApp || !timelineNote.trim()) return;
    setAddingNote(true);
    try {
      await api.post(`/applications/${selectedApp.id}/timeline`, { action: timelineNote.trim() });
      setTimelineNote('');
      addToast('success', 'Note added');
      openDetail(selectedApp);
    } catch {
      addToast('error', 'Failed to add note');
    } finally {
      setAddingNote(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-[3px] border-slate-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* ── Topbar ── */}
      <TopBar
        title="Applications"
        subtitle={`${apps.length} application${apps.length !== 1 ? 's' : ''} tracked`}
        actions={
          <div className="flex items-center gap-2.5">
            {/* Filter bar container */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-[10px] px-2 py-[5px]">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search company, role..."
                  className="w-[200px] pl-8 pr-3 py-[7px] bg-white border border-slate-200 rounded-lg text-[13px] text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all duration-150"
                />
              </div>
              {/* Vertical divider */}
              <div className="w-px h-5 bg-slate-200 flex-shrink-0" />
              {/* Status dropdown */}
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-[126px] pl-3 pr-7 py-[7px] bg-white border border-slate-200 rounded-lg text-[12px] text-slate-700 focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 outline-none appearance-none cursor-pointer transition-all duration-150"
                >
                  <option value="">All Status</option>
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
              </div>
              {/* Sort dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-[136px] pl-3 pr-7 py-[7px] bg-white border border-slate-200 rounded-lg text-[12px] text-slate-700 focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 outline-none appearance-none cursor-pointer transition-all duration-150"
                >
                  <option value="createdAt_desc">Newest First</option>
                  <option value="createdAt_asc">Oldest First</option>
                  <option value="company_asc">Company A-Z</option>
                  <option value="company_desc">Company Z-A</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
              </div>
            </div>
            {/* Track Job button */}
            <button
              onClick={openAdd}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold text-white bg-blue-700 rounded-lg hover:bg-blue-800 active:scale-[.98] transition-all duration-150 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
              Track Job
            </button>
          </div>
        }
      />

      {/* ── Table ── */}
      <div className="page-content" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, overflowY: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '28%' }}>Company / Role</th>
                <th>Status</th>
                <th>Applied</th>
                <th>Salary</th>
                <th>Source</th>
                <th>Location</th>
                <th>Follow-up</th>
                <th>Priority</th>
                <th style={{ width: 60 }} />
              </tr>
            </thead>
            <tbody>
              {apps.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <div className="empty-state" style={{ padding: '60px 0' }}>
                      <div className="empty-icon">{'\u{1F4ED}'}</div>
                      <div className="empty-text">No applications found</div>
                      <div className="empty-sub">Try a different filter or add a new application</div>
                      <button
                        onClick={openAdd}
                        className="btn btn-primary"
                        style={{ marginTop: 16 }}
                      >
                        <Plus className="w-4 h-4" style={{ marginRight: 6 }} />
                        Add your first application
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                apps.map((app) => {
                  const color = avatarColor(app.company);
                  return (
                    <tr
                      key={app.id}
                      onClick={() => openDetail(app)}
                    >
                      {/* Company / Role */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            style={{
                              width: 32, height: 32, borderRadius: 7,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              flexShrink: 0, fontSize: 13, fontWeight: 800,
                              background: `${color}18`, color,
                            }}
                          >
                            {app.company.charAt(0).toUpperCase()}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div className="td-company" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {app.company}
                            </div>
                            <div className="td-role">{app.role}</div>
                          </div>
                        </div>
                      </td>
                      {/* Status */}
                      <td>
                        <span className={clsx('badge', `badge-${app.status}`)}>
                          {'\u2022'} {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </span>
                      </td>
                      {/* Applied date */}
                      <td>
                        <span className="td-mono">
                          {new Date(app.appliedDate || app.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </td>
                      {/* Salary */}
                      <td>
                        {app.salary
                          ? <span className="td-salary">{app.salary}</span>
                          : <span style={{ color: 'var(--text4)' }}>&mdash;</span>
                        }
                      </td>
                      {/* Source */}
                      <td>
                        <span className="td-mono">
                          {app.source || <span style={{ color: 'var(--text4)' }}>&mdash;</span>}
                        </span>
                      </td>
                      {/* Location */}
                      <td>
                        <span style={{ fontSize: 12, color: 'var(--text2)' }}>
                          {app.location || <span style={{ color: 'var(--text4)' }}>&mdash;</span>}
                        </span>
                      </td>
                      {/* Follow-up */}
                      <td>
                        <span
                          className="td-mono"
                          style={
                            app.followUpDate && isOverdue(app.followUpDate)
                              ? { color: 'var(--red)', fontWeight: 600 }
                              : undefined
                          }
                        >
                          {app.followUpDate
                            ? new Date(app.followUpDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : '\u2014'}
                        </span>
                      </td>
                      {/* Priority */}
                      <td>
                        <span
                          className={clsx('inline-block w-2 h-2 rounded-full', priorityDots[app.priority])}
                          title={app.priority}
                        />
                      </td>
                      {/* Actions */}
                      <td>
                        <div
                          style={{ display: 'flex', alignItems: 'center', gap: 4, opacity: 0, transition: 'opacity .15s' }}
                          className="row-actions"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => openEdit(app)}
                            className="btn btn-ghost btn-icon"
                            title="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(app.id)}
                            className="btn btn-ghost btn-icon"
                            title="Delete"
                            style={{ color: 'var(--red)' }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
      </div>
      </div>

      {/* ── Add / Edit Modal ── */}
      {showModal && (
        <div className="modal-overlay open" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>

            {/* Header */}
            <div className="modal-header">
              <div>
                <div className="modal-title">
                  {editingApp ? 'Edit Application' : 'Add Application'}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {editingApp ? `Updating ${editingApp.company}` : 'Track a new job opportunity'}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="btn btn-ghost btn-icon"
                style={{ color: 'var(--text3)' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="modal-body">
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Company" required>
                    <input
                      type="text"
                      value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                      placeholder="e.g. Stripe"
                      className={inputClass}
                    />
                  </FormField>
                  <FormField label="Role" required>
                    <input
                      type="text"
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                      placeholder="e.g. Senior Engineer"
                      className={inputClass}
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Status">
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value as ApplicationStatus })}
                      className={inputClass}
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label="Priority">
                    <select
                      value={form.priority}
                      onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}
                      className={inputClass}
                    >
                      {priorityOptions.map((p) => (
                        <option key={p} value={p}>
                          {p.charAt(0).toUpperCase() + p.slice(1)}
                        </option>
                      ))}
                    </select>
                  </FormField>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Salary">
                    <input
                      type="text"
                      value={form.salary}
                      onChange={(e) => setForm({ ...form, salary: e.target.value })}
                      placeholder="e.g. $120,000"
                      className={inputClass}
                    />
                  </FormField>
                  <FormField label="Location">
                    <input
                      type="text"
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      placeholder="e.g. San Francisco, CA"
                      className={inputClass}
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Source">
                    <input
                      type="text"
                      value={form.source}
                      onChange={(e) => setForm({ ...form, source: e.target.value })}
                      placeholder="LinkedIn, Indeed, etc."
                      className={inputClass}
                    />
                  </FormField>
                  <FormField label="Follow-up Date">
                    <input
                      type="date"
                      value={form.followUpDate}
                      onChange={(e) => setForm({ ...form, followUpDate: e.target.value })}
                      className={inputClass}
                    />
                  </FormField>
                </div>

                <FormField label="Job URL">
                  <input
                    type="url"
                    value={form.url}
                    onChange={(e) => setForm({ ...form, url: e.target.value })}
                    placeholder="https://..."
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Notes">
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    rows={3}
                    placeholder="Add any notes about this opportunity..."
                    className={clsx(inputClass, 'resize-none')}
                  />
                </FormField>
              </div>
            </div>

            {/* Footer */}
            <div className="modal-footer">
              <button
                onClick={() => setShowModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.company || !form.role}
                className="btn-primary"
              >
                {saving ? 'Saving...' : editingApp ? 'Update Application' : 'Create Application'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Detail Drawer ── */}
      <div className={`drawer-overlay${selectedApp ? ' open' : ''}`} onClick={() => setSelectedApp(null)} />
      <div className={`drawer${selectedApp ? ' open' : ''}`}>
        {selectedApp && (
          <>
            {/* Drawer header */}
            <div className="drawer-header">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  {/* Company name - 20px bold */}
                  <h2 className="text-[20px] font-extrabold text-slate-900 tracking-[-0.5px] leading-tight">
                    {selectedApp.company}
                  </h2>
                  {/* Role + location */}
                  <p className="text-[13px] text-slate-500 mt-[3px]">
                    {selectedApp.role}
                    {selectedApp.location && (
                      <span className="text-slate-400">{'  \u00B7  '}{selectedApp.location}</span>
                    )}
                  </p>
                  {/* Action row: badge + edit + status dropdown + job link + delete */}
                  <div className="flex items-center gap-2 flex-wrap mt-3">
                    {/* Status badge */}
                    <span
                      className={clsx(
                        'inline-flex items-center gap-[5px] text-[11px] font-bold font-mono tracking-[.1px] px-2.5 py-1 rounded-full capitalize whitespace-nowrap',
                        statusColors[selectedApp.status]
                      )}
                    >
                      <span className={clsx('w-[5px] h-[5px] rounded-full', statusDots[selectedApp.status])} />
                      {selectedApp.status}
                    </span>
                    {/* Edit button */}
                    <button
                      onClick={() => {
                        setSelectedApp(null);
                        openEdit(selectedApp);
                      }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <Pencil className="w-3 h-3" />
                      Edit
                    </button>
                    {/* Quick status dropdown */}
                    <div className="relative">
                      <select
                        value={drawerStatus}
                        onChange={(e) => handleQuickStatus(e.target.value as ApplicationStatus)}
                        className="pl-2 pr-5 py-1 text-[12px] border border-slate-200 rounded-lg bg-white cursor-pointer outline-none appearance-none hover:bg-slate-50 transition-colors"
                      >
                        {statusOptions.map((s) => (
                          <option key={s} value={s}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-slate-400 pointer-events-none" />
                    </div>
                    {/* Job post link */}
                    {selectedApp.url && (
                      <a
                        href={selectedApp.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <Link2 className="w-3 h-3" />
                        Job Post
                      </a>
                    )}
                    {/* Delete button */}
                    <button
                      onClick={() => handleDelete(selectedApp.id)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {/* Close button */}
                <button
                  onClick={() => setSelectedApp(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors flex-shrink-0 -mt-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable body */}
            <div className="drawer-body">
              {/* Details section */}
              <div className="drawer-section">
                <div className="drawer-section-label">Details</div>
                <div className="info-grid">
                  {/* Applied */}
                  <div className="info-row">
                    <div className="info-key">Applied</div>
                    <div className="info-val">
                      {new Date(selectedApp.appliedDate || selectedApp.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                      <span className="text-slate-400 ml-1">
                        ({daysAgo(selectedApp.appliedDate || selectedApp.createdAt)}d ago)
                      </span>
                    </div>
                  </div>
                  {/* Salary */}
                  <div className="info-row">
                    <div className="info-key">Salary</div>
                    <div className="info-val" style={{ color: 'var(--green, #059669)' }}>
                      {selectedApp.salary || '\u2014'}
                    </div>
                  </div>
                  {/* Source */}
                  <div className="info-row">
                    <div className="info-key">Source</div>
                    <div className="info-val">
                      {selectedApp.source || '\u2014'}
                    </div>
                  </div>
                  {/* Priority */}
                  <div className="info-row">
                    <div className="info-key">Priority</div>
                    <div className="info-val" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className={clsx('inline-block w-2 h-2 rounded-full', priorityDots[selectedApp.priority])} />
                      <span className={clsx('capitalize', priorityLabels[selectedApp.priority])}>
                        {selectedApp.priority}
                      </span>
                    </div>
                  </div>
                  {/* Follow-up (if exists) */}
                  {selectedApp.followUpDate && (
                    <div className="info-row">
                      <div className="info-key">Follow-up</div>
                      <div className={clsx(
                        'info-val',
                        isOverdue(selectedApp.followUpDate) ? 'text-amber-600' : ''
                      )}>
                        {new Date(selectedApp.followUpDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes section */}
              {selectedApp.notes && (
                <div className="drawer-section">
                  <div className="drawer-section-label">Notes</div>
                  <p className="text-[13px] text-slate-500 leading-[1.7] whitespace-pre-wrap">
                    {selectedApp.notes}
                  </p>
                </div>
              )}

              {/* Timeline section */}
              <div className="drawer-section">
                <button
                  onClick={() => setTimelineOpen(!timelineOpen)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <div className="drawer-section-label" style={{ marginBottom: 0 }}>
                    Timeline
                    {timeline.length > 0 && (
                      <span className="ml-2 bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full text-[11px] font-medium normal-case">
                        {timeline.length}
                      </span>
                    )}
                  </div>
                  <ChevronRight
                    className={clsx(
                      'w-4 h-4 text-slate-400 transition-transform duration-200',
                      timelineOpen && 'rotate-90'
                    )}
                  />
                </button>
                {timelineOpen && (
                  <div className="mt-3">
                    {timeline.length === 0 ? (
                      <p className="text-[13px] text-slate-400 py-2">No timeline entries yet</p>
                    ) : (
                      <div className="flex flex-col">
                        {timeline.map((entry, idx) => (
                          <div key={entry.id} className="flex gap-3">
                            {/* Left: dot + line */}
                            <div className="flex flex-col items-center">
                              <div className="w-2.5 h-2.5 rounded-full bg-blue-600 flex-shrink-0 mt-1 shadow-[0_0_0_3px_rgba(26,86,219,.12)]" />
                              {idx < timeline.length - 1 && (
                                <div className="flex-1 w-px bg-slate-200 my-1" />
                              )}
                            </div>
                            {/* Content */}
                            <div className="pb-3.5 flex-1">
                              <p className="text-[13px] font-semibold text-slate-900">{entry.action}</p>
                              {entry.details && (
                                <p className="text-[12px] text-slate-500 mt-0.5">{entry.details}</p>
                              )}
                              <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                                {new Date(entry.createdAt).toLocaleString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Add Note to Timeline */}
              <div className="drawer-section">
                <div className="drawer-section-label">Add Note to Timeline</div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={timelineNote}
                    onChange={(e) => setTimelineNote(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTimelineNote()}
                    placeholder="e.g. Called recruiter, Sent follow-up..."
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-[13px] text-slate-900 placeholder:text-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all duration-150"
                  />
                  <button
                    onClick={handleAddTimelineNote}
                    disabled={addingNote || !timelineNote.trim()}
                    className="px-3.5 py-2 text-[13px] font-semibold text-white bg-blue-700 rounded-lg hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Add
                  </button>
                </div>
              </div>

              {/* Contacts (collapsible) */}
              <div className="drawer-section">
                <button
                  onClick={() => setContactsOpen(!contactsOpen)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <div className="drawer-section-label" style={{ marginBottom: 0 }}>
                    Contacts
                    {contacts.length > 0 && (
                      <span className="ml-2 bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full text-[11px] font-medium normal-case">
                        {contacts.length}
                      </span>
                    )}
                  </div>
                  <ChevronRight
                    className={clsx(
                      'w-4 h-4 text-slate-400 transition-transform duration-200',
                      contactsOpen && 'rotate-90'
                    )}
                  />
                </button>
                {contactsOpen && (
                  <div className="mt-3">
                    {contacts.length === 0 ? (
                      <p className="text-[13px] text-slate-400 py-2">No contacts added yet</p>
                    ) : (
                      <div className="space-y-2">
                        {contacts.map((c) => {
                          const cColor = avatarColor(c.name);
                          return (
                            <div
                              key={c.id}
                              className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl"
                            >
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-bold"
                                style={{ background: `${cColor}18`, color: cColor }}
                              >
                                {c.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-[13px] font-semibold text-slate-900">{c.name}</p>
                                {c.title && <p className="text-[12px] text-slate-500">{c.title}</p>}
                                {c.email && (
                                  <p className="text-[12px] text-blue-600 mt-0.5">{c.email}</p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
