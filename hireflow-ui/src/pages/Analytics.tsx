import { useEffect, useState, useMemo } from 'react';
import TopBar from '../components/TopBar';
import api from '../lib/api';
import type { Application } from '../types';
import { BarChart2 } from 'lucide-react';
import { extractApplications } from '../lib/normalize';

const statusConfig: Record<string, { label: string; hex: string }> = {
  applied:   { label: 'Applied',   hex: 'var(--blue)' },
  interview: { label: 'Interview', hex: 'var(--amber)' },
  offer:     { label: 'Offer',     hex: 'var(--green)' },
  rejected:  { label: 'Rejected',  hex: 'var(--red)' },
  ghosted:   { label: 'Ghosted',   hex: 'var(--text3)' },
  saved:     { label: 'Saved',     hex: 'var(--cyan)' },
};

const priorityConfig: Record<string, { label: string; hex: string }> = {
  high:   { label: '\u{1F534} High',   hex: 'var(--red)' },
  medium: { label: '\u{1F7E1} Medium', hex: 'var(--amber)' },
  low:    { label: '\u{1F7E2} Low',    hex: 'var(--green)' },
};

const kpiBorderColors = ['var(--blue)', 'var(--violet)', 'var(--amber)', 'var(--green)', 'var(--text2)'];

function EmptyChart({ message = 'Add applications to see data' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#EDEEF2' }}>
        <BarChart2 className="w-5 h-5" style={{ color: '#9CA3AF' }} />
      </div>
      <p className="text-sm font-medium" style={{ color: '#9CA3AF' }}>{message}</p>
    </div>
  );
}

