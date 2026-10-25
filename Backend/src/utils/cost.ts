import { PrintOptions } from '../database/printRequests';

export const calculatePrintCost = (pages: number, printOptions: PrintOptions): number => {
  const { printSide = 'single', colorMode = 'bw', copies = 1 } = printOptions;

  // Pricing rules:
  // - Black & White: ₹3.5 / page (single-side), ₹5 / sheet (double-side)
  // - Color: ₹10 / page (single-side), ₹20 / sheet (double-side)
  const singleSideRate = colorMode === 'bw' ? 3.5 : 10;
  const doubleSideRate = colorMode === 'bw' ? 5 : 20;

  if (printSide === 'double') {
    const fullSheets = Math.floor(pages / 2);
    const leftoverPages = pages % 2;
    const sheetCost = fullSheets * doubleSideRate;
    const leftoverCost = leftoverPages * singleSideRate;
    return (sheetCost + leftoverCost) * copies;
  }

  return pages * singleSideRate * copies;
};

export const calculateSpecialPagesCost = (certificatePages: number, indexPages: number, coverPages: number): number => {
  // Special pages cost: ₹1.5 each
  return (certificatePages + indexPages + coverPages) * 1.5;
};

export const calculateTotalCost = (files: Array<{ pages: number; printOptions?: PrintOptions }>): number => {
  return files.reduce((total, file) => {
    if (!file.printOptions) return total;
    return total + calculatePrintCost(file.pages, file.printOptions);
  }, 0);
};
