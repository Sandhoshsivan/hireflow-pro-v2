import { useEffect, useState, useCallback } from 'react';
import {
  Users, Briefcase, TrendingUp, RefreshCw,
  UserCheck,
} from 'lucide-react';
import TopBar from '../../components/TopBar';
import api from '../../lib/api';
import type { AdminStats } from '../../types';

const planColors: Record<string, string> = {
  free:    'var(--text3)',
  pro:     'var(--blue)',
  premium: 'var(--violet)',
};

const planLabels: Record<string, string> = {
  free:    'Free',
  pro:     'Pro',
  premium: 'Premium',
};

const statusColors: Record<string, string> = {
  saved:     'var(--cyan)',
  applied:   'var(--blue)',
  interview: 'var(--amber)',
  offer:     'var(--green)',
  rejected:  'var(--red)',
  ghosted:   'var(--text3)',
};

const statusLabels: Record<string, string> = {
  saved:     'Saved',
  applied:   'Applied',
  interview: 'Interview',
  offer:     'Offer',
  rejected:  'Rejected',
  ghosted:   'Ghosted',
};

const planBadgeStyle = (plan: string): React.CSSProperties => {
  if (plan === 'pro')     return { background: 'var(--blue-lt)',   color: 'var(--blue)',   border: '1px solid var(--blue-md)' };
  if (plan === 'premium') return { background: 'var(--violet-lt)', color: 'var(--violet)', border: '1px solid var(--violet-md)' };
  return { background: 'var(--bg2)', color: 'var(--text3)', border: '1px solid var(--border2)' };
};

