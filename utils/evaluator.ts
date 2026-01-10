
import { CellData, CellId } from '../types';
import { parseCellId, getCellId, numToChar, charToNum, getRange } from './helpers';
import { create, all, factory } from 'mathjs';

// Initialize mathjs with custom configuration
const math = create(all, {
  number: 'number',
  precision: 14,
});

// --- ERROR CONSTANTS ---
export const ERROR_DIV_ZERO = '#DIV/0!';
export const ERROR_NAME = '#NAME?';
export const ERROR_VALUE = '#VALUE!';
export const ERROR_REF = '#REF!';
export const ERROR_NA = '#N/A';
export const ERROR_CIRC = '#CIRC!';
export const ERROR_GENERIC = '#ERR';

// --- CUSTOM EXCEL FUNCTIONS ---
// We import these into the mathjs scope
math.import({
  // Logic
  IF: (condition: any, valueIfTrue: any, valueIfFalse: any) => {
    // Note: This implementation is eager in JS, but we handle IF in pre-processing 
    // to map to ternary operators for lazy eval. This is a fallback.
    return condition ? valueIfTrue : valueIfFalse;
  },
  AND: (...args: any[]) => args.every(Boolean),
  OR: (...args: any[]) => args.some(Boolean),
  NOT: (val: any) => !val,
  TRUE: () => true,
  FALSE: () => false,

  // Text
  CONCATENATE: (...args: any[]) => args.join(''),
  LEFT: (text: string, num: number = 1) => String(text).substring(0, num),
  RIGHT: (text: string, num: number = 1) => String(text).slice(-num),
  MID: (text: string, start: number, len: number) => String(text).substring(start - 1, start - 1 + len),
  LEN: (text: string) => String(text).length,
  LOWER: (text: string) => String(text).toLowerCase(),
  UPPER: (text: string) => String(text).toUpperCase(),
  TRIM: (text: string) => String(text).trim(),
  TEXT: (value: any) => String(value),

  // Date (Excel dates are days since 1900-01-01)
  TODAY: () => {
    const diff = Date.now() - new Date(1899, 11, 30).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  },
  NOW: () => {
    const diff = Date.now() - new Date(1899, 11, 30).getTime();
    return diff / (1000 * 60 * 60 * 24);
  },
  DATE: (year: number, month: number, day: number) => {
    const d = new Date(year, month - 1, day);
    const diff = d.getTime() - new Date(1899, 11, 30).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  },
  YEAR: (serial: number) => {
     const d = new Date(1899, 11, 30);
     d.setDate(d.getDate() + serial);
     return d.getFullYear();
  },
  MONTH: (serial: number) => {
     const d = new Date(1899, 11, 30);
     d.setDate(d.getDate() + serial);
     return d.getMonth() + 1;
  },
  DAY: (serial: number) => {
     const d = new Date(1899, 11, 30);
     d.setDate(d.getDate() + serial);
     return d.getDate();
  },

  // Lookup & Reference
  VLOOKUP: (lookupValue: any, tableArray: any[][], colIndexNum: number, rangeLookup: boolean = true) => {
    try {
        if (!Array.isArray(tableArray)) return ERROR_VALUE;
        // Convert mathjs matrix to array if needed (though we try to pass arrays)
        const rows = tableArray; // Assuming 2D array
        
        // Exact Match
        if (rangeLookup === false || rangeLookup === 0 as any) {
            const row = rows.find(r => String(r[0]).toLowerCase() === String(lookupValue).toLowerCase());
            if (!row) return ERROR_NA;
            return row[colIndexNum - 1]; // 1-based index
        }
        
        // Approximate Match (Assumes sorted first column)
        let bestRow = null;
        for (const row of rows) {
            if (row[0] <= lookupValue) {
                bestRow = row;
            } else {
                break;
            }
        }
        if (!bestRow) return ERROR_NA;
        return bestRow[colIndexNum - 1];
    } catch (e) {
        return ERROR_REF;
    }
  },
  
  // Math Aggregates (MathJS has basic ones, we override to handle flatten behavior for matrices)
  COUNT: (...args: any[]) => {
      const flat = args.flat(Infinity).filter(v => typeof v === 'number' && !isNaN(v));
      return flat.length;
  },
  COUNTA: (...args: any[]) => {
      const flat = args.flat(Infinity).filter(v => v !== null && v !== "" && v !== undefined);
      return flat.length;
  },
  // Basic mathjs SUM/AVG/MIN/MAX handle nested arrays well, so we might not need to override them
  // unless we want specific Excel behavior (ignoring text strings vs throwing errors).
  // MathJS `sum` throws on strings.
  SUM: (...args: any[]) => {
      const flat = args.flat(Infinity);
      return flat.reduce((acc, v) => {
          const n = Number(v);
          return acc + (isNaN(n) ? 0 : n);
      }, 0);
  },
  AVERAGE: (...args: any[]) => {
      const flat = args.flat(Infinity);
      let sum = 0;
      let count = 0;
      flat.forEach(v => {
          const n = Number(v);
          if (!isNaN(n)) {
              sum += n;
              count++;
          }
      });
      return count === 0 ? ERROR_DIV_ZERO : sum / count;
  }
});

