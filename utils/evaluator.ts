
import { HyperFormula } from 'hyperformula';
import { CellData, CellId } from '../types';
import { parseCellId, getCellId } from './helpers';

// Initialize HyperFormula instance
const hfInstance = HyperFormula.buildEmpty({
  licenseKey: 'gpl-v3',
  useArrayArithmetic: true,
  useColumnIndex: false, // We handle addressing manually if needed, but HF supports A1 natively
});

const sheetIdMap = new Map<string, number>();

// --- HELPERS ---

export const getSheetId = (sheetName: string = 'Sheet1'): number => {
  if (!sheetIdMap.has(sheetName)) {
    // If sheet doesn't exist in HF, add it
    try {
      const newSheetId = hfInstance.countSheets(); // simple incremental ID
      hfInstance.addSheet(sheetName);
      sheetIdMap.set(sheetName, hfInstance.getSheetId(sheetName) as number);
    } catch (e) {
      // Sheet might already exist if re-initializing or complex flow
      const id = hfInstance.getSheetId(sheetName);
      if (id !== undefined) sheetIdMap.set(sheetName, id);
    }
  }
  return sheetIdMap.get(sheetName)!;
};

// --- CORE EVALUATOR ---

/**
 * Initializes or Updates the HyperFormula instance with the current cells.
 * This is efficient - HF handles diffs internally if we design it right, 
 * but for this integration we might batch update.
 */
export const syncHyperFormula = (cells: Record<CellId, CellData>, sheetName: string = 'Sheet1') => {
  const sheetId = getSheetId(sheetName);
  
  // Clear sheet content first to ensure sync (naive approach, better is to diff)
  // Optimization: In a real app, we would only update changed cells.
  // For this integration, we'll try to bulk set if it's the first load, 
  // or use setCellContents for individual updates in the handler.
  
  // For the evaluator.ts interface used by existing app, we primarily expose 
  // `evaluateFormula`. But HF needs the whole world.
  
  // We'll assume the caller of evaluateFormula provides the context or we rely on
  // the singleton state.
  
  // NOTE: This function mimics the previous evaluator's statelessness by 
  // checking if we need to load data. In a perfect world, Redux/State triggers this.
  
  // Convert sparse cells to array for HF (Optional, HF takes array of arrays)
  // Or we can set individual cells.
};

export const updateCellInHF = (id: string, raw: string, sheetName: string = 'Sheet1') => {
  const sheetId = getSheetId(sheetName);
  const coords = parseCellId(id);
  if (!coords) return;
  
  try {
    const val = raw.startsWith('=') ? raw : isNaN(Number(raw)) ? raw : Number(raw);
    hfInstance.setCellContents({ sheetId, col: coords.col, row: coords.row }, [[val]]);
  } catch (e) {
    console.error("HF Update Error", e);
  }
};

export const getCellValueFromHF = (id: string, sheetName: string = 'Sheet1'): string => {
  const sheetId = getSheetId(sheetName);
  const coords = parseCellId(id);
  if (!coords) return "";
  
  try {
    const val = hfInstance.getCellValue({ sheetId, col: coords.col, row: coords.row });
    if (val instanceof Error) return val.message; // HF Error object
    if (val === undefined || val === null) return "";
    return String(val);
  } catch (e) {
    return "#ERR";
  }
};

// Maintain compatibility with existing App signature
export const evaluateFormula = (
  formula: string,
  cells: Record<CellId, CellData>,
  currentCellId?: string
): string => {
  // 1. If it's not a formula, return raw (HF handles this but we short circuit for speed)
  if (!formula.startsWith('=')) return formula;

  // 2. Ensure HF has the current cell's latest formula
  // The existing architecture passes `cells` map to evaluateFormula.
  // We need to ensure HF is in sync. 
  // CRITICAL: Doing a full sync on every cell eval is O(N^2) or worse.
  // We will assume `updateCellInHF` is called by the handler BEFORE this is called,
  // OR we lazily update here.
  
  if (currentCellId) {
      updateCellInHF(currentCellId, formula);
      // We also need to ensure dependencies are up to date.
      // This legacy `evaluateFormula` function assumes statelessness which mismatches HF's stateful nature.
      // Solution: We'll rely on the handler calling `updateCellInHF`.
      // Then we just ask HF for the value.
      return getCellValueFromHF(currentCellId);
  }

  return "#ERR";
};

// Dependency extraction (HF handles this internally, but UI might need it)
export const extractDependencies = (formula: string): string[] => {
  // Simple regex fallback for UI highlighting, or query HF graph
  if (!formula.startsWith('=')) return [];
  const rangeRegex = /([A-Z]+[0-9]+):([A-Z]+[0-9]+)/g;
  const cellRegex = /\b([A-Z]+[0-9]+)\b/g;
  const deps = new Set<string>();
  
  let match;
  const upper = formula.toUpperCase();
  
  while ((match = cellRegex.exec(upper)) !== null) {
      if (parseCellId(match[0])) deps.add(match[0]);
  }
  return Array.from(deps);
};

export const adjustFormulaReferences = (formula: string, rDelta: number, cDelta: number): string => {
    // HyperFormula doesn't expose a simple "adjust string" method easily without moving cells.
    // We keep the regex-based implementation for copy/paste logic in React State.
    if (!formula.startsWith('=')) return formula;
    
    // Import helper from previous file or duplicate logic
    const numToChar = (num: number): string => {
        let s = '';
        let t;
        while (num > -1) {
            t = (num) % 26;
            s = String.fromCharCode(t + 65) + s;
            num = (num - t) / 26 - 1;
        }
        return s;
    };
    
    const charToNum = (s: string): number => {
        let num = 0;
        for (let i = 0; i < s.length; i++) {
            num = num * 26 + (s.charCodeAt(i) - 64);
        }
        return num - 1;
    };

    const refRegex = /(\$?)([A-Z]+)(\$?)([0-9]+)/g;
    
    return formula.replace(refRegex, (match, colAbs, colStr, rowAbs, rowStr) => {
        let col = charToNum(colStr);
        let row = parseInt(rowStr) - 1;
        
        if (!colAbs) col += cDelta;
        if (!rowAbs) row += rDelta;
        
        if (col < 0 || row < 0) return "#REF!";
        
        return `${colAbs || ''}${numToChar(col)}${rowAbs || ''}${row + 1}`;
    });
};