function BarRow({
  label,
  value,
  maxVal,
  hex,
}: {
  label: string;
  value: number;
  maxVal: number;
  hex: string;
}) {
  const pct = maxVal > 0 ? (value / maxVal) * 100 : 0;
  const displayPct = maxVal > 0 ? Math.round((value / maxVal) * 100) : 0;
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
      <span className="bar-pct">{displayPct}%</span>
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
        setApps(extractApplications(data));
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const total = apps.length;
  const responded = apps.filter((a) =>
    ['interview', 'offer', 'rejected'].includes(a.status)
  ).length;
  const responseRate = total > 0 ? Math.round((responded / total) * 100) : 0;
  const interviewCount = apps.filter((a) => a.status === 'interview').length;
  const offerCount = apps.filter((a) => a.status === 'offer').length;

  const avgDays = useMemo(() => {
    const withDates = apps.filter((a) => a.appliedDate);
    if (withDates.length === 0) return 0;
    const total = withDates.reduce((s, a) => {
      return s + Math.floor((Date.now() - new Date(a.appliedDate!).getTime()) / 86400000);
    }, 0);
    return Math.round(total / withDates.length);
  }, [apps]);

  const sourceCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    apps.forEach((a) => {
      const src = a.source || 'Other';
      counts[src] = (counts[src] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([label, value]) => ({ label, value }));
  }, [apps]);

  const monthlyData = useMemo(() => {
    const counts: Record<string, number> = {};
    apps.forEach((a) => {
      const d = new Date(a.appliedDate || a.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([label, value]) => ({ label, value }));
  }, [apps]);

  const statusCounts = useMemo(
    () =>
      Object.keys(statusConfig).map((s) => ({
        label: statusConfig[s].label,
        value: apps.filter((a) => a.status === s).length,
        hex: statusConfig[s].hex,
        key: s,
      })),
    [apps]
  );
  const maxStatus = Math.max(...statusCounts.map((s) => s.value), 1);

  const priorityCounts = useMemo(
    () =>
      Object.keys(priorityConfig).map((p) => ({
        label: priorityConfig[p].label,
        value: apps.filter((a) => a.priority === p).length,
        hex: priorityConfig[p].hex,
      })),
    [apps]
  );
  const maxPriority = Math.max(...priorityCounts.map((p) => p.value), 1);

  const maxSource = Math.max(...sourceCounts.map((s) => s.value), 1);
  const maxMonthly = Math.max(...monthlyData.map((m) => m.value), 1);

  // AI Insights
  const insights = useMemo(() => {
    const list: { icon: string; text: string }[] = [];
    if (total === 0) {
      list.push({ icon: '\u{1F4A1}', text: 'Start tracking applications to see insights!' });
      return list;
    }
    const ghosted = apps.filter((a) => a.status === 'ghosted').length;
    const saved = apps.filter((a) => a.status === 'saved').length;
    if (ghosted > interviewCount && total > 3)
      list.push({ icon: '\u{1F47B}', text: `${ghosted} applications ghosted vs ${interviewCount} interviews. Consider improving your CV headline and summary to increase initial response rate.` });
    if (responseRate < 10 && total > 5)
      list.push({ icon: '\u{1F4C8}', text: `Response rate is ${responseRate}% — below the 15-20% industry average. Try cold LinkedIn outreach in addition to job boards.` });
    if (saved > 3)
      list.push({ icon: '\u{1F516}', text: `You have ${saved} saved jobs — consider applying to them before they expire!` });
    const topSrc = sourceCounts[0];
    if (topSrc)
      list.push({ icon: '\u{1F4E1}', text: `Your top source is ${topSrc.label} with ${topSrc.value} applications. Diversify to referrals and company websites for higher conversion.` });
    if (interviewCount > 0 && offerCount === 0)
      list.push({ icon: '\u{1F3AF}', text: `${interviewCount} active interview(s) and 0 offers — focus on interview prep. Practice system design + CQRS patterns.` });
    if (offerCount > 0)
      list.push({ icon: '\u{1F389}', text: `${offerCount} offer(s) received! Research market salaries and negotiate confidently.` });
    if (list.length === 0)
      list.push({ icon: '\u{1F4A1}', text: 'Add more applications to generate insights.' });
    return list;
  }, [apps, total, interviewCount, offerCount, responseRate, sourceCounts]);

  const kpis = [
    { label: 'Total Applications', value: total, sub: 'All time', border: kpiBorderColors[0] },
    { label: 'Response Rate', value: `${responseRate}%`, sub: responseRate > 20 ? '\u{1F525} Above avg' : '\u2B06 Aim 20%+', border: kpiBorderColors[1] },
    { label: 'Active Interviews', value: interviewCount, sub: 'In pipeline', border: kpiBorderColors[2] },
    { label: 'Total Offers', value: offerCount, sub: '\u{1F4B0} Negotiate!', border: kpiBorderColors[3] },
    { label: 'Avg App Age', value: `${avgDays}d`, sub: 'Since applied', border: kpiBorderColors[4] },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-8 h-8 rounded-full animate-spin"
            style={{ border: '3px solid #E5E7EB', borderTopColor: '#1a56db' }}
          />
          <p className="text-sm font-medium" style={{ color: '#9CA3AF' }}>
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
        subtitle="Track your job search performance"
      />

      <div className="page-content">
        {/* KPI Row */}
        <div className="kpi-grid mb-4">
          {kpis.map((kpi) => (
            <div
              key={kpi.label}
              className="kpi-card"
              style={{ '--kc': kpi.border } as React.CSSProperties}
            >
              <p className="kpi-num">{kpi.value}</p>
              <p className="kpi-label">{kpi.label}</p>
              <p className="kpi-sub">{kpi.sub}</p>
            </div>
          ))}
        </div>

        {/* Row 1: Status Breakdown + Application Sources */}
        <div className="grid-2 mb-4">
          <div className="card">
            <div className="card-header">
              <div className="card-title"><span className="card-icon">{'\u{1F4CA}'}</span> Status Breakdown</div>
            </div>
            <div className="card-body">
              {total === 0 ? (
                <EmptyChart />
              ) : (
                <div className="bar-chart">
                  {statusCounts.map((s) => (
                    <BarRow key={s.key} label={s.label} value={s.value} maxVal={maxStatus} hex={s.hex} />
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="card">
            <div className="card-header">
              <div className="card-title"><span className="card-icon">{'\u{1F4E1}'}</span> Application Sources</div>
            </div>
            <div className="card-body">
              {sourceCounts.length === 0 ? (
                <EmptyChart message="No source data yet" />
              ) : (
                <div className="bar-chart">
                  {sourceCounts.map((s) => (
                    <BarRow key={s.label} label={s.label} value={s.value} maxVal={maxSource} hex="var(--blue)" />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Row 2: Monthly Volume + Priority Distribution */}
        <div className="grid-2 mb-4">
          <div className="card">
            <div className="card-header">
              <div className="card-title"><span className="card-icon">{'\u{1F4C5}'}</span> Monthly Volume</div>
            </div>
            <div className="card-body">
              {monthlyData.length === 0 ? (
                <EmptyChart message="No monthly data yet" />
              ) : (
                <div className="bar-chart">
                  {monthlyData.map((m) => (
                    <BarRow key={m.label} label={m.label} value={m.value} maxVal={maxMonthly} hex="var(--violet)" />
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="card">
            <div className="card-header">
              <div className="card-title"><span className="card-icon">{'\u{1F3AF}'}</span> Priority Distribution</div>
            </div>
            <div className="card-body">
              {total === 0 ? (
                <EmptyChart />
              ) : (
                <div className="bar-chart">
                  {priorityCounts.map((p) => (
                    <BarRow key={p.label} label={p.label} value={p.value} maxVal={maxPriority} hex={p.hex} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="card">
          <div className="card-header">
            <div className="card-title"><span className="card-icon">{'\u{1F4A1}'}</span> AI Insights</div>
          </div>
          <div className="card-body">
            {insights.map((insight, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: 12,
                  padding: '10px 0',
                  borderBottom: i < insights.length - 1 ? '1px solid var(--border)' : 'none',
                }}
              >
                <span style={{ fontSize: 20, flexShrink: 0 }}>{insight.icon}</span>
                <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>{insight.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