// Helper to check if a string is numeric
const isNumeric = (str: any) => {
  if (typeof str === 'number') return true;
  if (typeof str !== 'string') return false;
  return !isNaN(parseFloat(str)) && isFinite(Number(str));
};

const getCellValue = (cells: Record<CellId, CellData>, id: CellId): any => {
  const cell = cells[id];
  if (!cell) return 0; // Empty cell is 0
  
  const val = cell.value;
  if (val === undefined || val === null || val === '') return 0;
  
  // Return number if numeric, else string
  if (isNumeric(val)) return parseFloat(val);
  
  // If it looks like a boolean
  if (String(val).toUpperCase() === 'TRUE') return true;
  if (String(val).toUpperCase() === 'FALSE') return false;

  return val;
};

// Main Evaluation Function
export const evaluateFormula = (
  formula: string,
  cells: Record<CellId, CellData>,
  currentCellId?: string
): string => {
  if (!formula.startsWith('=')) return formula;

  // 1. Basic Cycle Detection (Self-Reference)
  // Deep cycle detection is handled by the dependency graph in cell.handlers,
  // but immediate self-reference needs to be caught here.
  if (currentCellId && formula.toUpperCase().includes(currentCellId)) {
      return ERROR_CIRC;
  }

  let processed = formula.substring(1);

  // 2. Pre-process Ranges (e.g. A1:B2 -> [[1,2],[3,4]])
  // We do this before passing to mathjs because mathjs syntax for matrices is specific.
  const rangeRegex = /([A-Z]+[0-9]+):([A-Z]+[0-9]+)/g;
  
  processed = processed.replace(rangeRegex, (match, start, end) => {
      const rangeIds = getRange(start, end);
      
      // Determine dimensions to build 2D Matrix string
      const startCoord = parseCellId(start);
      const endCoord = parseCellId(end);
      
      if (!startCoord || !endCoord) return match;

      const cols = Math.abs(endCoord.col - startCoord.col) + 1;
      const rows = Math.abs(endCoord.row - startCoord.row) + 1;
      
      // Build 2D array representation for MathJS: [[a,b],[c,d]]
      let matrixStr = '[';
      
      // We iterate row by row
      const minRow = Math.min(startCoord.row, endCoord.row);
      const minCol = Math.min(startCoord.col, endCoord.col);

      for (let r = 0; r < rows; r++) {
          matrixStr += '[';
          for (let c = 0; c < cols; c++) {
              const id = getCellId(minCol + c, minRow + r);
              const val = getCellValue(cells, id);
              // Quote strings for safety in eval
              matrixStr += (typeof val === 'string') ? `"${val.replace(/"/g, '\\"')}"` : val;
              if (c < cols - 1) matrixStr += ',';
          }
          matrixStr += ']';
          if (r < rows - 1) matrixStr += ',';
      }
      matrixStr += ']';
      
      return matrixStr;
  });

  // 3. Pre-process Cell References (A1 -> value)
  // We match individual cells that weren't part of a range
  const cellRegex = /\b([A-Z]+[0-9]+)\b/g;
  processed = processed.replace(cellRegex, (match) => {
      if (parseCellId(match)) {
          const val = getCellValue(cells, match);
          return (typeof val === 'string') ? `"${val.replace(/"/g, '\\"')}"` : String(val);
      }
      return match;
  });

  // 4. Handle IF statements to use ternary operators for lazy evaluation logic
  // Replace IF(cond, valTrue, valFalse) with (cond ? valTrue : valFalse)
  // This is a naive regex approach. Nested IFs work because regex matches inside out or we can recurse.
  // Actually, a simple regex replace won't handle nested parenthesis correctly. 
  // For robustness in this scope without a full AST parser, we rely on MathJS 'IF' function defined above,
  // but acknowledge it's eager. 
  // Ideally: Use mathjs expression parsing transform. 
  // OPTIMIZATION: We simply let MathJS handle IF as a function. 
  // It handles most scalar cases fine. Range cases might be heavy.

  // 5. Replace Excel Operators with JS/MathJS equivalents
  // & -> concatenation (MathJS uses `concat` or we can preprocess)
  // MathJS supports matrices, but `&` for string concat isn't default in math expressions usually.
  // We replace `&` with ` + ` for strings if we assume strings, but that risks math addition.
  // Let's rely on `concat(a,b)` function if user uses it, or mathjs might handle `+` for strings.
  // We replace `&` with `+` only if it looks like text, but safer to let user use CONCATENATE or just map & to +
  // Actually, Excel uses `=` for equality, MathJS uses `==`.
  processed = processed.replace(/([^<>])=([^<>])/g, '$1==$2'); // Replace = with == but not >=, <=, !=
  processed = processed.replace(/<>/g, '!='); 
  processed = processed.replace(/&/g, '+'); // Approximation for concatenation

  try {
    if (!processed.trim()) return '';
    
    const result = math.evaluate(processed);
    
    if (result === undefined || result === null) return "";
    if (Number.isNaN(result)) return ERROR_VALUE;
    if (!isFinite(result) && typeof result === 'number') return ERROR_DIV_ZERO;
    
    // Format rounding issues (floating point math)
    if (typeof result === 'number') {
        // Fix 0.1 + 0.2 = 0.30000000004
        return String(Math.round(result * 1000000000) / 1000000000); 
    }
    
    return String(result);
  } catch (e: any) {
    // console.warn("Eval error", e.message, processed);
    if (e.message && e.message.includes("Undefined symbol")) return ERROR_NAME;
    return ERROR_GENERIC;
  }
};

