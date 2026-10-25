const unzipper = require('unzipper');
import { PDFDocument } from 'pdf-lib';
import { Readable } from 'stream';

/**
 * Count PPTX slides by reading the ZIP structure
 * @param buffer - The PPTX file buffer
 * @returns Number of slides (pages) in the presentation
 */
export async function countPptxSlides(buffer: Buffer): Promise<number> {
  try {
    const zip = await (unzipper as any).Open.buffer(buffer);

    // All slide files live inside ppt/slides/
    const slides = (zip.files as any[]).filter(
      (file: any) =>
        file.path.startsWith('ppt/slides/slide') &&
        file.path.endsWith('.xml')
    );

    return slides.length; // slide count = pages count
  } catch (error) {
    console.error('Error counting PPTX slides:', error);
    return 1; // Default to 1 slide if error
  }
}

/**
 * Count total pages from an image (always 1 per image)
 * @param _mimeType - The image MIME type (unused, always 1 page per image)
 * @returns Always 1 (one image = one page for printing)
 */
export function countImagePages(_mimeType: string): number {
  return 1; // One image counts as 1 page for printing
}

/**
 * Count PDF pages using PDFDocument
 * @param buffer - The PDF file buffer
 */
export async function countPdfPages(buffer: Buffer): Promise<number> {
  try {
    const pdfDoc = await PDFDocument.load(buffer);
    return pdfDoc.getPageCount();
  } catch (err) {
    console.error('Error counting PDF pages:', err);
    return 1; // Fallback to 1
  }
}
