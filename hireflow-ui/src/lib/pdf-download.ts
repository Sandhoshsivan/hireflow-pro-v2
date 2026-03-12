import { pdf } from '@react-pdf/renderer';
import type { DocumentProps } from '@react-pdf/renderer';
import type { ReactElement } from 'react';

/**
 * Renders a React-PDF document element to a blob and triggers a download.
 * The element must be a <Document> component from @react-pdf/renderer.
 */
export async function downloadPDF(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  element: ReactElement<any>,
  filename: string,
): Promise<void> {
  const blob = await pdf(element as ReactElement<DocumentProps>).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
