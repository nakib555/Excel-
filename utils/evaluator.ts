
import { CellData, CellId } from '../types';
import { parseCellId, getRange, getCellId, numToChar, charToNum } from './helpers';
import { evaluate } from 'mathjs';

// Helper to check if a string is numeric
const isNumeric = (str: string) => {
  if (typeof str !== 'string') return false;
  return !isNaN(parseFloat(str)) && isFinite(Number(str));
};

// Safe evaluation context using mathjs
const evaluateExpression = (expr: string): string => {
  try {
    if (!expr.trim()) return '';
    
    // Evaluate using mathjs which is safer and more powerful than Function()
    const result = evaluate(expr);
    
    if (typeof result === 'number') {
        if (isNaN(result) || !isFinite(result)) return '#ERR';
        // Format to avoid long decimals, similar to Excel general format
        return String(Math.round(result * 100000000) / 100000000); 
    }
    
    return String(result);
  } catch (e) {
    return '#ERR';
  }
};

const getCellValue = (cells: Record<CellId, CellData>, id: CellId): number => {
  const cell = cells[id];
  if (!cell) return 0;
  if (isNumeric(cell.value)) return parseFloat(cell.value);
  return 0; // Treat text as 0 for math operations
};

// Main Evaluation Function
export const evaluateFormula = (
  formula: string,
  cells: Record<CellId, CellData>
): string => {
  if (!formula.startsWith('=')) return formula;

  let processed = formula.substring(1).toUpperCase();

  // 1. Handle Ranges in Functions: SUM(A1:B2) -> SUM([1, 2, 3, 4])
  // We need to support basic functions: SUM, AVG, MIN, MAX, COUNT
  const functions = ['SUM', 'AVERAGE', 'MIN', 'MAX', 'COUNT'];
  
  // Regex to find patterns like SUM(A1:B2)
  // Matches FUNCTION_NAME followed by (RANGE)
  const rangeRegex = new RegExp(`(${functions.join('|')})\\(([A-Z]+[0-9]+):([A-Z]+[0-9]+)\\)`, 'g');

  processed = processed.replace(rangeRegex, (match, fn, start, end) => {
    const rangeIds = getRange(start, end);
    const values = rangeIds.map(id => getCellValue(cells, id));
    
    if (fn === 'SUM') return values.reduce((a, b) => a + b, 0).toString();
    if (fn === 'AVERAGE') return (values.reduce((a, b) => a + b, 0) / (values.length || 1)).toString();
    if (fn === 'MIN') return Math.min(...values).toString();
    if (fn === 'MAX') return Math.max(...values).toString();
    if (fn === 'COUNT') return values.length.toString();
    return '0';
  });

  // 2. Handle Individual Cell References: A1 -> 100
  const cellRegex = /\b([A-Z]+[0-9]+)\b/g;
  
  processed = processed.replace(cellRegex, (match) => {
    if (parseCellId(match)) {
      const val = getCellValue(cells, match);
      return val.toString();
    }
    return match;
  });

  // 3. Evaluate the final math expression
  return evaluateExpression(processed);
};

// New function to extract dependencies from a formula string
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
  const cellRegex = /[A-Z]+[0-9]+/g;
  while ((match = cellRegex.exec(upper)) !== null) {
      if (parseCellId(match[0])) {
          deps.add(match[0]);
      }
  }
  
  return Array.from(deps);
};

/**
 * Adjusts relative cell references in a formula based on row/column deltas.
 * e.g., adjustFormulaReferences("=A1+1", 1, 0) -> "=A2+1"
 */
export const adjustFormulaReferences = (formula: string, rDelta: number, cDelta: number): string => {
    if (!formula.startsWith('=')) return formula;
    
    // Regex to capture cell references with optional absolute ($) markers
    // Groups: 1: $ (col abs), 2: Col (letters), 3: $ (row abs), 4: Row (digits)
    const refRegex = /(\$?)([A-Z]+)(\$?)([0-9]+)/g;
    
    return formula.replace(refRegex, (match, colAbs, colStr, rowAbs, rowStr) => {
        // If it's a known function keyword like SUM, MIN, MAX inside a larger string that accidentally matched simple cell regex logic 
        // (though [A-Z]+[0-9]+ enforces digits, so SUM shouldn't match unless it is SUM1), we are safe.
        
        let col = charToNum(colStr);
        let row = parseInt(rowStr) - 1; // 0-indexed
        
        // Adjust if not absolute
        if (!colAbs) col += cDelta;
        if (!rowAbs) row += rDelta;
        
        // Ensure bounds
        if (col < 0 || row < 0) return '#REF!';
        
        return `${colAbs || ''}${numToChar(col)}${rowAbs || ''}${row + 1}`;
    });
};
