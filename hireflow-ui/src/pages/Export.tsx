import { useState } from 'react';
import {
  Download, FileText, Code, CheckCircle2, Clock, Info,
} from 'lucide-react';
import TopBar from '../components/TopBar';
import api from '../lib/api';
import { useToastStore } from '../components/Toast';

const EXPORT_FIELDS = [
  { label: 'Company',       desc: 'Employer name' },
  { label: 'Role',          desc: 'Job title applied for' },
  { label: 'Status',        desc: 'Current application status' },
  { label: 'Priority',      desc: 'Your priority level' },
  { label: 'Applied Date',  desc: 'Date of application' },
  { label: 'Location',      desc: 'Job location or remote' },
  { label: 'Salary',        desc: 'Expected or listed salary' },
  { label: 'Source',        desc: 'Where you found the role' },
  { label: 'Notes',         desc: 'Your personal notes' },
  { label: 'Follow-up Date',desc: 'Scheduled follow-up date' },
  { label: 'URL',           desc: 'Link to job posting' },
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

      <div className="page-content">

        {/* Export format cards — two columns */}
        <div className="grid-2 mb-6" style={{ maxWidth: 720 }}>

          {/* CSV Export Card — active */}
          <div className="card animate-fade-up" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="card-header">
              <span className="card-title">
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 'var(--radius)',
                    background: 'var(--blue-lt)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <FileText size={15} color="var(--blue)" />
                </div>
                Export as CSV
              </span>
              <span
                style={{
                  background: 'var(--green-lt)',
                  color: 'var(--green)',
                  border: '1px solid var(--green-md)',
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '3px 9px',
                  borderRadius: 20,
                  fontFamily: "'Fira Code', monospace",
                  whiteSpace: 'nowrap',
                }}
              >
                Available
              </span>
            </div>

            <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16, flex: 1, lineHeight: 1.6 }}>
                Download all your applications as a spreadsheet-ready CSV file. Compatible with Excel,
                Google Sheets, and any spreadsheet tool.
              </p>

              {lastExported && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    marginBottom: 14,
                    padding: '8px 10px',
                    background: 'var(--green-lt)',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--green-md)',
                  }}
                >
                  <CheckCircle2 size={13} color="var(--green)" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: 'var(--green)', fontWeight: 500 }}>
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
                className="btn btn-primary w-full"
                style={{ justifyContent: 'center' }}
              >
                {exporting ? (
                  <>
                    <Clock size={14} className="animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download size={14} />
                    Download CSV
                  </>
                )}
              </button>
            </div>
          </div>

          {/* JSON Export Card — coming soon / disabled */}
          <div
            className="card animate-fade-up stagger-2"
            style={{ display: 'flex', flexDirection: 'column', opacity: 0.55 }}
          >
            <div className="card-header">
              <span className="card-title">
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 'var(--radius)',
                    background: 'var(--bg2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Code size={15} color="var(--text3)" />
                </div>
                Export as JSON
              </span>
              <span
                style={{
                  background: 'var(--amber-lt)',
                  color: 'var(--amber)',
                  border: '1px solid var(--amber-md)',
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '3px 9px',
                  borderRadius: 20,
                  fontFamily: "'Fira Code', monospace",
                  whiteSpace: 'nowrap',
                }}
              >
                Coming Soon
              </span>
            </div>

            <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16, flex: 1, lineHeight: 1.6 }}>
                Export your data as structured JSON for use in custom integrations, APIs, or developer
                tooling.
              </p>

              <button
                disabled
                className="btn w-full"
                style={{
                  justifyContent: 'center',
                  background: 'var(--bg2)',
                  color: 'var(--text3)',
                  border: '1px dashed var(--border2)',
                  cursor: 'not-allowed',
                }}
              >
                <Download size={14} />
                Export JSON
              </button>
            </div>
          </div>
        </div>

        {/* What's included card */}
        <div className="card animate-fade-up stagger-3" style={{ maxWidth: 720 }}>
          <div className="card-header">
            <span className="card-title">
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 'var(--radius)',
                  background: 'var(--blue-lt)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Info size={13} color="var(--blue)" />
              </div>
              What's included in the export
            </span>
          </div>

          <div className="card-body">
            <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 16 }}>
              Your CSV export includes all application data across the following fields:
            </p>

            {/* 2-col fields grid using info-grid pattern */}
            <div className="info-grid">
              {EXPORT_FIELDS.map((field) => (
                <div className="info-row" key={field.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      background: 'var(--green-lt)',
                      border: '1px solid var(--green-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: 1,
                    }}
                  >
                    <CheckCircle2 size={10} color="var(--green)" />
                  </div>
                  <div>
                    <div className="info-key">{field.label}</div>
                    <div className="info-val" style={{ color: 'var(--text3)', fontSize: 12, fontWeight: 400 }}>
                      {field.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer note */}
            <div
              style={{
                marginTop: 16,
                paddingTop: 14,
                borderTop: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
              }}
            >
              <Info size={13} color="var(--text3)" style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.6 }}>
                The exported file uses UTF-8 encoding and is compatible with all major spreadsheet
                applications. Sensitive data such as passwords are never included.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}