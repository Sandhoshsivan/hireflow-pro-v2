import { useEffect, useState, useCallback } from 'react';
import {
  Users, Briefcase, DollarSign, TrendingUp, RefreshCw,
  UserCheck, Crown,
} from 'lucide-react';
import clsx from 'clsx';
import TopBar from '../../components/TopBar';
import api from '../../lib/api';
import type { AdminStats } from '../../types';

const planConfig: Record<string, { label: string; bar: string; badge: string }> = {
  free:    { label: 'Free',    bar: 'bg-slate-400',    badge: 'bg-slate-100 text-slate-600' },
  pro:     { label: 'Pro',     bar: 'bg-indigo-500',   badge: 'bg-indigo-100 text-indigo-700' },
  premium: { label: 'Premium', bar: 'bg-violet-500',   badge: 'bg-violet-100 text-violet-700' },
};

const statusConfig: Record<string, { label: string; bar: string }> = {
  saved:     { label: 'Saved',     bar: 'bg-cyan-500' },
  applied:   { label: 'Applied',   bar: 'bg-blue-500' },
  interview: { label: 'Interview', bar: 'bg-amber-500' },
  offer:     { label: 'Offer',     bar: 'bg-emerald-500' },
  rejected:  { label: 'Rejected',  bar: 'bg-red-500' },
  ghosted:   { label: 'Ghosted',   bar: 'bg-slate-400' },
};

