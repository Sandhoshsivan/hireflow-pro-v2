import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  X,
  Pencil,
  Trash2,
  Clock,
  MapPin,
  DollarSign,
  Globe,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import clsx from 'clsx';
import TopBar from '../components/TopBar';
import api from '../lib/api';
import { useToastStore } from '../components/Toast';
import type { Application, ApplicationStatus, Priority, TimelineEntry, Contact } from '../types';

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

  const addToast = useToastStore((s) => s.addToast);

  const fetchApps = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (filterStatus) params.set('status', filterStatus);
      if (sortBy) params.set('sort', sortBy);
      const { data } = await api.get(`/applications?${params}`);
      setApps(data.applications ?? data ?? []);
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
      if (editingApp) {
        await api.put(`/applications/${editingApp.id}`, form);
        addToast('success', 'Application updated');
      } else {
        await api.post('/applications', form);
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
      setTimeline(tlRes.data ?? []);
      setContacts(ctRes.data ?? []);
    } catch {
      setTimeline([]);
      setContacts([]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <TopBar
        title="Applications"
        subtitle={`${apps.length} total applications`}
        actions={
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Application
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company or role..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="pl-10 pr-8 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
          >
            <option value="">All Statuses</option>
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div className="relative">
          <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="pl-10 pr-8 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
          >
            <option value="createdAt_desc">Newest First</option>
            <option value="createdAt_asc">Oldest First</option>
            <option value="company_asc">Company A-Z</option>
            <option value="company_desc">Company Z-A</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
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
                  <td colSpan={7} className="text-center py-12 text-sm text-slate-400">
                    No applications found. Start tracking your job search!
                  </td>
                </tr>
              ) : (
                apps.map((app) => (
                  <tr
                    key={app.id}
                    onClick={() => openDetail(app)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-slate-900">{app.company}</p>
                      <p className="text-xs text-slate-500">{app.role}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={clsx(
                          'inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full capitalize',
                          statusColors[app.status]
                        )}
                      >
                        <span className={clsx('w-1.5 h-1.5 rounded-full', statusDots[app.status])} />
                        {app.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{app.salary || '-'}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{app.source || '-'}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {new Date(app.appliedDate || app.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={clsx('inline-block w-2 h-2 rounded-full', priorityDots[app.priority])}
                        title={app.priority}
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => openEdit(app)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(app.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-lg max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-slate-900">
                {editingApp ? 'Edit Application' : 'Add Application'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Company *</label>
                  <input
                    type="text"
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Role *</label>
                  <input
                    type="text"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as ApplicationStatus })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {priorityOptions.map((p) => (
                      <option key={p} value={p}>
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Salary</label>
                  <input
                    type="text"
                    value={form.salary}
                    onChange={(e) => setForm({ ...form, salary: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="$120,000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="San Francisco, CA"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Source</label>
                  <input
                    type="text"
                    value={form.source}
                    onChange={(e) => setForm({ ...form, source: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="LinkedIn, Indeed, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Follow-up Date</label>
                  <input
                    type="date"
                    value={form.followUpDate}
                    onChange={(e) => setForm({ ...form, followUpDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Job URL</label>
                <input
                  type="url"
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.company || !form.role}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : editingApp ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Drawer */}
      {selectedApp && (
        <div className="fixed inset-0 z-40 flex justify-end bg-black/30 backdrop-blur-sm">
          <div
            className="absolute inset-0"
            onClick={() => setSelectedApp(null)}
          />
          <div className="relative w-full max-w-lg bg-white shadow-xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-semibold text-slate-900">{selectedApp.company}</h2>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-500">Role:</span>
                  <span className="font-medium text-slate-900">{selectedApp.role}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span
                    className={clsx(
                      'inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full capitalize',
                      statusColors[selectedApp.status]
                    )}
                  >
                    {selectedApp.status}
                  </span>
                </div>
                {selectedApp.salary && (
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-900">{selectedApp.salary}</span>
                  </div>
                )}
                {selectedApp.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-900">{selectedApp.location}</span>
                  </div>
                )}
                {selectedApp.source && (
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-900">{selectedApp.source}</span>
                  </div>
                )}
                {selectedApp.url && (
                  <div className="flex items-center gap-2 text-sm">
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                    <a
                      href={selectedApp.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline truncate"
                    >
                      Job Link
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-500">
                    {new Date(selectedApp.appliedDate || selectedApp.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {selectedApp.notes && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">Notes</h4>
                  <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">
                    {selectedApp.notes}
                  </p>
                </div>
              )}

              {/* Timeline */}
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-3">Timeline</h4>
                {timeline.length === 0 ? (
                  <p className="text-sm text-slate-400">No timeline entries</p>
                ) : (
                  <div className="space-y-3">
                    {timeline.map((entry) => (
                      <div key={entry.id} className="flex gap-3 text-sm">
                        <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                        <div>
                          <p className="font-medium text-slate-900">{entry.action}</p>
                          {entry.details && (
                            <p className="text-slate-500 text-xs">{entry.details}</p>
                          )}
                          <p className="text-xs text-slate-400">
                            {new Date(entry.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Contacts */}
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-3">Contacts</h4>
                {contacts.length === 0 ? (
                  <p className="text-sm text-slate-400">No contacts</p>
                ) : (
                  <div className="space-y-2">
                    {contacts.map((c) => (
                      <div
                        key={c.id}
                        className="p-3 bg-slate-50 rounded-lg text-sm"
                      >
                        <p className="font-medium text-slate-900">{c.name}</p>
                        {c.title && <p className="text-xs text-slate-500">{c.title}</p>}
                        {c.email && <p className="text-xs text-blue-600">{c.email}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  onClick={() => {
                    setSelectedApp(null);
                    openEdit(selectedApp);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(selectedApp.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
