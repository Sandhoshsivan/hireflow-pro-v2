import { useEffect, useState } from 'react';
import {
  Clock,
  DollarSign,
  X,
  MapPin,
  ExternalLink,
  Tag,
  Briefcase,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import clsx from 'clsx';
import TopBar from '../components/TopBar';
import api from '../lib/api';
import type { Application, ApplicationStatus } from '../types';

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  saved: '#06b6d4',
  applied: '#3b82f6',
  interview: '#f59e0b',
  offer: '#10b981',
  rejected: '#ef4444',
  ghosted: '#94a3b8',
};

const STATUS_BG_LIGHT: Record<ApplicationStatus, string> = {
  saved: 'rgba(6,182,212,0.08)',
  applied: 'rgba(59,130,246,0.08)',
  interview: 'rgba(245,158,11,0.08)',
  offer: 'rgba(16,185,129,0.08)',
  rejected: 'rgba(239,68,68,0.08)',
  ghosted: 'rgba(148,163,184,0.08)',
};

const statusBadge: Record<ApplicationStatus, string> = {
  saved: 'bg-cyan-100 text-cyan-700',
  applied: 'bg-blue-100 text-blue-700',
  interview: 'bg-amber-100 text-amber-700',
  offer: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
  ghosted: 'bg-slate-100 text-slate-500',
};

const priorityDots: Record<string, string> = {
  high: 'bg-red-500',
  medium: 'bg-amber-400',
  low: 'bg-slate-300',
};

const columns: {
  status: ApplicationStatus;
  label: string;
}[] = [
  { status: 'saved', label: 'Saved' },
  { status: 'applied', label: 'Applied' },
  { status: 'interview', label: 'Interview' },
  { status: 'offer', label: 'Offer' },
  { status: 'rejected', label: 'Rejected' },
  { status: 'ghosted', label: 'Ghosted' },
];

function hasUpcomingFollowUp(app: Application): boolean {
  if (!app.followUpDate) return false;
  return new Date(app.followUpDate) <= new Date(Date.now() + 3 * 86400000);
}

