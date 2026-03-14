import { useEffect, useState, useCallback } from 'react';
import { X } from 'lucide-react';
import TopBar from '../components/TopBar';
import api from '../lib/api';
import type { Application, ApplicationStatus } from '../types';
import { extractApplications } from '../lib/normalize';

const columns: { status: ApplicationStatus; label: string; color: string }[] = [
  { status: 'saved', label: 'Saved', color: 'var(--cyan)' },
  { status: 'applied', label: 'Applied', color: 'var(--blue)' },
  { status: 'interview', label: 'Interview', color: 'var(--amber)' },
  { status: 'offer', label: 'Offer', color: 'var(--green)' },
  { status: 'rejected', label: 'Rejected', color: 'var(--red)' },
];

function hasUpcomingFollowUp(app: Application): boolean {
  if (!app.followUpDate) return false;
  return new Date(app.followUpDate) <= new Date(Date.now() + 3 * 86400000);
}

function priorityClass(p: string): string {
  if (p === 'high') return 'p-high';
  if (p === 'medium') return 'p-medium';
  if (p === 'low') return 'p-low';
  return '';
}

function statusLabel(s: ApplicationStatus): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function Pipeline() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  const fetchApps = useCallback(async () => {
    try {
      const { data } = await api.get('/applications');
      setApps(extractApplications(data));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApps();
  }, [fetchApps]);

  // Refetch when user returns to this tab
  useEffect(() => {
    const handleFocus = () => fetchApps();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchApps]);

  const grouped = columns.map((col) => ({
    ...col,
    apps: apps.filter((a) => a.status === col.status),
  }));

  if (loading) {
    return (
      <div>
        <TopBar title="Pipeline" />
        <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 28, height: 28, border: '3px solid var(--border)', borderTopColor: 'var(--blue)', borderRadius: '50%', margin: '0 auto 12px' }} className="animate-spin" />
            <div style={{ fontSize: 13, color: 'var(--text3)' }}>Loading pipeline...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <TopBar title="Pipeline" />
        <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.5 }}>!</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>Failed to load pipeline</div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 16 }}>There was an error fetching your applications.</div>
            <button className="btn btn-primary" onClick={() => window.location.reload()}>Try again</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <TopBar
        title="Pipeline"
        actions={
          <button className="btn btn-primary">{'\uFF0B'} Track Job</button>
        }
      />

      <div className="page-content" style={{ overflowX: 'auto', overflowY: 'hidden' }}>
        <div className="kanban-wrap" id="kanban-board">
          {grouped.map((col) => (
            <div className="kan-col" key={col.status}>
              <div className="kan-col-header">
                <div className="kan-col-title" style={{ color: col.color }}>{col.label}</div>
                <span className="kan-col-count">{col.apps.length}</span>
              </div>

              {col.apps.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '20px 10px',
                  color: 'var(--text3)',
                  fontSize: 12,
                  border: '1px dashed var(--border)',
                  borderRadius: 'var(--radius)',
                  marginTop: 4,
                }}>
                  Empty
                </div>
              ) : (
                col.apps.map((app) => (
                  <div
                    className="kan-card"
                    key={app.id}
                    onClick={() => setSelectedApp(app)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6 }}>
                      <div className="kan-card-co truncate">{app.company}</div>
                      {app.priority && (
                        <span className={`priority-dot ${priorityClass(app.priority)}`} title={`${app.priority} priority`} />
                      )}
                    </div>
                    <div className="kan-card-role">{app.role}</div>
                    {app.location && (
                      <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 4 }}>
                        📍 {app.location}
                      </div>
                    )}
                    <div className="kan-card-foot">
                      <div className="kan-card-sal">{app.salary || ''}</div>
                      <div className="kan-card-date">
                        {new Date(app.appliedDate || app.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    </div>
                    {hasUpcomingFollowUp(app) && (
                      <div style={{
                        marginTop: 8,
                        fontSize: 10,
                        background: 'var(--amber-lt)',
                        color: 'var(--amber)',
                        borderRadius: 4,
                        padding: '2px 7px',
                        display: 'inline-block',
                        fontWeight: 600,
                      }}>
                        ⏰ Follow-up due
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedApp && (
        <div
          className="modal-overlay open"
          onClick={() => setSelectedApp(null)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="modal-title">{selectedApp.company}</div>
                <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2 }}>{selectedApp.role}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className={`badge badge-${selectedApp.status}`}>
                  {statusLabel(selectedApp.status)}
                </span>
                <button className="btn btn-ghost btn-icon" onClick={() => setSelectedApp(null)} style={{ color: 'var(--text3)' }}>
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="modal-body">
              <div className="info-grid">
                {selectedApp.salary && (
                  <div className="info-row">
                    <div className="info-key">Salary</div>
                    <div className="info-val" style={{ color: 'var(--green)', fontFamily: "'Fira Code', monospace", fontWeight: 600 }}>{selectedApp.salary}</div>
                  </div>
                )}
                {selectedApp.location && (
                  <div className="info-row">
                    <div className="info-key">Location</div>
                    <div className="info-val">{selectedApp.location}</div>
                  </div>
                )}
                <div className="info-row">
                  <div className="info-key">Applied</div>
                  <div className="info-val" style={{ fontFamily: "'Fira Code', monospace", fontSize: 12 }}>
                    {new Date(selectedApp.appliedDate || selectedApp.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
                {selectedApp.source && (
                  <div className="info-row">
                    <div className="info-key">Source</div>
                    <div className="info-val">{selectedApp.source}</div>
                  </div>
                )}
                {selectedApp.priority && (
                  <div className="info-row">
                    <div className="info-key">Priority</div>
                    <div className="info-val" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className={`priority-dot ${priorityClass(selectedApp.priority)}`} />
                      <span style={{ textTransform: 'capitalize' }}>{selectedApp.priority}</span>
                    </div>
                  </div>
                )}
                {selectedApp.url && (
                  <div className="info-row">
                    <div className="info-key">Job Link</div>
                    <div className="info-val">
                      <a href={selectedApp.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--blue)', fontWeight: 600, fontSize: 12 }} onClick={(e) => e.stopPropagation()}>
                        Open listing →
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {selectedApp.notes && (
                <div style={{ marginTop: 16 }}>
                  <div className="info-key" style={{ marginBottom: 6 }}>Notes</div>
                  <div style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text2)', background: 'var(--bg)', padding: '12px 14px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                    {selectedApp.notes}
                  </div>
                </div>
              )}

              {hasUpcomingFollowUp(selectedApp) && selectedApp.followUpDate && (
                <div className="followup-card" style={{ marginTop: 16 }}>
                  <div className="followup-title">⏰ Follow-up due</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)' }}>
                    {new Date(selectedApp.followUpDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedApp(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
