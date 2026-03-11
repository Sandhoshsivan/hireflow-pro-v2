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

/* ── Priority label colors (CSS variables) ── */
const priorityLabelColor: Record<string, string> = {
  high: 'var(--red)',
  medium: 'var(--amber)',
  low: 'var(--green)',
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
    <div className="form-group">
      <label className="form-label">
        {label}
        {required && <span style={{ color: 'var(--red)', marginLeft: 2 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass = 'form-input';

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 256 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div className="loading-spinner" />
          <p className="loading-text">Loading applications...</p>
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
          <>
            {/* Filter bar container */}
            <div className="filter-bar-container">
              <div className="search-wrap">
                <span className="search-icon">
                  <Search size={14} />
                </span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search company, role..."
                  className="form-input search-input"
                  style={{ width: 200, background: 'var(--white)' }}
                />
              </div>
              <div style={{ width: 1, height: 20, background: 'var(--border)', flexShrink: 0 }} />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="form-select"
                style={{ width: 126, background: 'var(--white)' }}
              >
                <option value="">All Status</option>
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="form-select"
                style={{ width: 136, background: 'var(--white)' }}
              >
                <option value="createdAt_desc">Newest First</option>
                <option value="createdAt_asc">Oldest First</option>
                <option value="company_asc">Company A-Z</option>
                <option value="company_desc">Company Z-A</option>
              </select>
            </div>
            {/* Track Job button */}
            <button onClick={openAdd} className="btn btn-primary">
              <Plus size={14} strokeWidth={2.5} />
              Track Job
            </button>
          </>
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
                        <span className={`badge badge-${app.status}`}>
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
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
                          className={`priority-dot p-${app.priority}`}
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
                <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2 }}>
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-grid">
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

                <div className="form-grid">
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

                <div className="form-grid">
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

                <div className="form-grid">
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
                    className="form-textarea"
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
              <div style={{ minWidth: 0, flex: 1 }}>
                {/* Company name */}
                <h2 className="drawer-company">{selectedApp.company}</h2>
                {/* Role + location */}
                <p className="drawer-role">
                  {selectedApp.role}
                  {selectedApp.location && (
                    <span className="drawer-role-sep">{'  \u00B7  '}{selectedApp.location}</span>
                  )}
                </p>
                {/* Action row: badge + edit + status dropdown + job link + delete */}
                <div className="drawer-actions">
                  {/* Status badge */}
                  <span className={`badge badge-${selectedApp.status}`} style={{ textTransform: 'capitalize' }}>
                    {selectedApp.status}
                  </span>
                  {/* Edit button */}
                  <button
                    onClick={() => {
                      setSelectedApp(null);
                      openEdit(selectedApp);
                    }}
                    className="drawer-btn-sm"
                  >
                    <Pencil style={{ width: 12, height: 12 }} />
                    Edit
                  </button>
                  {/* Quick status dropdown */}
                  <div style={{ position: 'relative' }}>
                    <select
                      value={drawerStatus}
                      onChange={(e) => handleQuickStatus(e.target.value as ApplicationStatus)}
                      className="drawer-status-select"
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      style={{
                        position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
                        width: 10, height: 10, color: 'var(--text3)', pointerEvents: 'none',
                      }}
                    />
                  </div>
                  {/* Job post link */}
                  {selectedApp.url && (
                    <a
                      href={selectedApp.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="drawer-btn-sm"
                    >
                      <Link2 style={{ width: 12, height: 12 }} />
                      Job Post
                    </a>
                  )}
                  {/* Delete button */}
                  <button
                    onClick={() => handleDelete(selectedApp.id)}
                    className="drawer-btn-sm drawer-btn-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {/* Close button */}
              <button
                onClick={() => setSelectedApp(null)}
                className="drawer-close"
              >
                <X style={{ width: 16, height: 16 }} />
              </button>
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
                      <span style={{ color: 'var(--text3)', marginLeft: 4 }}>
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
                      <span className={`priority-dot p-${selectedApp.priority}`} />
                      <span style={{ textTransform: 'capitalize', color: priorityLabelColor[selectedApp.priority] }}>
                        {selectedApp.priority}
                      </span>
                    </div>
                  </div>
                  {/* Follow-up (if exists) */}
                  {selectedApp.followUpDate && (
                    <div className="info-row">
                      <div className="info-key">Follow-up</div>
                      <div
                        className="info-val"
                        style={isOverdue(selectedApp.followUpDate) ? { color: 'var(--amber)' } : undefined}
                      >
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
                  <p className="drawer-notes">{selectedApp.notes}</p>
                </div>
              )}

              {/* Timeline section */}
              <div className="drawer-section">
                <button
                  onClick={() => setTimelineOpen(!timelineOpen)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  <div className="drawer-section-label" style={{ marginBottom: 0 }}>
                    Timeline
                    {timeline.length > 0 && (
                      <span className="drawer-count-badge">{timeline.length}</span>
                    )}
                  </div>
                  <ChevronRight
                    style={{
                      width: 16, height: 16, color: 'var(--text3)',
                      transition: 'transform 200ms', transform: timelineOpen ? 'rotate(90deg)' : 'none',
                    }}
                  />
                </button>
                {timelineOpen && (
                  <div style={{ marginTop: 12 }}>
                    {timeline.length === 0 ? (
                      <p style={{ fontSize: 13, color: 'var(--text3)', padding: '8px 0' }}>No timeline entries yet</p>
                    ) : (
                      <div className="timeline">
                        {timeline.map((entry, idx) => (
                          <div key={entry.id} className="tl-item">
                            {/* Left: dot + line */}
                            <div className="tl-left">
                              <div className="tl-dot" />
                              {idx < timeline.length - 1 && <div className="tl-line" />}
                            </div>
                            {/* Content */}
                            <div className="tl-content">
                              <p className="tl-action">{entry.action}</p>
                              {entry.details && (
                                <p style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>{entry.details}</p>
                              )}
                              <p className="tl-time">
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
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    value={timelineNote}
                    onChange={(e) => setTimelineNote(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTimelineNote()}
                    placeholder="e.g. Called recruiter, Sent follow-up..."
                    className="tl-note-input"
                  />
                  <button
                    onClick={handleAddTimelineNote}
                    disabled={addingNote || !timelineNote.trim()}
                    className="tl-note-btn"
                  >
                    <Send style={{ width: 14, height: 14 }} />
                    Add
                  </button>
                </div>
              </div>

              {/* Contacts (collapsible) */}
              <div className="drawer-section">
                <button
                  onClick={() => setContactsOpen(!contactsOpen)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  <div className="drawer-section-label" style={{ marginBottom: 0 }}>
                    Contacts
                    {contacts.length > 0 && (
                      <span className="drawer-count-badge">{contacts.length}</span>
                    )}
                  </div>
                  <ChevronRight
                    style={{
                      width: 16, height: 16, color: 'var(--text3)',
                      transition: 'transform 200ms', transform: contactsOpen ? 'rotate(90deg)' : 'none',
                    }}
                  />
                </button>
                {contactsOpen && (
                  <div style={{ marginTop: 12 }}>
                    {contacts.length === 0 ? (
                      <p style={{ fontSize: 13, color: 'var(--text3)', padding: '8px 0' }}>No contacts added yet</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {contacts.map((c) => {
                          const cColor = avatarColor(c.name);
                          return (
                            <div key={c.id} className="contact-card">
                              <div
                                className="contact-avatar"
                                style={{ background: `${cColor}18`, color: cColor }}
                              >
                                {c.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="contact-name">{c.name}</p>
                                {c.title && <p className="contact-title">{c.title}</p>}
                                {c.email && <p className="contact-email">{c.email}</p>}
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
