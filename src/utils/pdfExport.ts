import jsPDF from 'jspdf';
import { toCanvas, toPng, toJpeg } from 'html-to-image';
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
 * Downloads a Blob to the user's device with wide browser and iframe compatibility
 */
export function downloadBlob(blob: Blob, filename: string): void {
  try {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      try {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch {
        // ignore
      }
    }, 1500);
    console.log(`[PDF Export] Successfully initiated download for: ${filename}`);
  } catch (err) {
    console.error('[PDF Export] Failed to download blob via anchor click:', err);
    const fallbackUrl = URL.createObjectURL(blob);
    window.open(fallbackUrl, '_blank');
  }
}

/**
 * Helper to sanitize DOM clone for html2canvas fallback, stripping modern CSS functions like oklch
 */
function sanitizeClonedDomForHtml2Canvas(clonedDoc: Document): void {
  // Strip .no-print elements
  const noPrints = clonedDoc.querySelectorAll('.no-print');
  noPrints.forEach((el) => {
    (el as HTMLElement).style.display = 'none';
  });

  const forceShows = clonedDoc.querySelectorAll('.force-pdf-show');
  forceShows.forEach((el) => {
    (el as HTMLElement).style.display = 'block';
  });

  // Replace oklch in computed inline styles
  const allElements = clonedDoc.querySelectorAll('*');
  allElements.forEach((el) => {
    const htmlEl = el as HTMLElement;
    if (htmlEl.style) {
      if (htmlEl.style.backgroundColor && htmlEl.style.backgroundColor.includes('oklch')) {
        htmlEl.style.backgroundColor = '#ffffff';
      }
      if (htmlEl.style.color && htmlEl.style.color.includes('oklch')) {
        htmlEl.style.color = '#1a1a1a';
      }
      if (htmlEl.style.borderColor && htmlEl.style.borderColor.includes('oklch')) {
        htmlEl.style.borderColor = '#e5e7eb';
      }
    }
  });
}

/**
 * Render element to canvas using html-to-image as primary engine with html2canvas fallback
 */
async function renderElementToCanvas(
  element: HTMLElement,
  scale: number
): Promise<{ canvas: HTMLCanvasElement; imgData: string }> {
  // Primary strategy: html-to-image toCanvas (handles oklch, modern CSS variables, gradients natively)
  try {
    const canvas = await toCanvas(element, {
      quality: 0.95,
      pixelRatio: Math.min(3, Math.max(1.5, scale)),
      backgroundColor: '#ffffff',
      filter: (node) => {
        if (node instanceof HTMLElement && node.classList?.contains('no-print')) {
          return false;
        }
        return true;
      },
      cacheBust: true,
      skipFonts: true,
      fontEmbedCSS: '',
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    return { canvas, imgData };
  } catch (primaryErr) {
    console.warn('[PDF Export] Primary html-to-image toCanvas failed, attempting toPng...', primaryErr);
    
    // Attempt 2: html-to-image toPng with font inlining disabled
    try {
      const dataUrl = await toPng(element, {
        pixelRatio: scale,
        backgroundColor: '#ffffff',
        skipFonts: true,
        fontEmbedCSS: '',
        filter: (node) => !(node instanceof HTMLElement && node.classList?.contains('no-print')),
      });

      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = dataUrl;
      });

      const fallbackCanvas = document.createElement('canvas');
      fallbackCanvas.width = img.naturalWidth || img.width;
      fallbackCanvas.height = img.naturalHeight || img.height;
      const ctx = fallbackCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, fallbackCanvas.width, fallbackCanvas.height);
        ctx.drawImage(img, 0, 0);
      }
      return { canvas: fallbackCanvas, imgData: dataUrl };
    } catch (secondaryErr) {
      console.warn('[PDF Export] Secondary html-to-image toPng failed, falling back to sanitized html2canvas...', secondaryErr);

      // Attempt 3: html2canvas with sanitized clone
      const h2cCanvas = await html2canvas(element, {
        scale: scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        onclone: (clonedDoc) => {
          sanitizeClonedDomForHtml2Canvas(clonedDoc);
        },
      });

      const imgData = h2cCanvas.toDataURL('image/jpeg', 0.95);
      return { canvas: h2cCanvas, imgData };
    }
  }
}

