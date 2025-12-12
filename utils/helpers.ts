

import { CellId, CellStyle } from '../types';

/**
 * Converts a 0-based column index to Excel letter format (0 -> A, 25 -> Z, 26 -> AA)
 */
export const numToChar = (num: number): string => {
  let s = '';
  let t;
  while (num > -1) {
    t = (num) % 26;
    s = String.fromCharCode(t + 65) + s;
    num = (num - t) / 26 - 1;
  }
  return s;
};

/**
 * Converts Excel letter format to 0-based column index (A -> 0, Z -> 25, AA -> 26)
 */
export const charToNum = (s: string): number => {
  let num = 0;
  for (let i = 0; i < s.length; i++) {
    num = num * 26 + (s.charCodeAt(i) - 64);
  }
  return num - 1;
};

/**
 * Parses a cell ID (e.g., "A1") into { col: 0, row: 0 }
 */
export const parseCellId = (id: CellId): { col: number; row: number } | null => {
  const match = id.match(/^([A-Z]+)([0-9]+)$/);
  if (!match) return null;
  
  const colStr = match[1];
  const rowStr = match[2];
  
  return {
    col: charToNum(colStr),
    row: parseInt(rowStr, 10) - 1
  };
};

/**
 * Generates a cell ID from coordinates (e.g., 0, 0 -> "A1")
 */
export const getCellId = (col: number, row: number): CellId => {
  return `${numToChar(col)}${row + 1}`;
};

/**
 * Generates a range of cell IDs between two cells (inclusive)
 */
export const getRange = (start: CellId, end: CellId): CellId[] => {
  const s = parseCellId(start);
  const e = parseCellId(end);
  if (!s || !e) return [];

  const minCol = Math.min(s.col, e.col);
  const maxCol = Math.max(s.col, e.col);
  const minRow = Math.min(s.row, e.row);
  const maxRow = Math.max(s.row, e.row);

  const range: CellId[] = [];
  for (let r = minRow; r <= maxRow; r++) {
    for (let c = minCol; c <= maxCol; c++) {
      range.push(getCellId(c, r));
    }
  }
  return range;
};

/**
 * Calculates the next cell ID based on a direction vector
 */
export const getNextCellId = (currentId: string, dRow: number, dCol: number, maxRows: number, maxCols: number): string => {
  const coords = parseCellId(currentId);
  if (!coords) return currentId;
  
  const newRow = Math.max(0, Math.min(maxRows - 1, coords.row + dRow));
  const newCol = Math.max(0, Math.min(maxCols - 1, coords.col + dCol));
  
  return getCellId(newCol, newRow);
};

/**
 * Formats a cell value based on its style configuration
 */
export const formatCellValue = (value: string, style: CellStyle): string => {
  if (!value || value === '#ERR') return value;
  const num = parseFloat(value);
  if (isNaN(num)) return value;

  const decimals = style.decimalPlaces ?? 2;

  switch (style.format) {
    case 'currency':
      return new Intl.NumberFormat('en-US', { 
          style: 'currency', 
          currency: 'USD', 
          minimumFractionDigits: decimals, 
          maximumFractionDigits: decimals 
      }).format(num);
    case 'percent':
      // Excel typically treats 1 as 100%. If value is > 1 it might format large.
      // We assume raw value 0.5 = 50%
      return new Intl.NumberFormat('en-US', { 
          style: 'percent', 
          minimumFractionDigits: decimals, 
          maximumFractionDigits: decimals 
      }).format(num);
    case 'comma':
       return new Intl.NumberFormat('en-US', { 
           minimumFractionDigits: decimals, 
           maximumFractionDigits: decimals 
       }).format(num);
    default:
      return value;
  }
};