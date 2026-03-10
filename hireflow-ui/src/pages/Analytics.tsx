import { useEffect, useState, useMemo } from 'react';
import clsx from 'clsx';
import TopBar from '../components/TopBar';
import api from '../lib/api';
import type { Application } from '../types';
import { BarChart2, TrendingUp, Layers, Zap } from 'lucide-react';
import { extractApplications } from '../lib/normalize';

type DateRange = '30' | '90' | 'all';

const statusConfig: Record<string, { label: string; color: string; hex: string }> = {
  saved:     { label: 'Saved',     color: 'bg-cyan-500',    hex: '#06b6d4' },
  applied:   { label: 'Applied',   color: 'bg-blue-500',    hex: '#3b82f6' },
  interview: { label: 'Interview', color: 'bg-amber-500',   hex: '#f59e0b' },
  offer:     { label: 'Offer',     color: 'bg-emerald-500', hex: '#10b981' },
  rejected:  { label: 'Rejected',  color: 'bg-red-500',     hex: '#ef4444' },
  ghosted:   { label: 'Ghosted',   color: 'bg-slate-400',   hex: '#94a3b8' },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  high:   { label: 'High',   color: 'bg-red-500' },
  medium: { label: 'Medium', color: 'bg-amber-500' },
  low:    { label: 'Low',    color: 'bg-slate-400' },
};

const sourceColors = [
  'bg-indigo-500', 'bg-violet-500', 'bg-blue-500', 'bg-cyan-500',
  'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-slate-400',
];

function EmptyChart({ message = 'Add applications to see data' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
        <BarChart2 className="w-5 h-5 text-slate-400" />
      </div>
      <p className="text-sm font-medium text-slate-400">{message}</p>
    </div>
  );
}

function HorizontalBar({
  label,
  value,
  total,
  barClass,
}: {
  label: string;
  value: number;
  total: number;
  barClass: string;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span
        className="text-xs font-medium w-20 shrink-0 truncate"
        style={{ color: '#475569' }}
      >
        {label}
      </span>
      <div className="flex-1 h-7 rounded-lg overflow-hidden" style={{ background: '#f1f5f9' }}>
        <div
          className={clsx('h-full rounded-lg transition-all duration-700 ease-out', barClass)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-baseline gap-1 shrink-0 w-16 justify-end">
        <span className="text-sm font-semibold" style={{ color: '#0f172a' }}>
          {value}
        </span>
        <span className="text-xs" style={{ color: '#94a3b8' }}>
          {pct}%
        </span>
      </div>
    </div>
  );
}

function MonthlyTrendSVG({ data }: { data: Array<{ label: string; value: number }> }) {
  if (data.length === 0) return <EmptyChart />;

  const width = 520;
  const height = 160;
  const paddingX = 44;
  const paddingY = 20;
  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2;

  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const points = data.map((d, i) => ({
    x: paddingX + (i / Math.max(data.length - 1, 1)) * chartW,
    y: paddingY + chartH - (d.value / maxVal) * chartH,
    label: d.label,
    value: d.value,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L ${points[points.length - 1].x} ${paddingY + chartH} L ${points[0].x} ${paddingY + chartH} Z`;

  const ySteps = [0, 0.5, 1].map((f) => ({
    y: paddingY + chartH - f * chartH,
    label: Math.round(f * maxVal),
  }));

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height + 40}`} className="w-full" style={{ minWidth: 280 }}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {ySteps.map((step) => (
          <g key={step.y}>
            <line
              x1={paddingX} y1={step.y} x2={width - paddingX} y2={step.y}
              stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4"
            />
            <text
              x={paddingX - 8} y={step.y + 4} textAnchor="end"
              style={{ fontSize: 9, fill: '#94a3b8' }}
            >
              {step.label}
            </text>
          </g>
        ))}

        <path d={areaD} fill="url(#areaGrad)" />
        <path
          d={pathD}
          fill="none"
          stroke="#6366f1"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" fill="#ffffff" stroke="#6366f1" strokeWidth="2.5" />
            <text
              x={p.x}
              y={height + 32}
              textAnchor="middle"
              style={{ fontSize: 9, fill: '#94a3b8' }}
            >
              {p.label.length > 7 ? p.label.slice(5) : p.label}
            </text>
            <title>{`${p.label}: ${p.value} applications`}</title>
          </g>
        ))}
      </svg>
    </div>
  );
}

