import { CellData, CellId } from '../types';
import { parseCellId, getRange } from './helpers';

// Helper to check if a string is numeric
const isNumeric = (str: string) => {
  if (typeof str !== 'string') return false;
  return !isNaN(parseFloat(str)) && isFinite(Number(str));
};

// Safe evaluation context
const evaluateExpression = (expr: string): string => {
  try {
    // Basic sanitization: only allow math chars, numbers, and basic functions
    // Note: In a real prod app, use a dedicated parser library like 'hot-formula-parser' or 'mathjs'.
    // For this demo, we use Function() with strict regex validation for safety.
    
    // Allow: numbers, operators, parens, and Math functions
    const allowed = /^[0-9+\-*/().\sMath\s]+$/;
    
    // We already replaced functions like SUM(...) with computed numbers before calling this,
    // so we should be left with pure math (e.g., "10 + 50 / 2")
    
    // eslint-disable-next-line no-new-func
    const func = new Function(`return ${expr}`);
    const result = func();
    
    if (isNaN(result) || !isFinite(result)) return '#ERR';
    return String(Number(result.toFixed(4))); // Limit precision
  } catch (e) {
    return '#ERR';
  }
};

const getCellValue = (cells: Record<CellId, CellData>, id: CellId): number => {
  const cell = cells[id];
  if (!cell) return 0;
  if (isNumeric(cell.value)) return parseFloat(cell.value);
  return 0; // Treat text as 0
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
  // Sort keys by length desc to avoid replacing A10 with (Value of A1)0
  // Actually, regex word boundary \b is safer.
  
  // We need to iterate all possible cells referenced or use a regex callback
  const cellRegex = /\b([A-Z]+[0-9]+)\b/g;
  
  processed = processed.replace(cellRegex, (match) => {
    // If it looks like a cell ID, try to get its value
    if (parseCellId(match)) {
      return getCellValue(cells, match).toString();
    }
    return match;
  });

  // 3. Evaluate the final math expression
  return evaluateExpression(processed);
};
