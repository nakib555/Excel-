
import { HyperFormula } from 'hyperformula';
import { CellData, CellId } from '../types';
import { parseCellId, getCellId } from './helpers';

// Initialize HyperFormula instance
const hfInstance = HyperFormula.buildEmpty({
  licenseKey: 'gpl-v3',
  useArrayArithmetic: true,
  useColumnIndex: false, 
});

const sheetIdMap = new Map<string, number>();

// --- HELPERS ---

export const getSheetId = (sheetName: string = 'Sheet1'): number => {
  // 1. Return cached ID if exists
  if (sheetIdMap.has(sheetName)) {
      return sheetIdMap.get(sheetName)!;
  }

  // 2. Try to get ID from HF (if it exists but not in our map)
  let sheetId = hfInstance.getSheetId(sheetName);

  // 3. If not in HF, create it
  if (sheetId === undefined) {
      try {
          hfInstance.addSheet(sheetName);
          sheetId = hfInstance.getSheetId(sheetName);
      } catch (e) {
          console.warn(`Failed to add sheet "${sheetName}" to HyperFormula:`, e);
          // Fallback: If creation fails, maybe it already exists under a different internal state?
          // Try to get default sheet if specific one fails
          if (hfInstance.countSheets() > 0) {
              const sheets = hfInstance.getSheetNames();
              if (sheets.length > 0) {
                  return hfInstance.getSheetId(sheets[0])!;
              }
          }
      }
  }

  // 4. Cache and return (or default to 0 if catastrophic failure)
  if (sheetId !== undefined) {
      sheetIdMap.set(sheetName, sheetId);
      return sheetId;
  }
  
  // Last resort: ensure at least one sheet exists
  if (hfInstance.countSheets() === 0) {
      hfInstance.addSheet('Sheet1');
      const newId = hfInstance.getSheetId('Sheet1');
      if (newId !== undefined) {
          sheetIdMap.set('Sheet1', newId);
          return newId;
      }
  }

  return 0; // Should rarely happen
};

// --- CORE EVALUATOR ---

export const syncHyperFormula = (cells: Record<CellId, CellData>, sheetName: string = 'Sheet1') => {
  const sheetId = getSheetId(sheetName);
  // Optional: Full sync logic if needed
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
  if (!formula.startsWith('=')) return formula;

  if (currentCellId) {
      // Ensure HF knows about this cell before querying
      updateCellInHF(currentCellId, formula);
      return getCellValueFromHF(currentCellId);
  }

  return "#ERR";
};

export const extractDependencies = (formula: string): string[] => {
  if (!formula.startsWith('=')) return [];
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
    if (!formula.startsWith('=')) return formula;
    
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
