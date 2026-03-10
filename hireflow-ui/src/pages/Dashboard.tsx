import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Send,
  Users,
  HandCoins,
  TrendingUp,
  Clock,
  CheckCircle2,
  Plus,
  ArrowRight,
} from 'lucide-react';
import clsx from 'clsx';
import TopBar from '../components/TopBar';
import api from '../lib/api';
import type { Application, ApplicationStats } from '../types';
import { useAuthStore } from '../lib/auth';
import { extractApplications, normalizeStats } from '../lib/normalize';

const statusColors: Record<string, string> = {
  applied: 'bg-blue-100 text-blue-700',
  interview: 'bg-amber-100 text-amber-700',
  offer: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
  ghosted: 'bg-slate-100 text-slate-500',
  saved: 'bg-cyan-100 text-cyan-700',
};

const statusBarColors: Record<string, string> = {
  applied: 'bg-blue-500',
  interview: 'bg-amber-500',
  offer: 'bg-emerald-500',
  rejected: 'bg-red-500',
  ghosted: 'bg-slate-300',
  saved: 'bg-cyan-500',
};

const statusDotColors: Record<string, string> = {
  applied: 'bg-blue-500',
  interview: 'bg-amber-500',
  offer: 'bg-emerald-500',
  rejected: 'bg-red-500',
  ghosted: 'bg-slate-400',
  saved: 'bg-cyan-500',
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

export default function Dashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<ApplicationStats | null>(null);
  const [recentApps, setRecentApps] = useState<Application[]>([]);
  const [followUps, setFollowUps] = useState<Application[]>([]);
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

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, appsRes] = await Promise.all([
          api.get('/applications/stats'),
          api.get('/applications?limit=5&sort=createdAt_desc'),
        ]);
        setStats(normalizeStats(statsRes.data));
        const apps: Application[] = extractApplications(appsRes.data);
        setRecentApps(apps.slice(0, 5));
        setFollowUps(
          apps.filter(
            (a) =>
              a.followUpDate &&
              new Date(a.followUpDate) <= new Date(Date.now() + 3 * 86400000)
          )
        );
      } catch {
        // use empty state
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-[3px] border-slate-200 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-sm font-medium" style={{ color: '#94a3b8' }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const hasNoApplications = (stats?.total ?? 0) === 0 && recentApps.length === 0;

  const kpis = [
    {
      label: 'Total',
      value: stats?.total ?? 0,
      icon: Briefcase,
      iconBg: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      trend: 'All time',
    },
    {
      label: 'Applied',
      value: stats?.applied ?? 0,
      icon: Send,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      trend: 'Submitted',
    },
    {
      label: 'Interviews',
      value: stats?.interviews ?? 0,
      icon: Users,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      trend: 'Scheduled',
    },
    {
      label: 'Offers',
      value: stats?.offers ?? 0,
      icon: HandCoins,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      trend: 'Received',
    },
    {
      label: 'Response Rate',
      value: `${stats?.responseRate ?? 0}%`,
      icon: TrendingUp,
      iconBg: 'bg-violet-50',
      iconColor: 'text-violet-600',
      trend: 'Avg 20% industry',
    },
  ];

  const addAppButton = (
    <Link
      to="/applications"
      className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-lg hover:opacity-90 transition-opacity"
      style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}
    >
      <Plus className="w-4 h-4" />
      Add Application
    </Link>
  );

  if (hasNoApplications) {
    return (
      <div>
        <TopBar
          title={`Good ${greeting}, ${firstName}!`}
          subtitle={formattedDate}
          actions={addAppButton}
        />
        <div className="flex flex-col items-center justify-center py-28 animate-fade-up">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
            style={{ background: 'linear-gradient(135deg, #eef2ff 0%, #ede9fe 100%)' }}
          >
            <Briefcase className="w-10 h-10 text-indigo-400" />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: '#0f172a' }}>
            Start tracking your job search
          </h2>
          <p className="text-sm text-center max-w-sm mb-8" style={{ color: '#64748b' }}>
            Add your first job application to get insights, track follow-ups, and manage your entire job search pipeline in one place.
          </p>
          <Link
            to="/applications"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-lg hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}
          >
            <Plus className="w-4 h-4" />
            Add Your First Application
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <TopBar
        title={`Good ${greeting}, ${firstName}!`}
        subtitle={formattedDate}
        actions={addAppButton}
      />

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-5 mb-6 animate-fade-up">
        {kpis.map((kpi, idx) => (
          <div
            key={kpi.label}
            className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow duration-200"
            style={{
              boxShadow: '0 1px 3px rgba(15,23,42,0.06), 0 4px 16px rgba(15,23,42,0.04)',
              animationDelay: `${idx * 50}ms`,
            }}
          >
            {/* Top row: label + icon */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium uppercase tracking-wide" style={{ color: '#64748b' }}>
                {kpi.label}
              </span>
              <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center', kpi.iconBg)}>
                <kpi.icon className={clsx('w-4 h-4', kpi.iconColor)} />
              </div>
            </div>
            {/* Value */}
            <p
              className="text-2xl font-bold tracking-tight mb-1"
              style={{ color: '#0f172a', letterSpacing: '-0.02em' }}
            >
              {kpi.value}
            </p>
            {/* Trend / subtitle */}
            <p className="text-xs" style={{ color: '#94a3b8' }}>{kpi.trend}</p>
          </div>
        ))}
      </div>

      {/* Bottom 3-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 animate-fade-up" style={{ animationDelay: '150ms' }}>

        {/* Status Distribution */}
        <div
          className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow duration-200"
          style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.06), 0 4px 16px rgba(15,23,42,0.04)' }}
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold" style={{ color: '#0f172a' }}>Status Distribution</h3>
            <span className="text-xs font-medium" style={{ color: '#94a3b8' }}>
              {stats?.total ?? 0} total
            </span>
          </div>
          <div className="space-y-3.5">
            {Object.entries(statusDotColors).map(([status]) => {
              const count = stats?.[status as keyof ApplicationStats] ?? 0;
              const total = stats?.total ?? 1;
              const pct = total > 0 ? Math.round((Number(count) / Number(total)) * 100) : 0;
              return (
                <div key={status} className="flex items-center gap-3">
                  {/* Label */}
                  <span className="text-xs font-medium capitalize w-20 flex-shrink-0" style={{ color: '#475569' }}>
                    {status}
                  </span>
                  {/* Progress bar */}
                  <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={clsx('h-full rounded-full transition-all duration-700 ease-out', statusBarColors[status])}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  {/* Count + pct */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="text-xs font-semibold" style={{ color: '#0f172a' }}>{String(count)}</span>
                    <span className="text-xs w-7 text-right" style={{ color: '#94a3b8' }}>{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Applications */}
        <div
          className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow duration-200"
          style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.06), 0 4px 16px rgba(15,23,42,0.04)' }}
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold" style={{ color: '#0f172a' }}>Recent Applications</h3>
            <Link
              to="/applications"
              className="text-xs font-medium flex items-center gap-1 transition-opacity hover:opacity-70"
              style={{ color: '#6366f1' }}
            >
              View all
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {recentApps.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10">
              <Briefcase className="w-8 h-8 mb-2" style={{ color: '#cbd5e1' }} />
              <p className="text-sm" style={{ color: '#94a3b8' }}>No applications yet</p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {recentApps.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors cursor-default"
                >
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center text-xs font-bold text-indigo-700 shrink-0">
                    {app.company.charAt(0).toUpperCase()}
                  </div>
                  {/* Name + role */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: '#0f172a' }}>{app.company}</p>
                    <p className="text-xs truncate" style={{ color: '#64748b' }}>{app.role}</p>
                  </div>
                  {/* Badge + date */}
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span
                      className={clsx(
                        'text-xs font-semibold px-2 py-0.5 rounded-full capitalize',
                        statusColors[app.status]
                      )}
                    >
                      {app.status}
                    </span>
                    <span className="text-xs" style={{ color: '#94a3b8' }}>
                      {new Date(app.appliedDate || app.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Follow-up Alerts */}
        <div
          className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow duration-200"
          style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.06), 0 4px 16px rgba(15,23,42,0.04)' }}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <h3 className="text-sm font-semibold" style={{ color: '#0f172a' }}>Follow-up Alerts</h3>
            </div>
            {followUps.length > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                {followUps.length}
              </span>
            )}
          </div>

          {followUps.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              </div>
              <p className="text-sm font-semibold mb-1" style={{ color: '#334155' }}>All caught up!</p>
              <p className="text-xs text-center" style={{ color: '#94a3b8' }}>
                No follow-ups due in the next 3 days
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {followUps.map((app) => {
                const dueDate = app.followUpDate ? new Date(app.followUpDate) : null;
                const daysLeft = dueDate
                  ? Math.ceil((dueDate.getTime() - Date.now()) / 86400000)
                  : null;
                const isUrgent = daysLeft !== null && daysLeft <= 1;

                let dueLabelText = 'Follow up needed';
                if (daysLeft === 0) dueLabelText = 'Due today';
                else if (daysLeft === 1) dueLabelText = 'Due tomorrow';
                else if (dueDate) {
                  dueLabelText = `Due in ${daysLeft}d`;
                }

                return (
                  <div
                    key={app.id}
                    className={clsx(
                      'flex items-start gap-3 p-3 rounded-xl border',
                      isUrgent
                        ? 'bg-red-50 border-red-100'
                        : 'bg-amber-50 border-amber-100'
                    )}
                  >
                    {/* Icon container */}
                    <div
                      className={clsx(
                        'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5',
                        isUrgent ? 'bg-red-100' : 'bg-amber-100'
                      )}
                    >
                      <Clock
                        className={clsx('w-3.5 h-3.5', isUrgent ? 'text-red-500' : 'text-amber-600')}
                      />
                    </div>
                    {/* Company + role + due label */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: '#0f172a' }}>
                        {app.company}
                      </p>
                      <p className="text-xs truncate mb-1" style={{ color: '#64748b' }}>{app.role}</p>
                      <span
                        className={clsx(
                          'text-xs font-semibold',
                          isUrgent ? 'text-red-600' : 'text-amber-700'
                        )}
                      >
                        {dueLabelText}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
