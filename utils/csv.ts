
import { CellData } from '../types';
import { parseCellId, getCellId } from './helpers';

export const generateCsv = (cells: Record<string, CellData>): string => {
  let maxRow = 0;
  let maxCol = 0;
  let hasData = false;

  // 1. Calculate Bounds
  Object.keys(cells).forEach(key => {
    const coords = parseCellId(key);
    if (coords) {
      hasData = true;
      maxRow = Math.max(maxRow, coords.row);
      maxCol = Math.max(maxCol, coords.col);
    }
  });

  if (!hasData) return "";

  // 2. Build CSV Content
  let csvContent = "";
  
  for (let r = 0; r <= maxRow; r++) {
    const rowValues: string[] = [];
    for (let c = 0; c <= maxCol; c++) {
      const cellId = getCellId(c, r);
      const cell = cells[cellId];
      let val = cell?.value || ""; 

      // Convert to string just in case
      val = String(val);

      // CSV Escaping: If contains quotes, commas, or newlines
      if (val.search(/["|,\n]/g) >= 0) {
        val = `"${val.replace(/"/g, '""')}"`;
      }
      rowValues.push(val);
    }
    csvContent += rowValues.join(",") + "\n";
  }

  return csvContent;
};

export const downloadCsv = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