function KanbanCard({
  app,
  onClick,
}: {
  app: Application;
  onClick: () => void;
}) {
  const upcoming = hasUpcomingFollowUp(app);
  const dueDate = app.followUpDate ? new Date(app.followUpDate) : null;
  const daysLeft = dueDate ? Math.ceil((dueDate.getTime() - Date.now()) / 86400000) : null;

  let followUpLabel = '';
  if (upcoming && dueDate) {
    if (daysLeft === 0) followUpLabel = 'Follow up today';
    else if (daysLeft === 1) followUpLabel = 'Follow up tomorrow';
    else followUpLabel = `Follow up ${dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  }

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md hover:border-indigo-200 transition-all duration-150 cursor-pointer group"
      style={{ boxShadow: '0 1px 2px rgba(15,23,42,0.04)' }}
    >
      {/* Header */}
      <div className="flex items-start gap-2.5 mb-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
          style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
        >
          {app.company.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-semibold leading-tight group-hover:text-indigo-700 transition-colors truncate"
            style={{ color: '#0f172a' }}
          >
            {app.company}
          </p>
          <p className="text-xs truncate mt-0.5" style={{ color: '#64748b' }}>
            {app.role}
          </p>
        </div>
        <span
          className={clsx('w-2 h-2 rounded-full flex-shrink-0 mt-1', priorityDots[app.priority])}
          title={`${app.priority} priority`}
        />
      </div>

      {/* Follow-up strip */}
      {upcoming && (
        <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg mb-3 border border-amber-200 bg-amber-50">
          <Clock className="w-3 h-3 text-amber-500 flex-shrink-0" />
          <span className="text-xs font-medium text-amber-700">{followUpLabel}</span>
        </div>
      )}

      {/* Footer meta */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {app.source && (
            <span
              className="inline-flex items-center gap-1 text-xs rounded-md px-1.5 py-0.5"
              style={{ background: '#f1f5f9', color: '#64748b' }}
            >
              <Tag className="w-2.5 h-2.5" />
              {app.source}
            </span>
          )}
        </div>
        <span className="text-xs flex-shrink-0" style={{ color: '#94a3b8' }}>
          {new Date(app.appliedDate || app.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}
        </span>
      </div>
    </div>
  );
}

function EmptyColumn() {
  return (
    <div className="rounded-xl border-2 border-dashed border-slate-200 p-6 text-center">
      <p className="text-xs" style={{ color: '#94a3b8' }}>No applications</p>
    </div>
  );
}

export default function Pipeline() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/applications');
        setApps(data.applications ?? data ?? []);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const grouped = columns.map((col) => ({
    ...col,
    apps: apps.filter((a) => a.status === col.status),
  }));

  if (loading) {
    return (
      <div>
        <TopBar title="Pipeline" subtitle="Visual pipeline of your job search" />
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-[3px] border-indigo-100 border-t-indigo-500 rounded-full animate-spin" />
            <p className="text-sm font-medium" style={{ color: '#94a3b8' }}>Loading your pipeline...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <TopBar title="Pipeline" subtitle="Visual pipeline of your job search" />
        <div className="flex flex-col items-center justify-center h-64">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
            <AlertCircle className="w-7 h-7 text-red-400" />
          </div>
          <h3 className="text-base font-semibold mb-1" style={{ color: '#334155' }}>Failed to load pipeline</h3>
          <p className="text-sm mb-5" style={{ color: '#94a3b8' }}>There was an error fetching your applications.</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary text-sm"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <TopBar
        title="Pipeline"
        subtitle="Drag-free visual pipeline"
      />

      {/* Kanban Board */}
      <div
        className="overflow-x-auto pb-6"
        style={{ minHeight: 'calc(100vh - 200px)' }}
      >
        <div className="flex gap-5" style={{ minWidth: 'max-content' }}>
          {grouped.map((col, colIdx) => {
            const accentColor = STATUS_COLORS[col.status];
            const bgLight = STATUS_BG_LIGHT[col.status];
            return (
              <div
                key={col.status}
                className="flex flex-col animate-fade-up"
                style={{
                  minWidth: 260,
                  maxWidth: 280,
                  animationDelay: `${colIdx * 60}ms`,
                }}
              >
                {/* Column Header */}
                <div
                  className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-center justify-between"
                  style={{
                    borderLeft: `4px solid ${accentColor}`,
                    boxShadow: '0 1px 3px rgba(15,23,42,0.06)',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: accentColor }}
                    />
                    <span className="text-sm font-semibold" style={{ color: '#0f172a' }}>
                      {col.label}
                    </span>
                  </div>
                  <span
                    className={clsx(
                      'text-xs font-bold px-2 py-0.5 rounded-full',
                      col.apps.length > 0 ? statusBadge[col.status] : 'bg-slate-100 text-slate-400'
                    )}
                  >
                    {col.apps.length}
                  </span>
                </div>

                {/* Cards container */}
                <div
                  className="rounded-xl p-2 flex-1 mt-2 space-y-2"
                  style={{ background: bgLight, minHeight: 400 }}
                >
                  {col.apps.length === 0 ? (
                    <EmptyColumn />
                  ) : (
                    col.apps.map((app) => (
                      <KanbanCard
                        key={app.id}
                        app={app}
                        onClick={() => setSelectedApp(app)}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Card Detail Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div
            className="bg-white rounded-2xl max-w-md w-full overflow-hidden"
            style={{ boxShadow: '0 25px 50px rgba(15,23,42,0.25)' }}
          >
            {/* Gradient top bar */}
            <div className="h-1" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }} />

            {/* Header */}
            <div className="flex items-start justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
                >
                  {selectedApp.company.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-base font-bold" style={{ color: '#0f172a' }}>
                    {selectedApp.company}
                  </h2>
                  <p className="text-sm" style={{ color: '#64748b' }}>{selectedApp.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={clsx(
                    'text-xs font-semibold px-2.5 py-1 rounded-full capitalize',
                    statusBadge[selectedApp.status]
                  )}
                >
                  {selectedApp.status}
                </span>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors flex-shrink-0"
                  style={{ color: '#94a3b8' }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {selectedApp.salary && (
                  <div className="flex items-center gap-2.5 p-3 rounded-xl" style={{ background: '#f8fafc' }}>
                    <DollarSign className="w-4 h-4 flex-shrink-0" style={{ color: '#94a3b8' }} />
                    <div>
                      <p className="text-xs mb-0.5" style={{ color: '#94a3b8' }}>Salary</p>
                      <p className="text-sm font-semibold" style={{ color: '#0f172a' }}>{selectedApp.salary}</p>
                    </div>
                  </div>
                )}
                {selectedApp.location && (
                  <div className="flex items-center gap-2.5 p-3 rounded-xl" style={{ background: '#f8fafc' }}>
                    <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: '#94a3b8' }} />
                    <div>
                      <p className="text-xs mb-0.5" style={{ color: '#94a3b8' }}>Location</p>
                      <p className="text-sm font-semibold" style={{ color: '#0f172a' }}>{selectedApp.location}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2.5 p-3 rounded-xl" style={{ background: '#f8fafc' }}>
                  <Calendar className="w-4 h-4 flex-shrink-0" style={{ color: '#94a3b8' }} />
                  <div>
                    <p className="text-xs mb-0.5" style={{ color: '#94a3b8' }}>Applied</p>
                    <p className="text-sm font-semibold" style={{ color: '#0f172a' }}>
                      {new Date(selectedApp.appliedDate || selectedApp.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                {selectedApp.source && (
                  <div className="flex items-center gap-2.5 p-3 rounded-xl" style={{ background: '#f8fafc' }}>
                    <Tag className="w-4 h-4 flex-shrink-0" style={{ color: '#94a3b8' }} />
                    <div>
                      <p className="text-xs mb-0.5" style={{ color: '#94a3b8' }}>Source</p>
                      <p className="text-sm font-semibold" style={{ color: '#0f172a' }}>{selectedApp.source}</p>
                    </div>
                  </div>
                )}
                {selectedApp.url && (
                  <div className="flex items-center gap-2.5 p-3 rounded-xl" style={{ background: '#f8fafc' }}>
                    <ExternalLink className="w-4 h-4 flex-shrink-0" style={{ color: '#94a3b8' }} />
                    <div>
                      <p className="text-xs mb-0.5" style={{ color: '#94a3b8' }}>Job Link</p>
                      <a
                        href={selectedApp.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold hover:underline"
                        style={{ color: '#6366f1' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        Open listing
                      </a>
                    </div>
                  </div>
                )}
                {selectedApp.priority && (
                  <div className="flex items-center gap-2.5 p-3 rounded-xl" style={{ background: '#f8fafc' }}>
                    <Briefcase className="w-4 h-4 flex-shrink-0" style={{ color: '#94a3b8' }} />
                    <div>
                      <p className="text-xs mb-0.5" style={{ color: '#94a3b8' }}>Priority</p>
                      <p className="text-sm font-semibold capitalize" style={{ color: '#0f172a' }}>
                        {selectedApp.priority}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {selectedApp.notes && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#94a3b8' }}>
                    Notes
                  </p>
                  <p
                    className="text-sm leading-relaxed p-4 rounded-xl"
                    style={{ color: '#334155', background: '#f8fafc' }}
                  >
                    {selectedApp.notes}
                  </p>
                </div>
              )}

              {hasUpcomingFollowUp(selectedApp) && selectedApp.followUpDate && (
                <div className="flex items-center gap-2.5 p-3 rounded-xl border border-amber-200 bg-amber-50">
                  <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-amber-600">Follow-up due</p>
                    <p className="text-sm font-semibold text-amber-800">
                      {new Date(selectedApp.followUpDate).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 pb-5">
              <button
                onClick={() => setSelectedApp(null)}
                className="w-full py-2.5 text-sm font-semibold rounded-xl transition-colors hover:bg-slate-200"
                style={{ background: '#f1f5f9', color: '#475569' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
