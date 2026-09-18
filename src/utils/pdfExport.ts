import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PdfExportOptions {
  filename: string;
  title?: string;
  format?: 'a4' | 'thermal-80mm' | 'thermal-58mm' | 'letter';
  orientation?: 'portrait' | 'landscape';
  marginMm?: number;
  scale?: number;
  autoDownload?: boolean;
}

export interface PdfExportResult {
  success: boolean;
  filename: string;
  blob?: Blob;
  blobUrl?: string;
  error?: string;
}

/**
 * Downloads a Blob to the user's device with wide browser compatibility
 */
export function downloadBlob(blob: Blob, filename: string): void {
  try {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 1000);
    console.log(`[PDF Export] Successfully initiated download for: ${filename}`);
  } catch (err) {
    console.error('[PDF Export] Failed to download blob via anchor click:', err);
    // Fallback: window.open
    const fallbackUrl = URL.createObjectURL(blob);
    window.open(fallbackUrl, '_blank');
  }
}

/**
 * Generates a high-quality PDF document from any HTML element using html2canvas & jsPDF
 */
export async function exportElementToPdf(
  element: HTMLElement | null,
  options: PdfExportOptions
): Promise<PdfExportResult> {
  const {
    filename = 'PhoolMitra-Document.pdf',
    format = 'a4',
    orientation = 'portrait',
    marginMm = 8,
    scale = 2,
    autoDownload = true,
  } = options;

  if (!element) {
    const err = 'Export target element was not found in DOM';
    console.error('[PDF Export Error]', err);
    return { success: false, filename, error: err };
  }

  console.log(`[PDF Export] Starting PDF generation for ${filename} (format: ${format}, orientation: ${orientation})...`);

  try {
    // 1. Temporarily prepare element styles for crisp rendering
    const originalBg = element.style.backgroundColor;
    const originalBoxShadow = element.style.boxShadow;
    
    // Ensure element has white background for clean PDF rendering
    if (!originalBg || originalBg === 'transparent') {
      element.style.backgroundColor = '#ffffff';
    }

    // 2. Render DOM to canvas
    const canvas = await html2canvas(element, {
      scale: scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      onclone: (clonedDoc) => {
        // Ensure all elements in clone are visible and avoid print-hide classes
        const noPrints = clonedDoc.querySelectorAll('.no-print');
        noPrints.forEach((el) => {
          (el as HTMLElement).style.display = 'none';
        });
        const forceShows = clonedDoc.querySelectorAll('.force-pdf-show');
        forceShows.forEach((el) => {
          (el as HTMLElement).style.display = 'block';
        });
      },
    });

    // Revert temporary element styles
    element.style.backgroundColor = originalBg;
    element.style.boxShadow = originalBoxShadow;

    // 3. Configure jsPDF document dimensions
    let pdf: jsPDF;
    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    if (format === 'thermal-80mm') {
      // 80mm thermal receipt roll (72mm printable width)
      const contentWidthMm = 72;
      const contentHeightMm = (canvas.height * contentWidthMm) / canvas.width;
      const pageHeightMm = contentHeightMm + marginMm * 2;
      
      pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [80, Math.max(80, pageHeightMm)],
      });

      pdf.addImage(imgData, 'JPEG', (80 - contentWidthMm) / 2, marginMm, contentWidthMm, contentHeightMm);
    } else if (format === 'thermal-58mm') {
      // 58mm thermal receipt roll (48mm printable width)
      const contentWidthMm = 48;
      const contentHeightMm = (canvas.height * contentWidthMm) / canvas.width;
      const pageHeightMm = contentHeightMm + marginMm * 2;
      
      pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [58, Math.max(58, pageHeightMm)],
      });

      pdf.addImage(imgData, 'JPEG', (58 - contentWidthMm) / 2, marginMm, contentWidthMm, contentHeightMm);
    } else {
      // Standard A4 document (210 x 297 mm)
      const isLandscape = orientation === 'landscape';
      const pageWidth = isLandscape ? 297 : 210;
      const pageHeight = isLandscape ? 210 : 297;
      const printableWidth = pageWidth - marginMm * 2;
      const printableHeight = pageHeight - marginMm * 2;

      const imgHeight = (canvas.height * printableWidth) / canvas.width;

      pdf = new jsPDF({
        orientation,
        unit: 'mm',
        format: 'a4',
      });

      // Handle multi-page pagination if content exceeds single page
      if (imgHeight <= printableHeight) {
        // Fits comfortably on 1 page
        pdf.addImage(imgData, 'JPEG', marginMm, marginMm, printableWidth, imgHeight);
      } else {
        // Multi-page slicing
        let heightLeft = imgHeight;
        let position = marginMm;
        let pageCount = 1;

        pdf.addImage(imgData, 'JPEG', marginMm, position, printableWidth, imgHeight);
        heightLeft -= printableHeight;

        while (heightLeft > 0) {
          position = heightLeft - imgHeight + marginMm - (pageCount * marginMm);
          pdf.addPage('a4', orientation);
          pdf.addImage(imgData, 'JPEG', marginMm, position, printableWidth, imgHeight);
          heightLeft -= printableHeight;
          pageCount++;
        }
      }
    }

    // 4. Create Blob & trigger download
    const pdfBlob = pdf.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);

    if (autoDownload) {
      downloadBlob(pdfBlob, filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
    }

    console.log(`[PDF Export Success] Generated ${filename} (${pdfBlob.size} bytes)`);
    return {
      success: true,
      filename,
      blob: pdfBlob,
      blobUrl,
    };
  } catch (error: any) {
    console.error('[PDF Export Fatal Error]', error);
    return {
      success: false,
      filename,
      error: error?.message || 'Unknown PDF generation error',
    };
  }
}

/**
 * Fallback printing helper that uses an invisible iframe to prevent host window sandbox blocking
 */
export function printHtmlViaIframe(element: HTMLElement, title = 'PhoolMitra Document'): void {
  try {
    const existingIframe = document.getElementById('print-iframe-helper');
    if (existingIframe) {
      existingIframe.remove();
    }

    const iframe = document.createElement('iframe');
    iframe.id = 'print-iframe-helper';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';

    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    // Copy styles from main document
    const headContent = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map((el) => el.outerHTML)
      .join('\n');

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          ${headContent}
          <style>
            @media print {
              body { margin: 0; padding: 12px; background: #fff !important; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            ${element.outerHTML}
          </div>
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    }, 500);
  } catch (err) {
    console.error('[Iframe Print Error, falling back to window.print()]', err);
    window.print();
  }
}