function RevenueSVGChart({ data }: { data: Array<{ month: string; amount: number }> }) {
  if (data.length === 0) {
    return (
      <div className="empty-state" style={{ padding: '32px 20px' }}>
        <div className="empty-text">No revenue data yet</div>
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
    <svg viewBox={`0 0 ${width} ${height + 10}`} style={{ width: '100%' }}>
      <defs>
        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--blue)" />
          <stop offset="100%" stopColor="var(--violet)" stopOpacity="0.6" />
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
              style={{ cursor: 'pointer', transition: 'opacity 0.15s' }}
            >
              <title>{`${d.month}: $${d.amount}`}</title>
            </rect>
            <text
              x={x + barWidth / 2}
              y={height + 8}
              textAnchor="middle"
              style={{ fontSize: 8, fill: 'var(--text3)' }}
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
      <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 28,
              height: 28,
              border: '3px solid var(--border)',
              borderTopColor: 'var(--blue)',
              borderRadius: '50%',
              margin: '0 auto 12px',
            }}
            className="animate-spin"
          />
          <div style={{ fontSize: 13, color: 'var(--text3)' }}>Loading admin data...</div>
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
      color: 'var(--blue)',
    },
    {
      label: 'Total Applications',
      value: (stats?.totalApplications ?? 0).toLocaleString(),
      sub: 'Across all users',
      color: 'var(--blue)',
    },
    {
      label: 'Total Revenue',
      value: `$${(stats?.revenue ?? 0).toLocaleString()}`,
      sub: 'Lifetime earnings',
      color: 'var(--green)',
    },
    {
      label: 'Active Pro/Premium',
      value: activePaidUsers.toLocaleString(),
      sub: `${usersByPlan['free'] ?? 0} on free tier`,
      color: 'var(--violet)',
    },
  ];

  return (
    <div>
      <TopBar
        title="Admin Dashboard"
        subtitle="Platform overview and metrics"
        actions={
          <button
            className="btn btn-secondary"
            onClick={() => loadStats(true)}
            disabled={refreshing}
          >
            <RefreshCw
              style={{
                width: 14,
                height: 14,
                animation: refreshing ? 'spin 0.7s linear infinite' : undefined,
              }}
            />
            Refresh
          </button>
        }
      />

      {/* 4 KPI cards */}
      <div className="kpi-grid">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="kpi-card"
            style={{ '--kc': kpi.color } as React.CSSProperties}
          >
            <div className="kpi-num">{kpi.value}</div>
            <div className="kpi-label">{kpi.label}</div>
            <div className="kpi-sub">{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Row 1: Users by Plan + Recent Signups */}
      <div className="grid-2 mb-4 stagger-1">

        {/* Users by Plan */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Users style={{ width: 15, height: 15, color: 'var(--text3)' }} />
              Users by Plan
            </div>
            <span style={{ fontSize: 12, color: 'var(--text3)' }}>{totalPlanUsers} total</span>
          </div>
          <div className="card-body">
            {/* Stacked progress bar */}
            <div
              style={{
                display: 'flex',
                height: 8,
                borderRadius: 20,
                overflow: 'hidden',
                background: 'var(--bg2)',
                marginBottom: 16,
              }}
            >
              {Object.entries(usersByPlan).map(([plan, count]) => {
                const pct = totalPlanUsers > 0 ? (count / totalPlanUsers) * 100 : 0;
                return (
                  <div
                    key={plan}
                    style={{
                      width: `${pct}%`,
                      background: planColors[plan] ?? 'var(--text3)',
                      transition: 'width 0.7s var(--ease)',
                    }}
                    title={`${planLabels[plan] ?? plan}: ${count} users (${Math.round(pct)}%)`}
                  />
                );
              })}
            </div>

            {/* Per-plan bar chart */}
            <div className="bar-chart">
              {Object.entries(usersByPlan).map(([plan, count]) => {
                const pct = totalPlanUsers > 0 ? Math.round((count / totalPlanUsers) * 100) : 0;
                return (
                  <div className="bar-row" key={plan}>
                    <div className="bar-label" style={{ textAlign: 'left' }}>
                      {planLabels[plan] ?? plan}
                    </div>
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{
                          width: `${pct}%`,
                          background: planColors[plan] ?? 'var(--text3)',
                        }}
                      />
                    </div>
                    <div className="bar-pct">{pct}%</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Signups */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <UserCheck style={{ width: 15, height: 15, color: 'var(--text3)' }} />
              Recent Signups
            </div>
          </div>
          <div className="card-body">
            {(stats?.recentSignups ?? []).length === 0 ? (
              <div className="empty-state" style={{ padding: '24px 20px' }}>
                <div className="empty-text">No recent signups</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {(stats?.recentSignups ?? []).map((u) => {
                  const initials = u.name
                    .split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);
                  return (
                    <div
                      key={u.id}
                      style={{ display: 'flex', alignItems: 'center', gap: 12 }}
                    >
                      {/* Avatar */}
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, var(--blue), var(--violet))',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 12,
                          fontWeight: 800,
                          color: 'white',
                          flexShrink: 0,
                        }}
                      >
                        {initials}
                      </div>
                      {/* Name + email */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          className="truncate"
                          style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}
                        >
                          {u.name}
                        </div>
                        <div
                          className="truncate"
                          style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}
                        >
                          {u.email}
                        </div>
                      </div>
                      {/* Plan badge + date */}
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-end',
                          gap: 4,
                          flexShrink: 0,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 20,
                            textTransform: 'capitalize',
                            ...planBadgeStyle(u.plan),
                          }}
                        >
                          {planLabels[u.plan] ?? u.plan}
                        </span>
                        <span style={{ fontSize: 10, color: 'var(--text3)' }}>
                          {new Date(u.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
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

      {/* Row 2: Applications by Status + Revenue Trend */}
      <div className="grid-2 stagger-2">

        {/* Applications by Status */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Briefcase style={{ width: 15, height: 15, color: 'var(--text3)' }} />
              Applications by Status
            </div>
            <span style={{ fontSize: 12, color: 'var(--text3)' }}>
              {stats?.totalApplications ?? 0} total
            </span>
          </div>
          <div className="card-body">
            {Object.keys(appsByStatus).length === 0 ? (
              <div className="empty-state" style={{ padding: '24px 20px' }}>
                <div className="empty-text">No application data</div>
              </div>
            ) : (
              <div className="bar-chart">
                {Object.entries(appsByStatus).map(([status, count]) => {
                  const pct = maxStatusApps > 0 ? Math.round((count / maxStatusApps) * 100) : 0;
                  return (
                    <div className="bar-row" key={status}>
                      <div className="bar-label" style={{ textAlign: 'left' }}>
                        {statusLabels[status] ?? status}
                      </div>
                      <div className="bar-track">
                        <div
                          className="bar-fill"
                          style={{
                            width: `${pct}%`,
                            background: statusColors[status] ?? 'var(--text3)',
                          }}
                        />
                      </div>
                      <div className="bar-pct">{count}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Revenue Trend */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <TrendingUp style={{ width: 15, height: 15, color: 'var(--text3)' }} />
              Revenue Trend
            </div>
          </div>
          <div className="card-body">
            <RevenueSVGChart data={stats?.monthlyRevenue ?? []} />
            {(stats?.monthlyRevenue ?? []).length > 0 && (
              <div
                style={{
                  paddingTop: 12,
                  marginTop: 4,
                  borderTop: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ fontSize: 12, color: 'var(--text3)' }}>Total revenue</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text2)' }}>
                  ${(stats?.monthlyRevenue ?? [])
                    .reduce((s, m) => s + m.amount, 0)
                    .toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}