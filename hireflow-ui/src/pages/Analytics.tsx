import { useEffect, useState, useMemo } from 'react';
import clsx from 'clsx';
import TopBar from '../components/TopBar';
import api from '../lib/api';
import type { Application } from '../types';
import { BarChart2, PieChart, Activity, Globe, Flag } from 'lucide-react';
import { extractApplications } from '../lib/normalize';

type DateRange = '30' | '90' | 'all';

const statusConfig: Record<string, { label: string; color: string; hex: string }> = {
  saved:     { label: 'Saved',     color: 'bg-cyan-500',    hex: '#06b6d4' },
  applied:   { label: 'Applied',   color: 'bg-blue-600',    hex: '#1a56db' },
  interview: { label: 'Interview', color: 'bg-amber-600',   hex: '#d97706' },
  offer:     { label: 'Offer',     color: 'bg-emerald-600', hex: '#059669' },
  rejected:  { label: 'Rejected',  color: 'bg-red-600',     hex: '#dc2626' },
  ghosted:   { label: 'Ghosted',   color: 'bg-slate-400',   hex: '#94a3b8' },
};

const priorityConfig: Record<string, { label: string; hex: string }> = {
  high:   { label: 'High',   hex: '#dc2626' },
  medium: { label: 'Medium', hex: '#d97706' },
  low:    { label: 'Low',    hex: '#94a3b8' },
};

const kpiBorderColors = ['#1a56db', '#059669', '#d97706', '#7c3aed'];

