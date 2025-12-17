

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
 * FORMATTER CACHE (Flyweight)
 * drastically reduces garbage collection during scrolling by reusing Intl objects
 */
const formatterCache = new Map<string, Intl.NumberFormat>();

const getFormatter = (type: 'currency' | 'percent' | 'comma', decimals: number): Intl.NumberFormat => {
    const key = `${type}:${decimals}`;
    if (!formatterCache.has(key)) {
        const options: Intl.NumberFormatOptions = {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        };
        
        if (type === 'currency') {
            options.style = 'currency';
            options.currency = 'USD';
        } else if (type === 'percent') {
            options.style = 'percent';
        }
        // 'comma' uses default decimal formatting

        formatterCache.set(key, new Intl.NumberFormat('en-US', options));
    }
    return formatterCache.get(key)!;
};

/**
 * Formats a cell value based on its style configuration
 */
export const formatCellValue = (value: string, style: CellStyle = {}): string => {
  if (!value || value === '#ERR') return value;
  
  // Quick check for simple text to avoid parseFloat overhead
  if (!style.format && /^[a-zA-Z\s]+$/.test(value)) return value;

  const num = parseFloat(value);
  if (isNaN(num)) return value;

  const decimals = style.decimalPlaces ?? 2;

  switch (style.format) {
    case 'currency':
      return getFormatter('currency', decimals).format(num);
    case 'percent':
      return getFormatter('percent', decimals).format(num);
    case 'comma':
      return getFormatter('comma', decimals).format(num);
    default:
      return value;
  }
};

/**
 * MEMORY COMPRESSION HELPERS (Flyweight Pattern)
 */

// Generate a deterministic hash for a style object
export const hashStyle = (style: CellStyle): string => {
    // Sort keys to ensure {a:1, b:2} === {b:2, a:1}
    const keys = Object.keys(style).sort() as Array<keyof CellStyle>;
    if (keys.length === 0) return "";
    
    // Create a compact string representation
    return keys.map(k => `${k}:${style[k]}`).join('|');
};

// Find or Create a style in the registry
export const getStyleId = (
    registry: Record<string, CellStyle>, 
    newStyle: CellStyle
): { id: string, registry: Record<string, CellStyle> } => {
    const hash = hashStyle(newStyle);
    if (!hash) return { id: "", registry }; // Empty style

    // Implementation: Search for existing value
    // This O(N) lookup is fine because N (number of unique styles) is typically small (< 1000) even in large sheets.
    for (const [id, style] of Object.entries(registry)) {
        if (hashStyle(style) === hash) {
            return { id, registry };
        }
    }

    // Create new ID
    const newId = `s${Object.keys(registry).length + 1}`; // e.g. "s1", "s2"
    return {
        id: newId,
        registry: { ...registry, [newId]: newStyle }
    };
};

/**
 * MERGE HELPERS
 */
export const checkIntersect = (range1: string, range2: string): boolean => {
    const s1 = parseCellId(range1.split(':')[0]);
    const e1 = parseCellId(range1.split(':')[1] || range1.split(':')[0]);
    const s2 = parseCellId(range2.split(':')[0]);
    const e2 = parseCellId(range2.split(':')[1] || range2.split(':')[0]);
    
    if (!s1 || !e1 || !s2 || !e2) return false;

    // Check overlaps
    return !(
        e1.col < s2.col || 
        s1.col > e2.col || 
        e1.row < s2.row || 
        s1.row > e2.row
    );
};

export const getMergeRangeDimensions = (
    range: string, 
    colWidths: Record<string, number>, 
    rowHeights: Record<number, number>,
    defaultW: number,
    defaultH: number
) => {
    const s = parseCellId(range.split(':')[0]);
    const e = parseCellId(range.split(':')[1] || range.split(':')[0]);
    if (!s || !e) return { width: defaultW, height: defaultH, top: 0, left: 0 };

    let width = 0;
    let height = 0;

    for (let c = s.col; c <= e.col; c++) {
        width += colWidths[numToChar(c)] ?? defaultW;
    }
    for (let r = s.row; r <= e.row; r++) {
        height += rowHeights[r] ?? defaultH;
    }

    return { width, height };
};