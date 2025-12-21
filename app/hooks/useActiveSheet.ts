
import { useMemo } from 'react';
import { Sheet, CellStyle, Table } from '../../types';
import { parseCellId } from '../../utils';

export const useActiveSheet = (sheets: Sheet[], activeSheetId: string) => {
  const activeSheet = useMemo(() => 
    sheets.find(s => s.id === activeSheetId) || sheets[0], 
  [sheets, activeSheetId]);

  const { cells, styles, merges, tables, validations, activeCell, selectionRange, columnWidths, rowHeights } = activeSheet;

  const activeStyle: CellStyle = useMemo(() => {
    if (!activeCell || !cells[activeCell]) return {};
    return cells[activeCell].styleId ? (styles[cells[activeCell].styleId!] || {}) : {};
  }, [activeCell, cells, styles]);

  // Determine if active cell is inside a table
  const activeTable = useMemo(() => {
      if (!activeCell) return null;
      const parsed = parseCellId(activeCell);
      if (!parsed) return null;
      const { col, row } = parsed;
      const tableList = Object.values(tables) as Table[];
      for (const t of tableList) {
          const parts = t.range.split(':');
          const start = parseCellId(parts[0]);
          const end = parseCellId(parts[1] || parts[0]);
          if (start && end && row >= start.row && row <= end.row && col >= start.col && col <= end.col) {
              return t;
          }
      }
      return null;
  }, [activeCell, tables]);

  return {
    activeSheet,
    cells,
    styles,
    merges,
    tables,
    validations,
    activeCell,
    selectionRange,
    columnWidths,
    rowHeights,
    activeStyle,
    activeTable
  };
};
