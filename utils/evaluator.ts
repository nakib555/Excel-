
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

export const getSheetId = (sheetName: string): number => {
  // 1. Return cached ID if exists
  if (sheetIdMap.has(sheetName)) {
      const id = sheetIdMap.get(sheetName)!;
      if (hfInstance.doesSheetExist(sheetName)) return id;
      // If map has it but HF doesn't (reset?), fall through to create
  }

  // 2. Check if HF already knows it by name
  if (hfInstance.doesSheetExist(sheetName)) {
      const id = hfInstance.getSheetId(sheetName);
      if (id !== undefined) {
          sheetIdMap.set(sheetName, id);
          return id;
      }
  }

  // 3. Create it
  try {
      hfInstance.addSheet(sheetName);
      const newId = hfInstance.getSheetId(sheetName);
      if (newId !== undefined) {
          sheetIdMap.set(sheetName, newId);
          return newId;
      }
  } catch (e) {
      console.warn(`Failed to add sheet "${sheetName}" to HyperFormula:`, e);
  }

  // 4. Fallback (should rarely happen)
  if (hfInstance.countSheets() > 0) {
      const sheets = hfInstance.getSheetNames();
      return hfInstance.getSheetId(sheets[0])!;
  }

  // 5. Total fallback
  hfInstance.addSheet('Sheet1');
  const fallbackId = hfInstance.getSheetId('Sheet1')!;
  sheetIdMap.set('Sheet1', fallbackId);
  return fallbackId;
};

// --- CORE EVALUATOR ---

export const syncHyperFormula = (cells: Record<CellId, CellData>, sheetName: string) => {
  // Ensure sheet exists
  getSheetId(sheetName);
};

export const updateCellInHF = (id: string, raw: string, sheetName: string) => {
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

export const getCellValueFromHF = (id: string, sheetName: string): string => {
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
  currentCellId?: string,
  sheetName: string = 'Sheet1'
): string => {
  if (!formula.startsWith('=')) return formula;

  if (currentCellId) {
      // Ensure HF knows about this cell before querying
      updateCellInHF(currentCellId, formula, sheetName);
      return getCellValueFromHF(currentCellId, sheetName);
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
