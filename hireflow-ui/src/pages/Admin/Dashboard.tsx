import { useEffect, useState } from 'react';
import {
  Users,
  Briefcase,
  DollarSign,
  TrendingUp,
  UserCheck,
} from 'lucide-react';
import clsx from 'clsx';
import TopBar from '../../components/TopBar';
import api from '../../lib/api';
import type { AdminStats } from '../../types';

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/admin/stats');
        setStats(data);
      } catch {
        // empty
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  const kpis = [
    { label: 'Total Users', value: stats?.totalUsers ?? 0, icon: Users, color: 'text-blue-600 bg-blue-50' },
    { label: 'Active Users', value: stats?.activeUsers ?? 0, icon: UserCheck, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Total Applications', value: stats?.totalApplications ?? 0, icon: Briefcase, color: 'text-violet-600 bg-violet-50' },
    { label: 'Revenue', value: `$${(stats?.revenue ?? 0).toLocaleString()}`, icon: DollarSign, color: 'text-amber-600 bg-amber-50' },
  ];

  const planColors: Record<string, string> = {
    free: 'bg-slate-500',
    pro: 'bg-blue-500',
    premium: 'bg-violet-500',
  };

  const statusColors: Record<string, string> = {
    saved: 'bg-cyan-500',
    applied: 'bg-blue-500',
    interview: 'bg-amber-500',
    offer: 'bg-emerald-500',
    rejected: 'bg-red-500',
    ghosted: 'bg-slate-400',
  };

  const usersByPlan = stats?.usersByPlan ?? {};
  const maxPlanUsers = Math.max(...Object.values(usersByPlan), 1);

  const appsByStatus = stats?.applicationsByStatus ?? {};
  const maxStatusApps = Math.max(...Object.values(appsByStatus), 1);

  return (
    <div>
      <TopBar title="Admin Dashboard" subtitle="Platform overview and metrics" />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Users by Plan */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Users by Plan</h3>
          <div className="space-y-3">
            {Object.entries(usersByPlan).map(([plan, count]) => (
              <div key={plan} className="flex items-center gap-3">
                <span className="text-xs text-slate-600 w-16 capitalize">{plan}</span>
                <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={clsx('h-full rounded-full', planColors[plan] ?? 'bg-slate-400')}
                    style={{ width: `${(count / maxPlanUsers) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-slate-700 w-8">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Apps by Status */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Applications by Status</h3>
          <div className="space-y-3">
            {Object.entries(appsByStatus).map(([status, count]) => (
              <div key={status} className="flex items-center gap-3">
                <span className="text-xs text-slate-600 w-16 capitalize">{status}</span>
                <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={clsx('h-full rounded-full', statusColors[status] ?? 'bg-slate-400')}
                    style={{ width: `${(count / maxStatusApps) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-slate-700 w-8">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-slate-400" />
            Revenue Trend
          </h3>
          {(stats?.monthlyRevenue ?? []).length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No revenue data</p>
          ) : (
            <div className="space-y-3">
              {(stats?.monthlyRevenue ?? []).map((item) => (
                <div key={item.month} className="flex items-center gap-3">
                  <span className="text-xs text-slate-600 w-16">{item.month}</span>
                  <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{
                        width: `${
                          (item.amount /
                            Math.max(...(stats?.monthlyRevenue ?? []).map((m) => m.amount), 1)) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 w-16 text-right">
                    ${item.amount}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Signups */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Recent Signups</h3>
          {(stats?.recentSignups ?? []).length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No recent signups</p>
          ) : (
            <div className="space-y-3">
              {(stats?.recentSignups ?? []).map((user) => (
                <div key={user.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>
                  <span className="text-xs text-slate-400 capitalize px-2 py-0.5 bg-slate-100 rounded-full">
                    {user.plan}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
