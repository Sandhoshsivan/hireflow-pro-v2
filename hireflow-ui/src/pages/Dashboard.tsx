import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Plus,
  ArrowRight,
  Activity,
  Info,
  Clock as ClockIcon,
  Bell,
  CheckCircle2,
} from 'lucide-react';
import clsx from 'clsx';
import TopBar from '../components/TopBar';
import api from '../lib/api';
import type { Application, ApplicationStats } from '../types';
import { useAuthStore } from '../lib/auth';
import { extractApplications, normalizeStats } from '../lib/normalize';

/* ------------------------------------------------------------------ */
/*  Colour tokens                                                      */
/* ------------------------------------------------------------------ */
const BLUE = '#1a56db';
const AMBER = '#d97706';
const GREEN = '#059669';
const RED = '#dc2626';
const VIOLET = '#7c3aed';
const GHOST = '#94a3b8';

const statusBadgeClass: Record<string, string> = {
  applied: 'badge badge-applied',
  interview: 'badge badge-interview',
  offer: 'badge badge-offer',
  rejected: 'badge badge-rejected',
  ghosted: 'badge badge-ghosted',
  saved: 'badge badge-saved',
};

const priorityDotClass: Record<string, string> = {
  high: 'priority-dot p-high',
  medium: 'priority-dot p-medium',
  low: 'priority-dot p-low',
};

/* ------------------------------------------------------------------ */
/*  Funnel bar colours                                                  */
/* ------------------------------------------------------------------ */
const funnelItems = [
  { key: 'applied', label: 'Applied', color: BLUE },
  { key: 'interview', label: 'Interview', color: AMBER },
  { key: 'offer', label: 'Offer', color: GREEN },
  { key: 'rejected', label: 'Rejected', color: RED },
  { key: 'ghosted', label: 'Ghosted', color: GHOST },
] as const;

/* ------------------------------------------------------------------ */
/*  Avatar colour helper                                               */
/* ------------------------------------------------------------------ */
const avatarColors = [BLUE, AMBER, GREEN, VIOLET, RED, '#0891b2', '#db2777'];
function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return avatarColors[Math.abs(h) % avatarColors.length];
}

/* ------------------------------------------------------------------ */
/*  Greeting helper                                                    */
/* ------------------------------------------------------------------ */
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

/* ------------------------------------------------------------------ */
/*  Date helpers                                                       */
/* ------------------------------------------------------------------ */
function fmtShortDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function fmtFollowupDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/* ================================================================== */
/*  Shared card shell                                                   */
/* ================================================================== */
function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx('card', className)}>
      {children}
    </div>
  );
}

function CardHeader({
  icon,
  iconColor: _iconColor,
  title,
  action,
}: {
  icon: React.ReactNode;
  iconColor?: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="card-header">
      <div className="card-title">
        <span className="card-icon">{icon}</span>
        <h3>{title}</h3>
      </div>
      {action}
    </div>
  );
}

