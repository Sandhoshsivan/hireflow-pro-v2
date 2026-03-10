import { useEffect, useState } from 'react';
import { Clock, DollarSign, X, MapPin, ExternalLink } from 'lucide-react';
import clsx from 'clsx';
import TopBar from '../components/TopBar';
import api from '../lib/api';
import type { Application, ApplicationStatus } from '../types';

const columns: { status: ApplicationStatus; label: string; color: string; bgColor: string }[] = [
  { status: 'saved', label: 'Saved', color: 'bg-cyan-500', bgColor: 'bg-cyan-50' },
  { status: 'applied', label: 'Applied', color: 'bg-blue-500', bgColor: 'bg-blue-50' },
  { status: 'interview', label: 'Interview', color: 'bg-amber-500', bgColor: 'bg-amber-50' },
  { status: 'offer', label: 'Offer', color: 'bg-emerald-500', bgColor: 'bg-emerald-50' },
  { status: 'rejected', label: 'Rejected', color: 'bg-red-500', bgColor: 'bg-red-50' },
  { status: 'ghosted', label: 'Ghosted', color: 'bg-slate-400', bgColor: 'bg-slate-50' },
];

export default function Pipeline() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

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

  const grouped = columns.map((col) => ({
    ...col,
    apps: apps.filter((a) => a.status === col.status),
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <TopBar title="Pipeline" subtitle="Kanban view of your applications" />

      <div className="flex gap-4 overflow-x-auto pb-4">
        {grouped.map((col) => (
          <div key={col.status} className="min-w-[260px] w-[260px] flex-shrink-0">
            <div className="flex items-center gap-2 mb-3">
              <span className={clsx('w-2.5 h-2.5 rounded-full', col.color)} />
              <h3 className="text-sm font-semibold text-slate-700">{col.label}</h3>
              <span className="text-xs text-slate-400 ml-auto">{col.apps.length}</span>
            </div>
            <div className={clsx('rounded-lg p-2 space-y-2 min-h-[200px]', col.bgColor)}>
              {col.apps.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8">No applications</p>
              ) : (
                col.apps.map((app) => (
                  <div
                    key={app.id}
                    onClick={() => setSelectedApp(app)}
                    className="bg-white rounded-lg p-3 shadow-sm border border-slate-100 cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <p className="text-sm font-medium text-slate-900 mb-0.5">{app.company}</p>
                    <p className="text-xs text-slate-500 mb-2">{app.role}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      {app.salary && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          {app.salary}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(app.appliedDate || app.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Card Detail Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">{selectedApp.company}</h2>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <p className="text-slate-600">{selectedApp.role}</p>
              <div className="grid grid-cols-2 gap-3">
                {selectedApp.salary && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <DollarSign className="w-4 h-4 text-slate-400" />
                    {selectedApp.salary}
                  </div>
                )}
                {selectedApp.location && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    {selectedApp.location}
                  </div>
                )}
                <div className="flex items-center gap-2 text-slate-500">
                  <Clock className="w-4 h-4 text-slate-400" />
                  {new Date(selectedApp.appliedDate || selectedApp.createdAt).toLocaleDateString()}
                </div>
                {selectedApp.url && (
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                    <a
                      href={selectedApp.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Job Link
                    </a>
                  </div>
                )}
              </div>
              {selectedApp.notes && (
                <p className="text-slate-500 bg-slate-50 rounded-lg p-3">{selectedApp.notes}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
