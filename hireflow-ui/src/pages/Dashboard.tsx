import { useEffect, useState } from 'react';
import {
  Briefcase,
  Send,
  Users,
  HandCoins,
  TrendingUp,
  AlertCircle,
  Clock,
} from 'lucide-react';
import clsx from 'clsx';
import TopBar from '../components/TopBar';
import api from '../lib/api';
import type { Application, ApplicationStats } from '../types';
import { useAuthStore } from '../lib/auth';

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

export default function Dashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<ApplicationStats | null>(null);
  const [recentApps, setRecentApps] = useState<Application[]>([]);
  const [followUps, setFollowUps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, appsRes] = await Promise.all([
          api.get('/applications/stats'),
          api.get('/applications?limit=5&sort=createdAt_desc'),
        ]);
        setStats(statsRes.data);
        const apps: Application[] = appsRes.data.applications ?? appsRes.data ?? [];
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

  const kpis = [
    { label: 'Total Applications', value: stats?.total ?? 0, icon: Briefcase, color: 'text-blue-600 bg-blue-50' },
    { label: 'Applied', value: stats?.applied ?? 0, icon: Send, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Interviews', value: stats?.interviews ?? 0, icon: Users, color: 'text-amber-600 bg-amber-50' },
    { label: 'Offers', value: stats?.offers ?? 0, icon: HandCoins, color: 'text-emerald-600 bg-emerald-50' },
    {
      label: 'Response Rate',
      value: `${stats?.responseRate ?? 0}%`,
      icon: TrendingUp,
      color: 'text-violet-600 bg-violet-50',
    },
  ];

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
        title={`Welcome back, ${user?.name?.split(' ')[0] ?? 'there'}`}
        subtitle="Here's your job search overview"
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={clsx('p-2 rounded-lg', kpi.color)}>
                <kpi.icon className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-slate-500">{kpi.label}</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Status Distribution</h3>
          <div className="space-y-3">
            {Object.entries(statusDots).map(([status, dotColor]) => {
              const count =
                stats?.[status as keyof ApplicationStats] ?? 0;
              const total = stats?.total ?? 1;
              const pct = total > 0 ? Math.round((Number(count) / Number(total)) * 100) : 0;
              return (
                <div key={status} className="flex items-center gap-3">
                  <span className={clsx('w-2 h-2 rounded-full', dotColor)} />
                  <span className="text-sm text-slate-600 capitalize flex-1">{status}</span>
                  <span className="text-sm font-medium text-slate-900">{String(count)}</span>
                  <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={clsx('h-full rounded-full', dotColor)}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Applications */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Recent Applications</h3>
          {recentApps.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No applications yet</p>
          ) : (
            <div className="space-y-3">
              {recentApps.map((app) => (
                <div key={app.id} className="flex items-center gap-3 py-1">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{app.company}</p>
                    <p className="text-xs text-slate-500 truncate">{app.role}</p>
                  </div>
                  <span
                    className={clsx(
                      'text-xs font-medium px-2 py-0.5 rounded-full capitalize',
                      statusColors[app.status]
                    )}
                  >
                    {app.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Follow-up Alerts */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            Follow-up Alerts
          </h3>
          {followUps.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No pending follow-ups</p>
          ) : (
            <div className="space-y-3">
              {followUps.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center gap-3 p-2 bg-amber-50 rounded-lg border border-amber-100"
                >
                  <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{app.company}</p>
                    <p className="text-xs text-slate-500">
                      Follow up by{' '}
                      {app.followUpDate
                        ? new Date(app.followUpDate).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