function HBar({
  label,
  value,
  max,
  barClass,
}: {
  label: string;
  value: number;
  max: number;
  barClass: string;
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs w-20 capitalize truncate shrink-0" style={{ color: '#475569' }}>{label}</span>
      <div className="flex-1 h-5 rounded-lg overflow-hidden" style={{ background: '#f1f5f9' }}>
        <div
          className={clsx('h-full rounded-lg transition-all duration-700', barClass)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-semibold w-10 text-right shrink-0" style={{ color: '#0f172a' }}>
        {value}
      </span>
    </div>
  );
}

function RevenueSVGChart({ data }: { data: Array<{ month: string; amount: number }> }) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-sm" style={{ color: '#94a3b8' }}>No revenue data yet</p>
      </div>
    );
  }

  const width = 400;
  const height = 120;
  const barWidth = Math.min(28, (width - 40) / data.length - 6);
  const maxAmt = Math.max(...data.map((d) => d.amount), 1);
  const chartH = height - 30;
  const startX = 20;
  const spacing = (width - 40) / Math.max(data.length, 1);

  return (
    <svg viewBox={`0 0 ${width} ${height + 10}`} className="w-full">
      <defs>
        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.6" />
        </linearGradient>
      </defs>
      {data.map((d, i) => {
        const barH = (d.amount / maxAmt) * chartH;
        const x = startX + i * spacing + (spacing - barWidth) / 2;
        const y = chartH - barH;
        return (
          <g key={i}>
            <rect
              x={x} y={y}
              width={barWidth} height={barH}
              rx={4} fill="url(#revGrad)"
              className="hover:opacity-80 transition-opacity cursor-pointer"
            >
              <title>{`${d.month}: $${d.amount}`}</title>
            </rect>
            <text
              x={x + barWidth / 2}
              y={height + 8}
              textAnchor="middle"
              style={{ fontSize: 8, fill: '#94a3b8' }}
            >
              {d.month.slice(-5)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const { data } = await api.get('/admin/stats');
      setStats(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadStats(false);
  }, [loadStats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-[3px] border-indigo-100 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-sm font-medium" style={{ color: '#94a3b8' }}>Loading admin data...</p>
        </div>
      </div>
    );
  }

  const usersByPlan = stats?.usersByPlan ?? {};
  const appsByStatus = stats?.applicationsByStatus ?? {};
  const maxStatusApps = Math.max(...Object.values(appsByStatus), 1);
  const totalPlanUsers = Object.values(usersByPlan).reduce((a, b) => a + b, 0);

  const activePaidUsers = Object.entries(usersByPlan)
    .filter(([k]) => k !== 'free')
    .reduce((s, [, v]) => s + v, 0);

  const kpis = [
    {
      label: 'Total Users',
      value: (stats?.totalUsers ?? 0).toLocaleString(),
      sub: `${stats?.activeUsers ?? 0} active`,
      icon: Users,
      iconBg: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
    },
    {
      label: 'Total Applications',
      value: (stats?.totalApplications ?? 0).toLocaleString(),
      sub: 'Across all users',
      icon: Briefcase,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      label: 'Total Revenue',
      value: `$${(stats?.revenue ?? 0).toLocaleString()}`,
      sub: 'Lifetime earnings',
      icon: DollarSign,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      label: 'Active Pro/Premium',
      value: activePaidUsers.toLocaleString(),
      sub: `${usersByPlan['free'] ?? 0} on free tier`,
      icon: Crown,
      iconBg: 'bg-violet-50',
      iconColor: 'text-violet-600',
    },
  ];

  return (
    <div>
      <TopBar
        title="Admin Dashboard"
        subtitle="Platform overview and metrics"
        actions={
          <button
            onClick={() => loadStats(true)}
            disabled={refreshing}
            className="btn-secondary text-sm"
          >
            <RefreshCw className={clsx('w-4 h-4', refreshing && 'animate-spin')} />
            Refresh
          </button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 animate-fade-up">
        {kpis.map((kpi, idx) => (
          <div
            key={kpi.label}
            className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all duration-200"
            style={{
              boxShadow: '0 1px 3px rgba(15,23,42,0.06), 0 4px 16px rgba(15,23,42,0.04)',
              animationDelay: `${idx * 60}ms`,
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium" style={{ color: '#64748b' }}>{kpi.label}</span>
              <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center', kpi.iconBg)}>
                <kpi.icon className={clsx('w-4 h-4', kpi.iconColor)} />
              </div>
            </div>
            <p className="text-2xl font-black tracking-tight mb-0.5" style={{ color: '#0f172a' }}>
              {kpi.value}
            </p>
            <p className="text-xs" style={{ color: '#94a3b8' }}>{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5 animate-fade-up" style={{ animationDelay: '120ms' }}>
        {/* Users by Plan */}
        <div
          className="bg-white rounded-xl border border-slate-200 p-6"
          style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.06), 0 4px 16px rgba(15,23,42,0.04)' }}
        >
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold" style={{ color: '#0f172a' }}>Users by Plan</h3>
            <span className="text-xs" style={{ color: '#94a3b8' }}>{totalPlanUsers} total</span>
          </div>

          {/* Stacked progress bar */}
          <div className="flex h-2.5 rounded-full overflow-hidden my-4" style={{ background: '#f1f5f9' }}>
            {Object.entries(usersByPlan).map(([plan, count]) => {
              const pct = totalPlanUsers > 0 ? (count / totalPlanUsers) * 100 : 0;
              return (
                <div
                  key={plan}
                  className={clsx('h-full transition-all duration-700', planConfig[plan]?.bar ?? 'bg-slate-400')}
                  style={{ width: `${pct}%` }}
                  title={`${planConfig[plan]?.label ?? plan}: ${count} users (${Math.round(pct)}%)`}
                />
              );
            })}
          </div>

          <div className="space-y-3">
            {Object.entries(usersByPlan).map(([plan, count]) => {
              const pct = totalPlanUsers > 0 ? Math.round((count / totalPlanUsers) * 100) : 0;
              const cfg = planConfig[plan] ?? { label: plan, bar: 'bg-slate-400', badge: 'bg-slate-100 text-slate-600' };
              return (
                <div key={plan} className="flex items-center gap-3">
                  <span className="text-xs w-16 capitalize shrink-0" style={{ color: '#475569' }}>
                    {cfg.label}
                  </span>
                  <div className="flex-1 h-5 rounded-lg overflow-hidden" style={{ background: '#f1f5f9' }}>
                    <div
                      className={clsx('h-full rounded-lg transition-all duration-700', cfg.bar)}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-semibold w-6 text-right" style={{ color: '#0f172a' }}>
                      {count}
                    </span>
                    <span className="text-xs w-8 text-right" style={{ color: '#94a3b8' }}>
                      {pct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Signups */}
        <div
          className="bg-white rounded-xl border border-slate-200 p-6"
          style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.06), 0 4px 16px rgba(15,23,42,0.04)' }}
        >
          <div className="flex items-center gap-2 mb-5">
            <UserCheck className="w-4 h-4" style={{ color: '#94a3b8' }} />
            <h3 className="text-sm font-semibold" style={{ color: '#0f172a' }}>Recent Signups</h3>
          </div>

          {(stats?.recentSignups ?? []).length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-sm" style={{ color: '#94a3b8' }}>No recent signups</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(stats?.recentSignups ?? []).map((user) => {
                const initials = user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
                const planCfg = planConfig[user.plan] ?? planConfig.free;
                return (
                  <div key={user.id} className="flex items-center gap-3 py-1">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                      style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                    >
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: '#0f172a' }}>
                        {user.name}
                      </p>
                      <p className="text-xs truncate" style={{ color: '#94a3b8' }}>{user.email}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={clsx('text-xs font-semibold px-2 py-0.5 rounded-full capitalize', planCfg.badge)}>
                        {planCfg.label}
                      </span>
                      <span className="text-xs" style={{ color: '#94a3b8' }}>
                        {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 animate-fade-up" style={{ animationDelay: '180ms' }}>
        {/* Applications by Status */}
        <div
          className="bg-white rounded-xl border border-slate-200 p-6"
          style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.06), 0 4px 16px rgba(15,23,42,0.04)' }}
        >
          <div className="mb-5">
            <h3 className="text-sm font-semibold mb-0.5" style={{ color: '#0f172a' }}>
              Applications by Status
            </h3>
            <p className="text-xs" style={{ color: '#94a3b8' }}>
              {stats?.totalApplications ?? 0} total applications
            </p>
          </div>
          {Object.keys(appsByStatus).length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: '#94a3b8' }}>No application data</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(appsByStatus).map(([status, count]) => (
                <HBar
                  key={status}
                  label={statusConfig[status]?.label ?? status}
                  value={count}
                  max={maxStatusApps}
                  barClass={statusConfig[status]?.bar ?? 'bg-slate-400'}
                />
              ))}
            </div>
          )}
        </div>

        {/* Revenue Trend */}
        <div
          className="bg-white rounded-xl border border-slate-200 p-6"
          style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.06), 0 4px 16px rgba(15,23,42,0.04)' }}
        >
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-4 h-4" style={{ color: '#94a3b8' }} />
            <h3 className="text-sm font-semibold" style={{ color: '#0f172a' }}>Revenue Trend</h3>
          </div>
          <RevenueSVGChart data={stats?.monthlyRevenue ?? []} />
          {(stats?.monthlyRevenue ?? []).length > 0 && (
            <div className="pt-3 mt-1 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs" style={{ color: '#94a3b8' }}>Total revenue</span>
              <span className="text-xs font-semibold" style={{ color: '#475569' }}>
                ${(stats?.monthlyRevenue ?? []).reduce((s, m) => s + m.amount, 0).toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
