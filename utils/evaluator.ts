
import { HyperFormula } from 'hyperformula';
import { CellData, CellId } from '../types';
import { parseCellId } from './helpers';

// Initialize HyperFormula instance
const hfInstance = HyperFormula.buildEmpty({
  licenseKey: 'gpl-v3',
  useArrayArithmetic: true,
  useColumnIndex: false, 
});

// Cache sheet names to IDs to reduce HF lookups
const sheetIdMap = new Map<string, number>();

// --- HELPERS ---

export const getSheetId = (sheetName: string): number => {
  const name = sheetName || 'Sheet1';

  // 1. Check local cache first
  if (sheetIdMap.has(name)) {
      const cachedId = sheetIdMap.get(name);
      if (cachedId !== undefined && hfInstance.doesSheetExist(name)) {
          return cachedId;
      } else {
          sheetIdMap.delete(name); // Invalid cache
      }
  }

  // 2. Check HF directly (Source of Truth)
  try {
      if (hfInstance.doesSheetExist(name)) {
          const id = hfInstance.getSheetId(name);
          if (id !== undefined) {
              sheetIdMap.set(name, id);
              return id;
          }
      }
  } catch (e) {
      console.warn(`HF: Error checking sheet existence for "${name}"`, e);
  }

  // 3. Create it if missing
  try {
      if (!hfInstance.doesSheetExist(name)) {
          hfInstance.addSheet(name);
      }
      const newId = hfInstance.getSheetId(name);
      if (newId !== undefined) {
          sheetIdMap.set(name, newId);
          return newId;
      }
  } catch (e) {
      console.warn(`HF: Failed to add sheet "${name}"`, e);
  }

  // 4. Fallback: Return *any* valid sheet ID or create default
  const sheets = hfInstance.getSheetNames();
  if (sheets.length > 0) {
      const firstId = hfInstance.getSheetId(sheets[0]);
      if (firstId !== undefined) return firstId;
  }

  // 5. Critical Fallback
  try {
      const defaultName = 'Sheet1';
      if (!hfInstance.doesSheetExist(defaultName)) {
          hfInstance.addSheet(defaultName);
      }
      const fallbackId = hfInstance.getSheetId(defaultName);
      if (fallbackId !== undefined) {
          sheetIdMap.set(defaultName, fallbackId);
          return fallbackId;
      }
  } catch (e) {
      console.error("HF: Critical failure to create fallback sheet", e);
  }

  return 0; // Last resort, though 0 might be invalid if not 'Sheet1' in strict mode
};

// --- CORE EVALUATOR ---

export const syncHyperFormula = (cells: Record<CellId, CellData>, sheetName: string) => {
  getSheetId(sheetName);
};

export const updateCellInHF = (id: string, raw: string, sheetName: string) => {
  const sheetId = getSheetId(sheetName);
  const coords = parseCellId(id);
  if (!coords) return;
  
  try {
    const val = raw.startsWith('=') ? raw : isNaN(Number(raw)) ? raw : Number(raw);
    
    // Explicit check for undefined sheetId
    if (sheetId === undefined || sheetId === null) {
        console.error(`HF: Invalid sheetId for ${sheetName}`);
        return;
    }

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
    if (sheetId === undefined) return "#ERR";

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