/* ================================================================== */
/*  DASHBOARD                                                           */
/* ================================================================== */
export default function Dashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<ApplicationStats | null>(null);
  const [recentApps, setRecentApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const greeting = getGreeting();
  const firstName = user?.name?.split(' ')[0] ?? 'there';

  const loadDashboard = useCallback(async () => {
    try {
      const [statsRes, appsRes] = await Promise.all([
        api.get('/applications/stats'),
        api.get('/applications?limit=7&sort=createdAt_desc'),
      ]);
      setStats(normalizeStats(statsRes.data));
      const apps: Application[] = extractApplications(appsRes.data);
      setRecentApps(apps.slice(0, 7));
    } catch {
      // use empty state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Refetch when user returns to this tab
  useEffect(() => {
    const handleFocus = () => loadDashboard();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [loadDashboard]);

  /* ---- Loading state ---- */
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '16rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div
            className="animate-spin"
            style={{
              width: 32, height: 32,
              border: '3px solid var(--border)',
              borderTopColor: 'var(--blue)',
              borderRadius: '50%',
            }}
          />
          <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text3)' }}>
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  const hasNoApplications = (stats?.total ?? 0) === 0 && recentApps.length === 0;

  /* ---- Add / Track application button ---- */
  const trackAppButton = (
    <Link to="/applications" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <Plus className="w-4 h-4" />
      Track Application
    </Link>
  );

  /* ---- Empty state ---- */
  if (hasNoApplications) {
    return (
      <div>
        <TopBar
          title={`Good ${greeting}, ${firstName}`}
          subtitle={formattedDate}
          actions={trackAppButton}
        />
        <div className="flex flex-col items-center justify-center py-28 animate-fade-up" style={{ padding: '112px 28px' }}>
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
            style={{ background: `${BLUE}12` }}
          >
            <Briefcase className="w-10 h-10" style={{ color: BLUE }} />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text)' }}>
            Start tracking your job search
          </h2>
          <p className="text-sm text-center max-w-sm mb-8" style={{ color: 'var(--text2)' }}>
            Add your first job application to get insights, track follow-ups, and manage your
            entire job search pipeline in one place.
          </p>
          <Link to="/applications" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <Plus className="w-4 h-4" />
            Add Your First Application
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  /* ================================================================ */
  /*  KPI values                                                       */
  /* ================================================================ */
  const kpis = [
    {
      label: 'Total Tracked',
      value: stats?.total ?? 0,
      sub: 'All applications',
      borderColor: BLUE,
    },
    {
      label: 'Interviews',
      value: stats?.interviews ?? 0,
      sub: 'Active conversations',
      borderColor: AMBER,
    },
    {
      label: 'Offers',
      value: stats?.offers ?? 0,
      sub: 'Negotiate hard',
      borderColor: GREEN,
    },
    {
      label: 'Response Rate',
      value: `${stats?.responseRate ?? 0}%`,
      sub:
        (stats?.responseRate ?? 0) > 20
          ? 'Above average!'
          : 'Aim for 20%+',
      borderColor: VIOLET,
    },
  ];

  /* ================================================================ */
  /*  Funnel data                                                      */
  /* ================================================================ */
  const funnelData = funnelItems.map((f) => {
    const val =
      f.key === 'applied'
        ? (stats?.applied ?? 0)
        : f.key === 'interview'
          ? (stats?.interviews ?? 0)
          : f.key === 'offer'
            ? (stats?.offers ?? 0)
            : f.key === 'rejected'
              ? (stats?.rejected ?? 0)
              : (stats?.ghosted ?? 0);
    const pct = (stats?.total ?? 0) > 0 ? Math.round((val / (stats?.total ?? 1)) * 100) : 0;
    return { ...f, val, pct };
  });
  const maxFunnel = Math.max(...funnelData.map((f) => f.val), 1);

  /* ================================================================ */
  /*  Sources data                                                     */
  /* ================================================================ */
  const sources = (stats?.sources ?? []).slice(0, 5);
  const maxSource = Math.max(...sources.map((s) => s.cnt), 1);

  /* ================================================================ */
  /*  Follow-ups                                                       */
  /* ================================================================ */
  const followups = stats?.followups ?? [];

  /* ================================================================ */
  /*  Render                                                           */
  /* ================================================================ */
  return (
    <div>
      <TopBar
        title={`Good ${greeting}, ${firstName}`}
        subtitle={formattedDate}
        actions={trackAppButton}
      />

      <div style={{ padding: 28 }}>
      {/* -------- KPI CARDS (4 columns) -------- */}
      <div className="kpi-grid">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="kpi-card"
            style={{ '--kc': kpi.borderColor } as React.CSSProperties}
          >
            <p className="kpi-num">{kpi.value}</p>
            <p className="kpi-label">{kpi.label}</p>
            <p className="kpi-sub">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* -------- ROW 1: Funnel + Sources & Response Rate -------- */}
      <div
        className="grid-2 animate-fade-up"
        style={{ animationDelay: '100ms', marginBottom: 24 }}
      >
        {/* Application Funnel */}
        <Card>
          <CardHeader
            icon={<Activity className="w-3.5 h-3.5" style={{ color: BLUE }} />}
            iconColor={BLUE}
            title="Application Funnel"
          />
          <div className="card-body">
            <div className="space-y-3">
              {funnelData.map((f) => (
                <div key={f.key} className="bar-row">
                  <span className="bar-label">{f.label}</span>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{
                        width: `${Math.max((f.val / maxFunnel) * 100, f.val > 0 ? 8 : 0)}%`,
                        background: f.color,
                        minWidth: f.val > 0 ? '28px' : '0',
                      }}
                    >
                      <span className="text-[11px] font-bold text-white px-2 leading-none">
                        {f.val}
                      </span>
                    </div>
                  </div>
                  <span className="bar-pct">{f.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Sources & Response Rate */}
        <Card>
          <CardHeader
            icon={<Info className="w-3.5 h-3.5" style={{ color: BLUE }} />}
            iconColor={BLUE}
            title="Sources & Response Rate"
          />
          <div className="card-body">
            <div className="flex gap-6 items-start">
              {/* Left: big response rate + pills */}
              <div className="flex-shrink-0 text-center">
                <div
                  className="font-extrabold leading-none"
                  style={{ fontSize: '36px', color: BLUE, letterSpacing: '-2px' }}
                >
                  {stats?.responseRate ?? 0}%
                </div>
                <div
                  className="text-[10px] font-bold uppercase tracking-wider mt-1"
                  style={{ color: 'var(--text3)' }}
                >
                  Response Rate
                </div>
                <div className="mt-3 flex flex-col gap-1.5">
                  <span
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-full border"
                    style={{ background: `${BLUE}10`, color: BLUE, borderColor: `${BLUE}30` }}
                  >
                    Applied: {stats?.applied ?? 0}
                  </span>
                  <span
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-full border"
                    style={{ background: `${AMBER}10`, color: AMBER, borderColor: `${AMBER}30` }}
                  >
                    Interview: {stats?.interviews ?? 0}
                  </span>
                  <span
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-full border"
                    style={{ background: `${GREEN}10`, color: GREEN, borderColor: `${GREEN}30` }}
                  >
                    Offers: {stats?.offers ?? 0}
                  </span>
                </div>
              </div>

              {/* Right: source bar chart */}
              <div className="flex-1 min-w-0">
                <div
                  className="text-[10px] font-bold uppercase tracking-wider mb-2.5"
                  style={{ color: 'var(--text3)' }}
                >
                  By Source
                </div>
                {sources.length === 0 ? (
                  <p className="text-xs text-center py-4" style={{ color: 'var(--text3)' }}>
                    No source data yet
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {sources.map((s) => (
                      <div key={s.source} className="bar-row">
                        <span className="bar-label">{s.source || 'Other'}</span>
                        <div className="bar-track">
                          <div
                            className="bar-fill"
                            style={{
                              width: `${Math.max((s.cnt / maxSource) * 100, 8)}%`,
                              background: BLUE,
                              minWidth: '24px',
                            }}
                          >
                            <span className="text-[10px] font-bold text-white px-1.5">
                              {s.cnt}
                            </span>
                          </div>
                        </div>
                        <span className="bar-pct">{s.cnt}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* -------- ROW 2: Recent Applications + Follow-ups -------- */}
      <div
        className="grid-2 animate-fade-up"
        style={{ animationDelay: '200ms', marginBottom: 24 }}
      >
        {/* Recent Applications */}
        <Card className="flex flex-col">
          <CardHeader
            icon={<ClockIcon className="w-3.5 h-3.5" style={{ color: BLUE }} />}
            iconColor={BLUE}
            title="Recent Applications"
            action={
              <Link
                to="/applications"
                className="text-xs font-semibold flex items-center gap-1 transition-opacity hover:opacity-70"
                style={{ color: BLUE }}
              >
                View all
                <ArrowRight className="w-3 h-3" />
              </Link>
            }
          />
          {recentApps.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-6">
              <Briefcase className="w-8 h-8 mb-2" style={{ color: 'var(--border)' }} />
              <p className="text-sm" style={{ color: 'var(--text3)' }}>
                No applications yet
              </p>
            </div>
          ) : (
            <div>
              {recentApps.map((app) => {
                const ac = avatarColor(app.company);
                return (
                  <div
                    key={app.id}
                    className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 last:border-b-0 transition-colors duration-100 hover:bg-blue-50/40 cursor-pointer"
                  >
                    {/* Avatar */}
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-extrabold flex-shrink-0"
                      style={{ background: `${ac}18`, color: ac }}
                    >
                      {app.company.charAt(0).toUpperCase()}
                    </div>
                    {/* Company + role */}
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-[13px] font-semibold truncate"
                        style={{ color: 'var(--text)' }}
                      >
                        {app.company}
                      </p>
                      <p className="text-[11px] truncate" style={{ color: 'var(--text2)' }}>
                        {app.role}
                      </p>
                    </div>
                    {/* Right meta: salary + badge + date + priority */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {app.salary && (
                        <span
                          className="text-[11px] font-semibold font-mono"
                          style={{ color: GREEN }}
                        >
                          {app.salary}
                        </span>
                      )}
                      <span className={statusBadgeClass[app.status] ?? 'badge'}>
                        {app.status}
                      </span>
                      <span className="text-[10px] font-mono" style={{ color: 'var(--text3)' }}>
                        {fmtShortDate(app.appliedDate || app.createdAt)}
                      </span>
                      <span
                        className={priorityDotClass[app.priority] ?? 'priority-dot p-low'}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Follow-ups & Reminders */}
        <Card className="flex flex-col">
          <CardHeader
            icon={<Bell className="w-3.5 h-3.5" style={{ color: AMBER }} />}
            iconColor={AMBER}
            title="Follow-ups & Reminders"
          />
          <div className="card-body flex-1 flex flex-col">
            {followups.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                </div>
                <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text)' }}>
                  All caught up!
                </p>
                <p className="text-xs text-center" style={{ color: 'var(--text3)' }}>
                  No pending follow-ups
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {followups.map((f) => (
                  <Link
                    key={f.id}
                    to={`/applications?open=${f.id}`}
                    className="flex items-center justify-between px-3.5 py-3 rounded-lg border transition-shadow duration-150 hover:shadow-md"
                    style={{
                      background: `${AMBER}08`,
                      borderColor: `${AMBER}30`,
                    }}
                  >
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold truncate" style={{ color: 'var(--text)' }}>
                        {f.company}
                      </p>
                      <p className="text-[11px] truncate" style={{ color: 'var(--text2)' }}>
                        {f.role}
                      </p>
                    </div>
                    <span
                      className="text-[11px] font-bold font-mono flex-shrink-0 ml-3"
                      style={{ color: AMBER }}
                    >
                      {fmtFollowupDate(f.followup)}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
      </div>{/* /padding wrapper */}
    </div>
  );
}
