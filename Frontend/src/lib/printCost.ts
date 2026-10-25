import type { PrintOptions } from '../services/print.service';

export const calculatePrintCost = (pages: number, printOptions: PrintOptions): number => {
  const { printSide = 'single', colorMode = 'bw', copies = 1 } = printOptions;

  const safePages = Math.max(0, pages || 0);
  const safeCopies = Math.max(1, copies || 1);

  const singleSideRate = colorMode === 'bw' ? 3.5 : 10;
  const doubleSideRate = colorMode === 'bw' ? 5 : 20;

  if (printSide === 'double') {
    const fullSheets = Math.floor(safePages / 2);
    const leftoverPages = safePages % 2;
    const sheetCost = fullSheets * doubleSideRate;
    const leftoverCost = leftoverPages * singleSideRate;
    return (sheetCost + leftoverCost) * safeCopies;
  }

  return safePages * singleSideRate * safeCopies;
};

export const calculateSpecialPagesCost = (
  specialPages: { certificatePage: number; indexPage: number; coverPage: number },
  rate = 1
): number => {
  const total = (specialPages.certificatePage || 0) + (specialPages.indexPage || 0) + (specialPages.coverPage || 0);
  return total * rate;
};