// Dependency extraction remains largely the same
export const extractDependencies = (formula: string): string[] => {
  if (!formula.startsWith('=')) return [];
  const upper = formula.substring(1).toUpperCase();
  const deps = new Set<string>();
  
  // 1. Extract Ranges first
  const rangeRegex = /([A-Z]+[0-9]+):([A-Z]+[0-9]+)/g;
  let match;
  
  while ((match = rangeRegex.exec(upper)) !== null) {
      const range = getRange(match[1], match[2]);
      range.forEach(id => deps.add(id));
  }
  
  // 2. Extract Individual Cells
  const cellRegex = /\b([A-Z]+[0-9]+)\b/g;
  while ((match = cellRegex.exec(upper)) !== null) {
      if (parseCellId(match[0])) {
          deps.add(match[0]);
      }
  }
  
  return Array.from(deps);
};

export const adjustFormulaReferences = (formula: string, rDelta: number, cDelta: number): string => {
    if (!formula.startsWith('=')) return formula;
    
    const refRegex = /(\$?)([A-Z]+)(\$?)([0-9]+)/g;
    
    return formula.replace(refRegex, (match, colAbs, colStr, rowAbs, rowStr) => {
        let col = charToNum(colStr);
        let row = parseInt(rowStr) - 1;
        
        if (!colAbs) col += cDelta;
        if (!rowAbs) row += rDelta;
        
        if (col < 0 || row < 0) return ERROR_REF;
        
        return `${colAbs || ''}${numToChar(col)}${rowAbs || ''}${row + 1}`;
    });
};
