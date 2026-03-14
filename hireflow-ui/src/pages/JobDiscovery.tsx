import { useState, useCallback } from 'react';
import {
  Search,
  MapPin,
  ExternalLink,
  Bookmark,
  Loader2,
  Briefcase,
  Clock,
  Tag,
} from 'lucide-react';
import TopBar from '../components/TopBar';
import api from '../lib/api';
import { useToastStore } from '../components/Toast';

/* ── Types ── */
interface DiscoveredJob {
  title: string;
  company: string;
  location: string;
  url: string;
  source: string;
  salary?: string;
  description?: string;
  tags: string[];
  postedAt?: string;
}

interface DiscoverResponse {
  jobs: DiscoveredJob[];
  total: number;
  page: number;
}

/* ── Source badge colors ── */
const sourceColor: Record<string, { bg: string; fg: string }> = {
  Remotive: { bg: '#dbeafe', fg: '#2563eb' },
  Arbeitnow: { bg: '#dcfce7', fg: '#16a34a' },
};

function timeAgo(dateStr?: string): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? '1 month ago' : `${months} months ago`;
}

export default function JobDiscovery() {
  const addToast = useToastStore((s) => s.addToast);

  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [jobs, setJobs] = useState<DiscoveredJob[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [savingUrl, setSavingUrl] = useState<string | null>(null);

  const searchJobs = useCallback(
    async (pg = 1) => {
      if (!query.trim()) return;
      setSearching(true);
      setHasSearched(true);
      try {
        const params = new URLSearchParams({ query: query.trim(), page: String(pg) });
        if (location.trim()) params.set('location', location.trim());
        const { data } = await api.get<DiscoverResponse>(`/jobs/discover?${params}`);
        setJobs(data.jobs);
        setTotal(data.total);
        setPage(pg);
      } catch {
        addToast('error', 'Failed to search jobs');
      } finally {
        setSearching(false);
      }
    },
    [query, location, addToast],
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchJobs(1);
  };

  const saveAsApplication = async (job: DiscoveredJob) => {
    setSavingUrl(job.url);
    try {
      await api.post('/applications', {
        company: job.company,
        jobTitle: job.title,
        status: 'Saved',
        location: job.location,
        salaryRange: job.salary || '',
        source: job.source,
        jobUrl: job.url,
        notes: job.description || '',
        priority: 'Medium',
      });
      addToast('success', `Saved "${job.title}" at ${job.company} to your applications!`);
    } catch {
      addToast('error', 'Failed to save application');
    } finally {
      setSavingUrl(null);
    }
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div>
      <TopBar
        title="Discover Jobs"
        subtitle="Search free job boards and save jobs to your tracker"
      />

      <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* ── Search Form ── */}
        <div className="card animate-fade-up">
          <div className="card-body">
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <div className="search-wrap" style={{ flex: 2, minWidth: 200 }}>
                <span className="search-icon">
                  <Search size={14} />
                </span>
                <input
                  type="text"
                  className="form-input search-input"
                  placeholder="Job title, skill, or keyword..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  style={{ width: '100%', background: 'var(--white)' }}
                />
              </div>
              <div className="search-wrap" style={{ flex: 1, minWidth: 160 }}>
                <span className="search-icon">
                  <MapPin size={14} />
                </span>
                <input
                  type="text"
                  className="form-input search-input"
                  placeholder="Location (optional)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  style={{ width: '100%', background: 'var(--white)' }}
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={searching || !query.trim()}
                style={{ minWidth: 120 }}
              >
                {searching ? (
                  <>
                    <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                    Searching…
                  </>
                ) : (
                  <>
                    <Search size={14} />
                    Search Jobs
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* ── Results ── */}
        {searching && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <div style={{ textAlign: 'center' }}>
              <div className="loading-spinner" style={{ margin: '0 auto 12px' }} />
              <div style={{ fontSize: 13, color: 'var(--text3)' }}>
                Searching across free job boards…
              </div>
            </div>
          </div>
        )}

        {!searching && hasSearched && jobs.length === 0 && (
          <div className="card">
            <div className="card-body">
              <div className="empty-state" style={{ padding: '40px 0' }}>
                <div className="empty-icon">{'\u{1F50D}'}</div>
                <div className="empty-text">No jobs found</div>
                <div className="empty-sub">
                  Try different keywords or remove the location filter
                </div>
              </div>
            </div>
          </div>
        )}

        {!searching && jobs.length > 0 && (
          <>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: 13,
                color: 'var(--text3)',
              }}
            >
              <span>
                Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of{' '}
                <strong style={{ color: 'var(--text)' }}>{total}</strong> jobs found
              </span>
              {totalPages > 1 && (
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    className="btn btn-ghost btn-sm"
                    disabled={page <= 1}
                    onClick={() => searchJobs(page - 1)}
                  >
                    Previous
                  </button>
                  <span style={{ lineHeight: '28px', fontSize: 12, color: 'var(--text2)' }}>
                    Page {page} of {totalPages}
                  </span>
                  <button
                    className="btn btn-ghost btn-sm"
                    disabled={page >= totalPages}
                    onClick={() => searchJobs(page + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {jobs.map((job, idx) => {
                const sc = sourceColor[job.source] ?? { bg: '#f3f4f6', fg: '#6b7280' };
                return (
                  <div
                    key={`${job.url}-${idx}`}
                    className="card animate-fade-up"
                    style={{ animationDelay: `${idx * 30}ms` }}
                  >
                    <div className="card-body" style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                        {/* Left: Job info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              marginBottom: 4,
                            }}
                          >
                            <h3
                              style={{
                                fontSize: 14,
                                fontWeight: 700,
                                color: 'var(--text)',
                                margin: 0,
                              }}
                            >
                              {job.title}
                            </h3>
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 600,
                                padding: '2px 8px',
                                borderRadius: 9999,
                                background: sc.bg,
                                color: sc.fg,
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {job.source}
                            </span>
                          </div>

                          <div
                            style={{
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: 12,
                              fontSize: 12,
                              color: 'var(--text3)',
                              marginBottom: 8,
                            }}
                          >
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Briefcase size={12} /> {job.company}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <MapPin size={12} /> {job.location}
                            </span>
                            {job.salary && (
                              <span style={{ color: 'var(--green)', fontWeight: 600 }}>
                                {job.salary}
                              </span>
                            )}
                            {job.postedAt && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Clock size={12} /> {timeAgo(job.postedAt)}
                              </span>
                            )}
                          </div>

                          {job.description && (
                            <p
                              style={{
                                fontSize: 12,
                                lineHeight: 1.5,
                                color: 'var(--text2)',
                                margin: '0 0 8px',
                                overflow: 'hidden',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                              }}
                            >
                              {job.description}
                            </p>
                          )}

                          {job.tags.length > 0 && (
                            <div
                              style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}
                            >
                              {job.tags.slice(0, 6).map((tag, ti) => (
                                <span
                                  key={ti}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 3,
                                    fontSize: 10,
                                    fontWeight: 500,
                                    padding: '2px 8px',
                                    borderRadius: 9999,
                                    background: 'var(--bg2)',
                                    color: 'var(--text3)',
                                    border: '1px solid var(--border)',
                                  }}
                                >
                                  <Tag size={9} />
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Right: Actions */}
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 6,
                            flexShrink: 0,
                          }}
                        >
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => saveAsApplication(job)}
                            disabled={savingUrl === job.url}
                            style={{ minWidth: 100, justifyContent: 'center' }}
                          >
                            {savingUrl === job.url ? (
                              <Loader2
                                size={13}
                                style={{ animation: 'spin 1s linear infinite' }}
                              />
                            ) : (
                              <Bookmark size={13} />
                            )}
                            {savingUrl === job.url ? 'Saving…' : 'Save Job'}
                          </button>
                          {job.url && (
                            <a
                              href={job.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-ghost btn-sm"
                              style={{
                                minWidth: 100,
                                justifyContent: 'center',
                                textDecoration: 'none',
                              }}
                            >
                              <ExternalLink size={13} />
                              View Job
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 6, padding: '8px 0' }}>
                <button
                  className="btn btn-ghost btn-sm"
                  disabled={page <= 1}
                  onClick={() => searchJobs(page - 1)}
                >
                  Previous
                </button>
                <span
                  style={{
                    lineHeight: '28px',
                    fontSize: 12,
                    color: 'var(--text2)',
                    padding: '0 8px',
                  }}
                >
                  Page {page} of {totalPages}
                </span>
                <button
                  className="btn btn-ghost btn-sm"
                  disabled={page >= totalPages}
                  onClick={() => searchJobs(page + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* ── Empty State (before first search) ── */}
        {!hasSearched && (
          <div className="card animate-fade-up stagger-1">
            <div className="card-body">
              <div className="empty-state" style={{ padding: '50px 0' }}>
                <div className="empty-icon">{'\u{1F310}'}</div>
                <div className="empty-text">Find Your Next Opportunity</div>
                <div className="empty-sub">
                  Search across free job boards like Remotive and Arbeitnow.
                  <br />
                  Found jobs can be saved directly to your application tracker.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
