import { useState } from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';
import TopBar from '../components/TopBar';
import api from '../lib/api';
import { useToastStore } from '../components/Toast';

export default function Export() {
  const [exporting, setExporting] = useState(false);
  const addToast = useToastStore((s) => s.addToast);

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await api.get('/applications/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'applications.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      addToast('success', 'CSV exported successfully');
    } catch {
      addToast('error', 'Failed to export CSV. This feature may require an upgrade.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <TopBar title="Export Data" subtitle="Download your applications as CSV" />

      <div className="max-w-md mx-auto mt-12">
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4">
            <FileSpreadsheet className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Export Applications</h3>
          <p className="text-sm text-slate-500 mb-6">
            Download all your job applications as a CSV file for use in spreadsheets or other tools.
          </p>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>
      </div>
    </div>
  );
}
