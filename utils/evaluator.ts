import { CellData, CellId } from '../types';
import { parseCellId, getRange } from './helpers';
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