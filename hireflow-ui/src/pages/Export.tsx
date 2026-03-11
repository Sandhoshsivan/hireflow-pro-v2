import { useState } from 'react';
import {
  Download, FileText, Code, CheckCircle2, Clock, Info,
} from 'lucide-react';
import TopBar from '../components/TopBar';
import api from '../lib/api';
import { useToastStore } from '../components/Toast';

const EXPORT_FIELDS = [
  { label: 'Company', desc: 'Employer name' },
  { label: 'Role', desc: 'Job title applied for' },
  { label: 'Status', desc: 'Current application status' },
  { label: 'Priority', desc: 'Your priority level' },
  { label: 'Applied Date', desc: 'Date of application' },
  { label: 'Location', desc: 'Job location or remote' },
  { label: 'Salary', desc: 'Expected or listed salary' },
  { label: 'Source', desc: 'Where you found the role' },
  { label: 'Notes', desc: 'Your personal notes' },
  { label: 'Follow-up Date', desc: 'Scheduled follow-up date' },
  { label: 'URL', desc: 'Link to job posting' },
];

export default function Export() {
  const [exporting, setExporting] = useState(false);
  const [lastExported, setLastExported] = useState<Date | null>(null);
  const addToast = useToastStore((s) => s.addToast);

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await api.get('/applications/export/csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `hireflow-applications-${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setLastExported(new Date());
      addToast('success', 'Applications exported as CSV successfully');
    } catch {
      addToast('error', 'Failed to export CSV. This feature may require an upgrade.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <TopBar
        title="Export Data"
        subtitle="Download your application data"
      />

      {/* Export format cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6 max-w-3xl animate-fade-up">

        {/* CSV Export Card — active */}
        <div
          className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col hover:shadow-md transition-all duration-200"
          style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.06), 0 4px 16px rgba(15,23,42,0.04)' }}
        >
          <div className="flex items-start justify-between mb-5">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #eff6ff, #dbeafe)' }}
            >
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full border"
              style={{ background: '#dcfce7', color: '#166534', borderColor: '#bbf7d0' }}
            >
              Available
            </span>
          </div>

          <h3 className="text-base font-bold mb-1.5" style={{ color: '#0f172a' }}>Export as CSV</h3>
          <p className="text-sm mb-5 flex-1" style={{ color: '#64748b' }}>
            Download all your applications as a spreadsheet-ready CSV file. Compatible with Excel, Google Sheets, and any spreadsheet tool.
          </p>

          {lastExported && (
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="text-xs" style={{ color: '#64748b' }}>
                Last exported:{' '}
                {lastExported.toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          )}

          <button
            onClick={handleExport}
            disabled={exporting}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #1a56db 0%, #1e40af 100%)' }}
          >
            {exporting ? (
              <>
                <Clock className="w-4 h-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download CSV
              </>
            )}
          </button>
        </div>

        {/* JSON Export Card — coming soon / disabled */}
        <div
          className="bg-white rounded-xl border border-dashed border-slate-200 p-6 flex flex-col opacity-60"
        >
          <div className="flex items-start justify-between mb-5">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: '#f1f5f9' }}
            >
              <Code className="w-6 h-6" style={{ color: '#94a3b8' }} />
            </div>
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full border"
              style={{ background: '#fef3c7', color: '#92400e', borderColor: '#fde68a' }}
            >
              Coming Soon
            </span>
          </div>

          <h3 className="text-base font-bold mb-1.5" style={{ color: '#0f172a' }}>Export as JSON</h3>
          <p className="text-sm mb-5 flex-1" style={{ color: '#64748b' }}>
            Export your data as structured JSON for use in custom integrations, APIs, or developer tooling.
          </p>

          <button
            disabled
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold border border-dashed cursor-not-allowed"
            style={{ background: '#f8fafc', color: '#94a3b8', borderColor: '#e2e8f0' }}
          >
            <Download className="w-4 h-4" />
            Export JSON
          </button>
        </div>
      </div>

      {/* What's included card */}
      <div
        className="bg-white rounded-xl border border-slate-200 p-6 max-w-3xl animate-fade-up"
        style={{
          boxShadow: '0 1px 3px rgba(15,23,42,0.06), 0 4px 16px rgba(15,23,42,0.04)',
          animationDelay: '80ms',
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: '#eff6ff' }}
          >
            <Info className="w-4 h-4 text-blue-500" />
          </div>
          <h3 className="text-sm font-semibold" style={{ color: '#0f172a' }}>What's included in the export</h3>
        </div>

        <p className="text-xs mb-4" style={{ color: '#94a3b8' }}>
          Your CSV export includes all application data across the following fields:
        </p>

        {/* 2-col fields grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
          {EXPORT_FIELDS.map((field) => (
            <div key={field.label} className="flex items-center gap-3">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                style={{ background: '#dcfce7' }}
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              </div>
              <div>
                <span className="text-xs font-semibold" style={{ color: '#334155' }}>
                  {field.label}
                </span>
                <span className="text-xs ml-2" style={{ color: '#94a3b8' }}>
                  — {field.desc}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer info note */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-start gap-2.5">
          <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: '#94a3b8' }} />
          <p className="text-xs" style={{ color: '#94a3b8' }}>
            The exported file uses UTF-8 encoding and is compatible with all major spreadsheet applications.
            Sensitive data such as passwords are never included.
          </p>
        </div>
      </div>
    </div>
  );
}
