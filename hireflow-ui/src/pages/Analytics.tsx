import { useEffect, useState } from 'react';
import clsx from 'clsx';
import TopBar from '../components/TopBar';
import api from '../lib/api';
import type { Application } from '../types';

const statusConfig: Record<string, { label: string; color: string }> = {
  saved: { label: 'Saved', color: 'bg-cyan-500' },
  applied: { label: 'Applied', color: 'bg-blue-500' },
  interview: { label: 'Interview', color: 'bg-amber-500' },
  offer: { label: 'Offer', color: 'bg-emerald-500' },
  rejected: { label: 'Rejected', color: 'bg-red-500' },
  ghosted: { label: 'Ghosted', color: 'bg-slate-400' },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  high: { label: 'High', color: 'bg-red-500' },
  medium: { label: 'Medium', color: 'bg-amber-500' },
  low: { label: 'Low', color: 'bg-slate-400' },
};

function BarChart({
  data,
  maxValue,
}: {
  data: Array<{ label: string; value: number; color: string }>;
  maxValue: number;
}) {
  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <span className="text-xs text-slate-600 w-20 text-right truncate">{item.label}</span>
          <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={clsx('h-full rounded-full transition-all duration-500', item.color)}
              style={{ width: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-slate-700 w-8">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function Analytics() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/applications');
        setApps(data.applications ?? data ?? []);
      } catch {
        // empty
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Status breakdown
  const statusCounts = Object.keys(statusConfig).map((status) => ({
    label: statusConfig[status].label,
    value: apps.filter((a) => a.status === status).length,
    color: statusConfig[status].color,
  }));
  const maxStatus = Math.max(...statusCounts.map((s) => s.value), 1);

  // Source breakdown
  const sourceCounts: Record<string, number> = {};
  apps.forEach((a) => {
    const src = a.source || 'Unknown';
    sourceCounts[src] = (sourceCounts[src] || 0) + 1;
  });
  const sourceData = Object.entries(sourceCounts)
    .map(([label, value]) => ({ label, value, color: 'bg-violet-500' }))
    .sort((a, b) => b.value - a.value);
  const maxSource = Math.max(...sourceData.map((s) => s.value), 1);

  // Monthly trend
  const monthlyCounts: Record<string, number> = {};
  apps.forEach((a) => {
    const d = new Date(a.appliedDate || a.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthlyCounts[key] = (monthlyCounts[key] || 0) + 1;
  });
  const monthlyData = Object.entries(monthlyCounts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, value]) => ({ label, value, color: 'bg-blue-500' }));
  const maxMonthly = Math.max(...monthlyData.map((m) => m.value), 1);

  // Priority breakdown
  const priorityCounts = Object.keys(priorityConfig).map((priority) => ({
    label: priorityConfig[priority].label,
    value: apps.filter((a) => a.priority === priority).length,
    color: priorityConfig[priority].color,
  }));
  const maxPriority = Math.max(...priorityCounts.map((p) => p.value), 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <TopBar title="Analytics" subtitle="Insights into your job search" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Status Breakdown</h3>
          <BarChart data={statusCounts} maxValue={maxStatus} />
        </div>

        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Application Sources</h3>
          {sourceData.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No source data</p>
          ) : (
            <BarChart data={sourceData} maxValue={maxSource} />
          )}
        </div>

        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Monthly Trend</h3>
          {monthlyData.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No data yet</p>
          ) : (
            <BarChart data={monthlyData} maxValue={maxMonthly} />
          )}
        </div>

        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Priority Distribution</h3>
          <BarChart data={priorityCounts} maxValue={maxPriority} />
        </div>
      </div>
    </div>
  );
}
