import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Plus,
  Search,
  ArrowUpDown,
  X,
  Pencil,
  Trash2,
  MapPin,
  DollarSign,
  Globe,
  ExternalLink,
  Briefcase,
  ChevronDown,
  ChevronRight,
  Calendar,
  Tag,
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

const statusColors: Record<string, string> = {
  applied: 'bg-blue-100 text-blue-700',
  interview: 'bg-amber-100 text-amber-700',
  offer: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
  ghosted: 'bg-slate-100 text-slate-500',
  saved: 'bg-cyan-100 text-cyan-700',
};

const statusDots: Record<string, string> = {
  applied: 'bg-blue-500',
  interview: 'bg-amber-500',
  offer: 'bg-emerald-500',
  rejected: 'bg-red-500',
  ghosted: 'bg-slate-400',
  saved: 'bg-cyan-500',
};

const priorityDots: Record<string, string> = {
  high: 'bg-red-500',
  medium: 'bg-amber-500',
  low: 'bg-slate-400',
};

const priorityLabels: Record<string, string> = {
  high: 'text-red-600',
  medium: 'text-amber-600',
  low: 'text-slate-400',
};

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
      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  'w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white';

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
    try {
      const [tlRes, ctRes] = await Promise.all([
        api.get(`/applications/${app.id}/timeline`),
        api.get(`/applications/${app.id}/contacts`),
      ]);
      const rawTimeline: Record<string, unknown>[] = tlRes.data ?? [];
      setTimeline(rawTimeline.map((t) => ({
        id: t.id as number,
        applicationId: (t.applicationId as number) ?? 0,
        action: (t.action as string) ?? `${t.fromStatus} → ${t.toStatus}`,
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-[3px] border-slate-200 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Loading applications...</p>
        </div>
      </div>
    );
  }

  const allPills = [
    { label: 'All', value: '' },
    ...statusOptions.map((s) => ({ label: s.charAt(0).toUpperCase() + s.slice(1), value: s })),
  ];

  return (
    <div>
      {/* TopBar */}
      <TopBar
        title="Applications"
        subtitle={`${apps.length} ${apps.length === 1 ? 'application' : 'applications'} tracked`}
        actions={
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-lg hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}
          >
            <Plus className="w-4 h-4" />
            Add Application
          </button>
        }
      />

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search company or role..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
            />
          </div>

          {/* Status Pills */}
          <div className="flex gap-1.5 flex-wrap">
            {allPills.map((pill) => (
              <button
                key={pill.value}
                onClick={() => setFilterStatus(pill.value)}
                className={clsx(
                  'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                  filterStatus === pill.value
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                {pill.label}
              </button>
            ))}
          </div>

          {/* Sort dropdown */}
          <div className="relative">
            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="pl-9 pr-8 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer text-slate-700"
            >
              <option value="createdAt_desc">Newest First</option>
              <option value="createdAt_asc">Oldest First</option>
              <option value="company_asc">Company A-Z</option>
              <option value="company_desc">Company Z-A</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Result count */}
          <span className="text-xs text-slate-400 font-medium ml-auto whitespace-nowrap">
            {apps.length} {apps.length === 1 ? 'result' : 'results'}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Company / Role
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Salary
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Source
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {apps.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="flex flex-col items-center justify-center py-20">
                      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                        <Briefcase className="w-8 h-8 text-slate-400" />
                      </div>
                      <h3 className="text-base font-semibold text-slate-700 mb-1">No applications yet</h3>
                      <p className="text-sm text-slate-400 mb-6 text-center max-w-xs">
                        Start tracking your job applications to get organized and land your dream role.
                      </p>
                      <button
                        onClick={openAdd}
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-lg hover:opacity-90 transition-opacity"
                        style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}
                      >
                        <Plus className="w-4 h-4" />
                        Add your first application
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                apps.map((app) => (
                  <tr
                    key={app.id}
                    onClick={() => openDetail(app)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                  >
                    {/* Company / Role */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-indigo-700">
                            {app.company.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{app.company}</p>
                          <p className="text-xs text-slate-500">{app.role}</p>
                        </div>
                      </div>
                    </td>
                    {/* Status */}
                    <td className="px-4 py-3">
                      <span
                        className={clsx(
                          'inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full capitalize',
                          statusColors[app.status]
                        )}
                      >
                        <span className={clsx('w-1.5 h-1.5 rounded-full', statusDots[app.status])} />
                        {app.status}
                      </span>
                    </td>
                    {/* Salary */}
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-600">{app.salary || '—'}</span>
                    </td>
                    {/* Location */}
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-600">{app.location || '—'}</span>
                    </td>
                    {/* Source */}
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-600">{app.source || '—'}</span>
                    </td>
                    {/* Date */}
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-500">
                        {new Date(app.appliedDate || app.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </td>
                    {/* Priority */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className={clsx('w-2 h-2 rounded-full', priorityDots[app.priority])} title={app.priority} />
                        <span className={clsx('text-xs font-medium capitalize', priorityLabels[app.priority])}>
                          {app.priority}
                        </span>
                      </div>
                    </td>
                    {/* Actions — appear on row hover */}
                    <td className="px-4 py-3 text-right">
                      <div
                        className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => openEdit(app)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(app.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Top gradient bar */}
            <div className="h-1 bg-gradient-to-r from-indigo-500 to-violet-500 flex-shrink-0" />

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 flex-shrink-0">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingApp ? 'Edit Application' : 'Add Application'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {editingApp ? `Updating ${editingApp.company}` : 'Track a new job opportunity'}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body — scrollable form */}
            <div className="overflow-y-auto flex-1 px-6 py-5">
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
            <div className="flex items-center gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex-shrink-0">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.company || !form.role}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}
              >
                {saving ? 'Saving...' : editingApp ? 'Update Application' : 'Create Application'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Drawer */}
      {selectedApp && (
        <div className="fixed inset-0 z-40 flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setSelectedApp(null)}
          />
          {/* Panel */}
          <div className="relative w-full max-w-xl bg-white shadow-2xl flex flex-col animate-slide-in-from-right">
            {/* Top gradient bar */}
            <div className="h-1 bg-gradient-to-r from-indigo-500 to-violet-500 flex-shrink-0" />

            {/* Sticky header */}
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-5 flex-shrink-0 z-10">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {/* Company avatar */}
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-indigo-700">
                      {selectedApp.company.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">{selectedApp.company}</h2>
                    <p className="text-sm text-slate-500">{selectedApp.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Status badge */}
                  <span
                    className={clsx(
                      'inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full capitalize',
                      statusColors[selectedApp.status]
                    )}
                  >
                    <span className={clsx('w-1.5 h-1.5 rounded-full', statusDots[selectedApp.status])} />
                    {selectedApp.status}
                  </span>
                  {/* Close */}
                  <button
                    onClick={() => setSelectedApp(null)}
                    className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 p-6 space-y-6">
              {/* Info grid cards */}
              <div className="grid grid-cols-2 gap-3">
                {selectedApp.salary && (
                  <div className="flex items-center gap-2.5 p-3 bg-slate-50 rounded-xl">
                    <DollarSign className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Salary</p>
                      <p className="text-sm font-semibold text-slate-900">{selectedApp.salary}</p>
                    </div>
                  </div>
                )}
                {selectedApp.location && (
                  <div className="flex items-center gap-2.5 p-3 bg-slate-50 rounded-xl">
                    <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Location</p>
                      <p className="text-sm font-semibold text-slate-900">{selectedApp.location}</p>
                    </div>
                  </div>
                )}
                {selectedApp.source && (
                  <div className="flex items-center gap-2.5 p-3 bg-slate-50 rounded-xl">
                    <Globe className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Source</p>
                      <p className="text-sm font-semibold text-slate-900">{selectedApp.source}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2.5 p-3 bg-slate-50 rounded-xl">
                  <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Applied</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {new Date(selectedApp.appliedDate || selectedApp.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 p-3 bg-slate-50 rounded-xl">
                  <Tag className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Priority</p>
                    <p className={clsx('text-sm font-semibold capitalize', priorityLabels[selectedApp.priority])}>
                      {selectedApp.priority}
                    </p>
                  </div>
                </div>
                {selectedApp.url && (
                  <div className="flex items-center gap-2.5 p-3 bg-slate-50 rounded-xl">
                    <ExternalLink className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Job Link</p>
                      <a
                        href={selectedApp.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
                      >
                        Open listing
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Notes section */}
              {selectedApp.notes && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Notes</h4>
                  <p className="text-sm text-slate-700 bg-slate-50 rounded-xl p-4 leading-relaxed">
                    {selectedApp.notes}
                  </p>
                </div>
              )}

              {/* Timeline (collapsible) */}
              <div>
                <button
                  onClick={() => setTimelineOpen(!timelineOpen)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Timeline
                    {timeline.length > 0 && (
                      <span className="ml-2 bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full text-xs font-medium normal-case">
                        {timeline.length}
                      </span>
                    )}
                  </h4>
                  <ChevronRight
                    className={clsx(
                      'w-4 h-4 text-slate-400 transition-transform',
                      timelineOpen && 'rotate-90'
                    )}
                  />
                </button>
                {timelineOpen && (
                  <div className="mt-3">
                    {timeline.length === 0 ? (
                      <p className="text-sm text-slate-400 py-2">No timeline entries yet</p>
                    ) : (
                      <div className="space-y-3 relative">
                        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-slate-200" />
                        {timeline.map((entry) => (
                          <div key={entry.id} className="flex gap-3 text-sm pl-1">
                            <div className="w-3.5 h-3.5 rounded-full bg-indigo-500 border-2 border-white ring-1 ring-indigo-200 mt-0.5 shrink-0 z-10" />
                            <div className="pb-2">
                              <p className="font-semibold text-slate-900">{entry.action}</p>
                              {entry.details && (
                                <p className="text-slate-500 text-xs mt-0.5">{entry.details}</p>
                              )}
                              <p className="text-xs text-slate-400 mt-1">
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

              {/* Contacts (collapsible) */}
              <div>
                <button
                  onClick={() => setContactsOpen(!contactsOpen)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Contacts
                    {contacts.length > 0 && (
                      <span className="ml-2 bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full text-xs font-medium normal-case">
                        {contacts.length}
                      </span>
                    )}
                  </h4>
                  <ChevronRight
                    className={clsx(
                      'w-4 h-4 text-slate-400 transition-transform',
                      contactsOpen && 'rotate-90'
                    )}
                  />
                </button>
                {contactsOpen && (
                  <div className="mt-3">
                    {contacts.length === 0 ? (
                      <p className="text-sm text-slate-400 py-2">No contacts added yet</p>
                    ) : (
                      <div className="space-y-2">
                        {contacts.map((c) => (
                          <div
                            key={c.id}
                            className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl"
                          >
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-indigo-700">
                                {c.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{c.name}</p>
                              {c.title && <p className="text-xs text-slate-500">{c.title}</p>}
                              {c.email && (
                                <p className="text-xs text-indigo-600 mt-0.5">{c.email}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Footer: Edit + Delete */}
            <div className="flex gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex-shrink-0">
              <button
                onClick={() => {
                  setSelectedApp(null);
                  openEdit(selectedApp);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors"
              >
                <Pencil className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => handleDelete(selectedApp.id)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