export default function Analytics() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>('30');

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/applications');
        setApps(extractApplications(data));
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredApps = useMemo(() => {
    if (dateRange === 'all') return apps;
    const days = parseInt(dateRange);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return apps.filter((a) => new Date(a.appliedDate || a.createdAt) >= cutoff);
  }, [apps, dateRange]);

  const total = filteredApps.length;
  const responded = filteredApps.filter((a) =>
    ['interview', 'offer', 'rejected'].includes(a.status)
  ).length;
  const responseRate = total > 0 ? Math.round((responded / total) * 100) : 0;

  const sourceCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredApps.forEach((a) => {
      const src = a.source || 'Unknown';
      counts[src] = (counts[src] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([label, value], i) => ({ label, value, color: sourceColors[i % sourceColors.length] }));
  }, [filteredApps]);

  const topSource = sourceCounts[0]?.label ?? 'N/A';

  const monthlyData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredApps.forEach((a) => {
      const d = new Date(a.appliedDate || a.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      counts[key] = (counts[key] || 0) + 1;
    });
    const sorted = Object.entries(counts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([label, value]) => ({ label, value }));
    return sorted.slice(-6);
  }, [filteredApps]);

  const mostActiveMonth = useMemo(() => {
    if (monthlyData.length === 0) return 'N/A';
    const max = monthlyData.reduce(
      (best, cur) => (cur.value > best.value ? cur : best),
      monthlyData[0]
    );
    const [year, month] = max.label.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }, [monthlyData]);

  const statusCounts = useMemo(
    () =>
      Object.keys(statusConfig).map((s) => ({
        label: statusConfig[s].label,
        value: filteredApps.filter((a) => a.status === s).length,
        bar: statusConfig[s].color,
        key: s,
      })),
    [filteredApps]
  );
  const maxStatus = Math.max(...statusCounts.map((s) => s.value), 1);

  const priorityCounts = useMemo(
    () =>
      Object.keys(priorityConfig).map((p) => ({
        label: priorityConfig[p].label,
        value: filteredApps.filter((a) => a.priority === p).length,
        bar: priorityConfig[p].color,
      })),
    [filteredApps]
  );
  const maxPriority = Math.max(...priorityCounts.map((p) => p.value), 1);

  const topSourcesTop5 = sourceCounts.slice(0, 5);
  const maxSource = topSourcesTop5.length > 0 ? Math.max(...topSourcesTop5.map((s) => s.value), 1) : 1;

  const rangeOptions: { label: string; value: DateRange }[] = [
    { label: '30d', value: '30' },
    { label: '90d', value: '90' },
    { label: 'All time', value: 'all' },
  ];

  const kpis = [
    {
      label: 'Total Applications',
      value: total,
      icon: Layers,
      iconBg: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      sub: dateRange === 'all' ? 'All time' : `Last ${dateRange} days`,
    },
    {
      label: 'Response Rate',
      value: `${responseRate}%`,
      icon: TrendingUp,
      iconBg:
        responseRate >= 30 ? 'bg-emerald-50' : responseRate >= 15 ? 'bg-amber-50' : 'bg-slate-50',
      iconColor:
        responseRate >= 30
          ? 'text-emerald-600'
          : responseRate >= 15
          ? 'text-amber-600'
          : 'text-slate-500',
      sub: `${responded} responses received`,
    },
    {
      label: 'Best Source',
      value: topSource,
      icon: BarChart2,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      sub: sourceCounts[0] ? `${sourceCounts[0].value} applications` : 'No source data',
    },
    {
      label: 'Most Active Month',
      value: mostActiveMonth,
      icon: Zap,
      iconBg: 'bg-violet-50',
      iconColor: 'text-violet-600',
      sub: total > 0 ? 'By application count' : 'No data yet',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-[3px] border-slate-200 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-sm font-medium" style={{ color: '#94a3b8' }}>
            Loading analytics...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <TopBar
        title="Analytics"
        subtitle="Insights into your job search performance"
        actions={
          <div
            className="flex items-center rounded-lg p-1 gap-0.5"
            style={{ background: 'white', border: '1px solid #e2e8f0' }}
          >
            {rangeOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDateRange(opt.value)}
                className={clsx(
                  'px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150',
                  dateRange === opt.value
                    ? 'shadow-sm'
                    : 'hover:text-slate-700'
                )}
                style={
                  dateRange === opt.value
                    ? { background: '#4f46e5', color: 'white' }
                    : { color: '#64748b' }
                }
              >
                {opt.label}
              </button>
            ))}
          </div>
        }
      />

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all duration-200"
            style={{
              boxShadow: '0 1px 3px rgba(15,23,42,0.06), 0 4px 16px rgba(15,23,42,0.04)',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium" style={{ color: '#64748b' }}>
                {kpi.label}
              </span>
              <div
                className={clsx(
                  'w-8 h-8 rounded-lg flex items-center justify-center',
                  kpi.iconBg
                )}
              >
                <kpi.icon className={clsx('w-4 h-4', kpi.iconColor)} />
              </div>
            </div>
            <p
              className="text-2xl font-bold mb-0.5 tracking-tight"
              style={{ color: '#0f172a', letterSpacing: '-0.02em' }}
            >
              {kpi.value}
            </p>
            <p className="text-xs" style={{ color: '#94a3b8' }}>
              {kpi.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Charts 2x2 grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 1. Applications by Status */}
        <div
          className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow duration-200"
          style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.06), 0 4px 16px rgba(15,23,42,0.04)' }}
        >
          <div className="mb-5">
            <h3 className="text-sm font-semibold" style={{ color: '#0f172a' }}>
              Applications by Status
            </h3>
            <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>
              {total} total in selected range
            </p>
          </div>
          {total === 0 ? (
            <EmptyChart />
          ) : (
            <div className="space-y-3">
              {statusCounts.map((s) => (
                <HorizontalBar
                  key={s.key}
                  label={s.label}
                  value={s.value}
                  total={maxStatus}
                  barClass={s.bar}
                />
              ))}
            </div>
          )}
        </div>

        {/* 2. Monthly Trend */}
        <div
          className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow duration-200"
          style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.06), 0 4px 16px rgba(15,23,42,0.04)' }}
        >
          <div className="mb-5">
            <h3 className="text-sm font-semibold" style={{ color: '#0f172a' }}>
              Monthly Applications Trend
            </h3>
            <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>
              Applications submitted per month (last 6)
            </p>
          </div>
          <MonthlyTrendSVG data={monthlyData} />
        </div>

        {/* 3. Top Sources */}
        <div
          className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow duration-200"
          style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.06), 0 4px 16px rgba(15,23,42,0.04)' }}
        >
          <div className="mb-5">
            <h3 className="text-sm font-semibold" style={{ color: '#0f172a' }}>
              Top Sources
            </h3>
            <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>
              Where you're finding opportunities (top 5)
            </p>
          </div>
          {topSourcesTop5.length === 0 ? (
            <EmptyChart message="No source data yet" />
          ) : (
            <div className="space-y-3">
              {topSourcesTop5.map((s) => (
                <HorizontalBar
                  key={s.label}
                  label={s.label}
                  value={s.value}
                  total={maxSource}
                  barClass={s.color}
                />
              ))}
            </div>
          )}
        </div>

        {/* 4. Priority Breakdown */}
        <div
          className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow duration-200"
          style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.06), 0 4px 16px rgba(15,23,42,0.04)' }}
        >
          <div className="mb-5">
            <h3 className="text-sm font-semibold" style={{ color: '#0f172a' }}>
              Priority Breakdown
            </h3>
            <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>
              How you're prioritizing applications
            </p>
          </div>
          {total === 0 ? (
            <EmptyChart />
          ) : (
            <div className="space-y-4">
              {priorityCounts.map((p) => (
                <HorizontalBar
                  key={p.label}
                  label={p.label}
                  value={p.value}
                  total={maxPriority}
                  barClass={p.bar}
                />
              ))}
              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: '#94a3b8' }}>
                    Total tracked
                  </span>
                  <span className="text-xs font-semibold" style={{ color: '#475569' }}>
                    {total} application{total !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