/**
 * Generates a high-quality PDF document from any HTML element using html-to-image & jsPDF
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

    if (!originalBg || originalBg === 'transparent') {
      element.style.backgroundColor = '#ffffff';
    }

    // 2. Render DOM to canvas
    const { canvas, imgData } = await renderElementToCanvas(element, scale);

    // Revert temporary element styles
    element.style.backgroundColor = originalBg;
    element.style.boxShadow = originalBoxShadow;

    // 3. Configure jsPDF document dimensions
    let pdf: jsPDF;

    if (format === 'thermal-80mm') {
      // 80mm thermal receipt roll (72mm printable width)
      const contentWidthMm = 72;
      const contentHeightMm = (canvas.height * contentWidthMm) / canvas.width;
      const pageHeightMm = Math.max(80, contentHeightMm + marginMm * 2);

      pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [80, pageHeightMm],
      });

      pdf.addImage(imgData, 'JPEG', (80 - contentWidthMm) / 2, marginMm, contentWidthMm, contentHeightMm);
    } else if (format === 'thermal-58mm') {
      // 58mm thermal receipt roll (48mm printable width)
      const contentWidthMm = 48;
      const contentHeightMm = (canvas.height * contentWidthMm) / canvas.width;
      const pageHeightMm = Math.max(58, contentHeightMm + marginMm * 2);

      pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [58, pageHeightMm],
      });

      pdf.addImage(imgData, 'JPEG', (58 - contentWidthMm) / 2, marginMm, contentWidthMm, contentHeightMm);
    } else {
      // Standard A4 or Letter document
      const isLetter = format === 'letter';
      const isLandscape = orientation === 'landscape';
      
      const pageWidth = isLetter ? (isLandscape ? 279.4 : 215.9) : (isLandscape ? 297 : 210);
      const pageHeight = isLetter ? (isLandscape ? 215.9 : 279.4) : (isLandscape ? 210 : 297);
      
      const printableWidth = pageWidth - marginMm * 2;
      const printableHeight = pageHeight - marginMm * 2;

      const imgHeight = (canvas.height * printableWidth) / canvas.width;

      pdf = new jsPDF({
        orientation,
        unit: 'mm',
        format: isLetter ? 'letter' : 'a4',
      });

      // Handle multi-page pagination if content exceeds single page
      if (imgHeight <= printableHeight) {
        // Fits comfortably on 1 page
        pdf.addImage(imgData, 'JPEG', marginMm, marginMm, printableWidth, imgHeight);
      } else {
        // Multi-page slicing
        const pageCanvasHeight = (canvas.width * printableHeight) / printableWidth;
        let renderedHeight = 0;
        let pageIdx = 0;

        while (renderedHeight < canvas.height) {
          const sliceHeight = Math.min(pageCanvasHeight, canvas.height - renderedHeight);
          
          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = canvas.width;
          pageCanvas.height = sliceHeight;
          const pCtx = pageCanvas.getContext('2d');

          if (pCtx) {
            pCtx.fillStyle = '#ffffff';
            pCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
            pCtx.drawImage(
              canvas,
              0,
              renderedHeight,
              canvas.width,
              sliceHeight,
              0,
              0,
              canvas.width,
              sliceHeight
            );

            const sliceImgData = pageCanvas.toDataURL('image/jpeg', 0.95);
            const sliceHeightMm = (sliceHeight * printableWidth) / canvas.width;

            if (pageIdx > 0) {
              pdf.addPage(isLetter ? 'letter' : 'a4', orientation);
            }

            pdf.addImage(sliceImgData, 'JPEG', marginMm, marginMm, printableWidth, sliceHeightMm);
          }

          renderedHeight += pageCanvasHeight;
          pageIdx++;
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
