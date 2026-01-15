
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
  const name = sheetName || 'Sheet1';

  // 1. Check HF directly first (Source of Truth)
  if (hfInstance.doesSheetExist(name)) {
      const id = hfInstance.getSheetId(name);
      if (id !== undefined) {
          sheetIdMap.set(name, id);
          return id;
      }
  }

  // 2. Create it if missing
  try {
      hfInstance.addSheet(name);
      const newId = hfInstance.getSheetId(name);
      if (newId !== undefined) {
          sheetIdMap.set(name, newId);
          return newId;
      }
  } catch (e) {
      console.warn(`HF: Failed to add sheet "${name}"`, e);
  }

  // 3. Fallback: Return *any* valid sheet ID
  const sheets = hfInstance.getSheetNames();
  if (sheets.length > 0) {
      const firstId = hfInstance.getSheetId(sheets[0]);
      if (firstId !== undefined) return firstId;
  }

  // 4. Critical Fallback: Create a default sheet if absolutely nothing exists
  try {
      if (!hfInstance.doesSheetExist('Sheet1')) {
          hfInstance.addSheet('Sheet1');
      }
      const fallbackId = hfInstance.getSheetId('Sheet1');
      if (fallbackId !== undefined) return fallbackId;
  } catch (e) {
      console.error("HF: Critical failure to create fallback sheet", e);
  }

  // Should technically never reach here if HF is working
  return 0;
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
    // Ensure sheetId is valid before calling setCellContents
    if (sheetId !== undefined) {
        hfInstance.setCellContents({ sheetId, col: coords.col, row: coords.row }, [[val]]);
    } else {
        console.error(`HF: Invalid sheetId for ${sheetName}`);
    }
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
