
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
const dateTimeFormatterCache = new Map<string, Intl.DateTimeFormat>();

const getFormatter = (type: string, decimals: number, currency: string = 'USD'): Intl.NumberFormat => {
    const key = `${type}:${decimals}:${currency}`;
    if (!formatterCache.has(key)) {
        const options: Intl.NumberFormatOptions = {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        };
        
        if (type === 'currency' || type === 'accounting') {
            options.style = 'currency';
            options.currency = currency;
            if (type === 'accounting') {
                options.currencySign = 'accounting';
            }
        } else if (type === 'percent') {
            options.style = 'percent';
        } else if (type === 'scientific') {
            options.notation = 'scientific';
        }
        // 'comma' uses default decimal formatting

        try {
            formatterCache.set(key, new Intl.NumberFormat('en-US', options));
        } catch (e) {
            console.warn(`Formatting error for key "${key}":`, e);
            // Fallback for invalid currency codes
            if (options.style === 'currency') {
                options.currency = 'USD';
                try {
                    formatterCache.set(key, new Intl.NumberFormat('en-US', options));
                } catch {
                    // Total fallback if even USD fails (unlikely)
                    formatterCache.set(key, new Intl.NumberFormat('en-US'));
                }
            } else {
                formatterCache.set(key, new Intl.NumberFormat('en-US'));
            }
        }
    }
    return formatterCache.get(key)!;
};

const getDateFormatter = (type: 'shortDate' | 'longDate' | 'time'): Intl.DateTimeFormat => {
    const key = type;
    if (!dateTimeFormatterCache.has(key)) {
        const options: Intl.DateTimeFormatOptions = {};
        if (type === 'shortDate') {
            options.month = 'numeric';
            options.day = 'numeric';
            options.year = 'numeric';
        } else if (type === 'longDate') {
            options.weekday = 'long';
            options.month = 'long';
            options.day = 'numeric';
            options.year = 'numeric';
        } else if (type === 'time') {
            options.hour = 'numeric';
            options.minute = 'numeric';
            options.second = 'numeric';
        }
        dateTimeFormatterCache.set(key, new Intl.DateTimeFormat('en-US', options));
    }
    return dateTimeFormatterCache.get(key)!;
};

// Excel Serial Date Conversion (1 = 1900-01-01)
// JS uses 1970-01-01. The diff is roughly 25569 days.
const excelDateToJSDate = (serial: number) => {
   // Adjust for Excel leap year bug and timezone (simplistic approach for visual parity)
   const utc_days  = Math.floor(serial - 25569);
   const utc_value = utc_days * 86400;
   const date_info = new Date(utc_value * 1000);
   // Adding timezone offset to force "local" appearance matching input usually
   return new Date(date_info.getTime() + date_info.getTimezoneOffset() * 60 * 1000);
};

/**
 * Formats a cell value based on its style configuration
 */
export const formatCellValue = (value: string, style: CellStyle = {}): string => {
  if (!value || value === '#ERR') return value;
  
  if (style.format === 'text') return value;
  
  // Quick check for simple text to avoid parseFloat overhead unless we are doing numeric formatting
  if (!style.format && /^[a-zA-Z\s]+$/.test(value)) return value;

  const num = parseFloat(value);
  if (isNaN(num)) return value;

  const decimals = style.decimalPlaces ?? 2;
  const currency = style.currencySymbol || 'USD';

  switch (style.format) {
    case 'currency':
      return getFormatter('currency', decimals, currency).format(num);
    case 'accounting':
      return getFormatter('accounting', decimals, currency).format(num);
    case 'comma':
      return getFormatter('comma', decimals).format(num);
    case 'percent':
      return getFormatter('percent', decimals).format(num);
    case 'scientific':
      return getFormatter('scientific', decimals).format(num);
    case 'number':
        // Standard number format with separators
      return new Intl.NumberFormat('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(num);
    case 'shortDate':
    case 'longDate':
    case 'time':
        // Heuristic: If number is > 59 (post-1900 bug), treat as date serial
        // If it's small, it might just be a number, but if user forces Date format, we try to date-ify it.
        const date = excelDateToJSDate(num);
        if (date.toString() === 'Invalid Date') return value;
        return getDateFormatter(style.format).format(date);
    case 'fraction':
        // Simple fraction approximation (e.g. 0.25 -> 1/4)
        // For MVP, just showing decimal or simple logic
        const gcd = (a: number, b: number): number => b ? gcd(b, a % b) : a;
        const len = num.toString().length - 2;
        let denominator = Math.pow(10, len);
        let numerator = num * denominator;
        const divisor = gcd(numerator, denominator);
        numerator /= divisor;
        denominator /= divisor;
        if (denominator === 1) return String(numerator);
        if (denominator > 1000) return num.toFixed(decimals); // fallback if too complex
        return `${Math.floor(numerator)}/${Math.floor(denominator)}`; 
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

// Canvas context for text measurement
let measureCtx: CanvasRenderingContext2D | null = null;

export const measureTextWidth = (text: string, fontSize: number = 13, fontFamily: string = 'Inter, sans-serif', bold: boolean = false, italic: boolean = false): number => {
    if (typeof document === 'undefined') return 0;
    
    if (!measureCtx) {
        const canvas = document.createElement('canvas');
        measureCtx = canvas.getContext('2d');
    }
    
    if (measureCtx) {
        measureCtx.font = `${italic ? 'italic ' : ''}${bold ? 'bold ' : ''}${fontSize}px ${fontFamily}`;
        return measureCtx.measureText(text).width;
    }
    return 0;
};

// --- AUTO-RESIZE CALCULATION ---
export const calculateRotatedDimensions = (text: string, style: CellStyle): { width: number, height: number } => {
    const rotation = style.textRotation || 0;
    const isVertical = style.verticalText;
    
    // If no rotation/vertical, return 0 to indicate no forced resize
    if (rotation === 0 && !isVertical) return { width: 0, height: 0 };

    const fontSize = style.fontSize || 13;
    const fontFamily = style.fontFamily || 'Inter, sans-serif';
    const bold = !!style.bold;
    const italic = !!style.italic;

    // Use the formatted text to calculate actual visible dimensions
    const formattedText = formatCellValue(text, style);

    const textWidth = measureTextWidth(formattedText, fontSize, fontFamily, bold, italic);
    // Line height estimation (Excel is roughly 1.3-1.5x)
    const lineHeight = fontSize * 1.4; 

    if (isVertical) {
        // Stacked text vertical height
        const h = (formattedText.length * fontSize) + (formattedText.length * 2) + 10;
        // Width is roughly one char width + padding
        const w = fontSize + 10; 
        return { width: w, height: h }; 
    }

    const rad = (Math.abs(rotation) * Math.PI) / 180;
    // Bounding box: 
    // Height = Width * sin(theta) + Height * cos(theta)
    // Width = Width * cos(theta) + Height * sin(theta)
    
    const h = (textWidth * Math.sin(rad)) + (lineHeight * Math.cos(rad));
    const w = (textWidth * Math.cos(rad)) + (lineHeight * Math.sin(rad));
    
    // Add comfortable padding like Excel
    return { 
        width: Math.ceil(w) + 12, 
        height: Math.ceil(h) + 10 
    }; 
};

// Kept for backward compatibility if needed, wrapping new function
export const calculateRequiredHeight = (text: string, style: CellStyle): number => {
    return calculateRotatedDimensions(text, style).height;
};
    