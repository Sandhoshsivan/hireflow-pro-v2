import { pdf } from '@react-pdf/renderer';
import type { ReactElement } from 'react';

/**
 * Renders a React-PDF document element to a blob and triggers a download.
 */
export async function downloadPDF(element: ReactElement, filename: string): Promise<void> {
  const blob = await pdf(element).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