function EmptyChart({ message = 'Add applications to see data' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#EDEEF2' }}>
        <BarChart2 className="w-5 h-5" style={{ color: '#9CA3AF' }} />
      </div>
      <p className="text-sm font-medium" style={{ color: '#9CA3AF', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{message}</p>
    </div>
  );
}

function StatusBar({
  label,
  value,
  total,
  hex,
}: {
  label: string;
  value: number;
  total: number;
  hex: string;
}) {
  const pct = total > 0 ? Math.max(Math.round((value / total) * 100), value > 0 ? 8 : 0) : 0;
  return (
    <div className="bar-row">
      <span className="bar-label">{label}</span>
      <div className="bar-track">
        <div
          className="bar-fill"
          style={{ width: `${pct}%`, backgroundColor: hex, minWidth: value > 0 ? '32px' : '0' }}
        >
          {value > 0 && (
            <span style={{ fontSize: 10, fontWeight: 700, color: '#fff', lineHeight: 1 }}>{value}</span>
          )}
        </div>
      </div>
      <span className="bar-pct">
        {total > 0 ? Math.round((value / total) * 100) : 0}%
      </span>
    </div>
  );
}

function SourceBar({
  label,
  value,
  total,
}: {
  label: string;
  value: number;
  total: number;
}) {
  const pct = total > 0 ? Math.max(Math.round((value / total) * 100), value > 0 ? 8 : 0) : 0;
  return (
    <div className="bar-row">
      <span className="bar-label">{label}</span>
      <div className="bar-track">
        <div
          className="bar-fill"
          style={{ width: `${pct}%`, backgroundColor: '#1a56db', minWidth: value > 0 ? '32px' : '0' }}
        >
          {value > 0 && (
            <span style={{ fontSize: 10, fontWeight: 700, color: '#fff', lineHeight: 1 }}>{value}</span>
          )}
        </div>
      </div>
      <span className="bar-pct">
        {total > 0 ? Math.round((value / total) * 100) : 0}%
      </span>
    </div>
  );
}

function PriorityBar({
  label,
  value,
  total,
  hex,
}: {
  label: string;
  value: number;
  total: number;
  hex: string;
}) {
  const pct = total > 0 ? Math.max(Math.round((value / total) * 100), value > 0 ? 8 : 0) : 0;
  return (
    <div className="bar-row">
      <span className="bar-label">{label}</span>
      <div className="bar-track">
        <div
          className="bar-fill"
          style={{ width: `${pct}%`, backgroundColor: hex, minWidth: value > 0 ? '32px' : '0' }}
        >
          {value > 0 && (
            <span style={{ fontSize: 10, fontWeight: 700, color: '#fff', lineHeight: 1 }}>{value}</span>
          )}
        </div>
      </div>
      <span className="bar-pct">
        {total > 0 ? Math.round((value / total) * 100) : 0}%
      </span>
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
            <stop offset="0%" stopColor="#1a56db" stopOpacity="0.18" />
            <stop offset="60%" stopColor="#1a56db" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#1a56db" stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {ySteps.map((step) => (
          <g key={step.y}>
            <line
              x1={paddingX} y1={step.y} x2={width - paddingX} y2={step.y}
              stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4 4"
            />
            <text
              x={paddingX - 8} y={step.y + 4} textAnchor="end"
              style={{ fontSize: 9, fill: '#9CA3AF', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              {step.label}
            </text>
          </g>
        ))}

        <path d={areaD} fill="url(#areaGrad)" />
        <path
          d={pathD}
          fill="none"
          stroke="#1a56db"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" fill="#ffffff" stroke="#1a56db" strokeWidth="2.5" />
            <text
              x={p.x}
              y={height + 32}
              textAnchor="middle"
              style={{ fontSize: 9, fill: '#9CA3AF', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
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

function CardHeader({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle?: string }) {
  return (
    <div className="card-header">
      <div className="card-title">
        <span className="card-icon"><Icon size={15} /></span>
        {title}
      </div>
      {subtitle && <span style={{ fontSize: 11, color: '#9CA3AF' }}>{subtitle}</span>}
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
      .map(([label, value]) => ({ label, value }));
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
        hex: statusConfig[s].hex,
        key: s,
      })),
    [filteredApps]
  );
  const statusTotal = statusCounts.reduce((sum, s) => sum + s.value, 0);

  const priorityCounts = useMemo(
    () =>
      Object.keys(priorityConfig).map((p) => ({
        label: priorityConfig[p].label,
        value: filteredApps.filter((a) => a.priority === p).length,
        hex: priorityConfig[p].hex,
      })),
    [filteredApps]
  );
  const priorityTotal = priorityCounts.reduce((sum, p) => sum + p.value, 0);

  const topSourcesTop5 = sourceCounts.slice(0, 5);
  const sourceTotal = topSourcesTop5.reduce((sum, s) => sum + s.value, 0);

  const rangeOptions: { label: string; value: DateRange }[] = [
    { label: '30d', value: '30' },
    { label: '90d', value: '90' },
    { label: 'All time', value: 'all' },
  ];

  const kpis = [
    {
      label: 'Total Applications',
      value: total,
      sub: dateRange === 'all' ? 'All time' : `Last ${dateRange} days`,
    },
    {
      label: 'Response Rate',
      value: `${responseRate}%`,
      sub: `${responded} responses received`,
    },
    {
      label: 'Best Source',
      value: topSource,
      sub: sourceCounts[0] ? `${sourceCounts[0].value} applications` : 'No source data',
    },
    {
      label: 'Most Active Month',
      value: mostActiveMonth,
      sub: total > 0 ? 'By application count' : 'No data yet',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-8 h-8 rounded-full animate-spin"
            style={{ border: '3px solid #E5E7EB', borderTopColor: '#1a56db' }}
          />
          <p className="text-sm font-medium" style={{ color: '#9CA3AF', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Loading analytics...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <TopBar
        title="Analytics"
        subtitle="Insights into your job search performance"
        actions={
          <div
            className="flex items-center rounded-lg p-1 gap-0.5"
            style={{ background: 'white', border: '1px solid #E5E7EB' }}
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
                    ? { background: '#1a56db', color: 'white', fontFamily: "'Plus Jakarta Sans', sans-serif" }
                    : { color: '#4B5563', fontFamily: "'Plus Jakarta Sans', sans-serif" }
                }
              >
                {opt.label}
              </button>
            ))}
          </div>
        }
      />

      <div style={{ padding: 28 }}>
      {/* KPI Row */}
      <div className="kpi-grid">
        {kpis.map((kpi, index) => (
          <div
            key={kpi.label}
            className="kpi-card"
            style={{ '--kc': kpiBorderColors[index] } as React.CSSProperties}
          >
            <p className="kpi-num">{kpi.value}</p>
            <p className="kpi-label">{kpi.label}</p>
            <p className="kpi-sub">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts 2x2 grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 1. Applications by Status */}
        <div className="card">
          <div className="card-body">
            <CardHeader
              icon={PieChart}
              title="Applications by Status"
              subtitle={`${total} total in selected range`}
            />
            {total === 0 ? (
              <EmptyChart />
            ) : (
              <div className="space-y-3">
                {statusCounts.map((s) => (
                  <StatusBar
                    key={s.key}
                    label={s.label}
                    value={s.value}
                    total={statusTotal}
                    hex={s.hex}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 2. Monthly Trend */}
        <div className="card">
          <div className="card-body">
            <CardHeader
              icon={Activity}
              title="Monthly Applications Trend"
              subtitle="Applications submitted per month (last 6)"
            />
            <MonthlyTrendSVG data={monthlyData} />
          </div>
        </div>

        {/* 3. Top Sources */}
        <div className="card">
          <div className="card-body">
            <CardHeader
              icon={Globe}
              title="Top Sources"
              subtitle="Where you're finding opportunities (top 5)"
            />
            {topSourcesTop5.length === 0 ? (
              <EmptyChart message="No source data yet" />
            ) : (
              <div className="space-y-3">
                {topSourcesTop5.map((s) => (
                  <SourceBar
                    key={s.label}
                    label={s.label}
                    value={s.value}
                    total={sourceTotal}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 4. Priority Breakdown */}
        <div className="card">
          <div className="card-body">
            <CardHeader
              icon={Flag}
              title="Priority Breakdown"
              subtitle="How you're prioritizing applications"
            />
            {total === 0 ? (
              <EmptyChart />
            ) : (
              <div className="space-y-4">
                {priorityCounts.map((p) => (
                  <PriorityBar
                    key={p.label}
                    label={p.label}
                    value={p.value}
                    total={priorityTotal}
                    hex={p.hex}
                  />
                ))}
                <div className="pt-3" style={{ borderTop: '1px solid #EDEEF2' }}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: '#9CA3AF' }}>
                      Total tracked
                    </span>
                    <span className="text-xs font-semibold" style={{ color: '#4B5563' }}>
                      {total} application{total !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>{/* /padding wrapper */}
    </div>
  );
}
