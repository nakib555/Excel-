
import { create } from 'zustand';
import { temporal } from 'zundo';
import { Sheet, GridSize, CellData, CellStyle } from '../../types';
import { getInitialSheets } from '../state/sheet.initial';
import { INITIAL_ROWS, INITIAL_COLS } from '../constants/grid.constants';
import { updateCellInHF, getCellValueFromHF, parseCellId, getCellId } from '../../utils';

interface SheetState {
  sheets: Sheet[];
  activeSheetId: string;
  gridSize: GridSize;
  zoom: number;
  
  // Actions
  setActiveSheetId: (id: string) => void;
  setGridSize: (size: GridSize) => void;
  setZoom: (zoom: number | ((prev: number) => number)) => void;
  setSheets: (sheets: Sheet[] | ((prev: Sheet[]) => Sheet[])) => void;
  
  // Cell Operations
  updateCell: (id: string, value: string) => void;
  importCSV: (rows: string[][], startCellId: string, overwriteSheet: boolean) => void;
  selectCell: (id: string, isShift?: boolean) => void;
  selectRange: (startId: string, endId: string) => void;
  
  // Computed helpers (optional, can be selectors)
  getActiveSheet: () => Sheet | undefined;
}

// Ensure stable store creation
export const useSheetStore = create<SheetState>()(
  temporal(
    (set, get) => ({
      sheets: getInitialSheets(),
      activeSheetId: 'sheet1',
      gridSize: { rows: INITIAL_ROWS, cols: INITIAL_COLS },
      zoom: 1,

      getActiveSheet: () => {
        const { sheets, activeSheetId } = get();
        return sheets.find((s) => s.id === activeSheetId);
      },

      setActiveSheetId: (id) => set({ activeSheetId: id }),
      
      setGridSize: (size) => set({ gridSize: size }),
      
      setZoom: (zoomArg) => set((state) => ({
        zoom: typeof zoomArg === 'function' ? zoomArg(state.zoom) : zoomArg
      })),

      setSheets: (sheetsArg) => set((state) => ({
        sheets: typeof sheetsArg === 'function' ? sheetsArg(state.sheets) : sheetsArg
      })),

      updateCell: (id, rawValue) => {
        const state = get();
        const activeSheet = state.sheets.find(s => s.id === state.activeSheetId);
        if (!activeSheet) return;

        // 1. Update HyperFormula
        updateCellInHF(id, rawValue, activeSheet.name);
        
        // 2. Calculate Value
        let calculatedValue = rawValue;
        if (rawValue.startsWith('=')) {
            calculatedValue = getCellValueFromHF(id, activeSheet.name);
        }

        // 3. Update Store
        set((prev) => ({
          sheets: prev.sheets.map((sheet) => {
            if (sheet.id !== prev.activeSheetId) return sheet;
            
            const nextCells = { ...sheet.cells };
            
            nextCells[id] = {
              ...(nextCells[id] || { id }),
              raw: rawValue,
              value: calculatedValue
            };

            // Re-evaluate simple dependencies
            Object.keys(nextCells).forEach(cid => {
                if(nextCells[cid].raw.startsWith('=')) {
                    nextCells[cid].value = getCellValueFromHF(cid, activeSheet.name);
                }
            });

            return { ...sheet, cells: nextCells };
          })
        }));
      },

      importCSV: (rows, startCellId, overwriteSheet) => {
        const state = get();
        const activeSheet = state.sheets.find(s => s.id === state.activeSheetId);
        if (!activeSheet) return;

        const startPos = parseCellId(startCellId) || { row: 0, col: 0 };
        const nextCells = overwriteSheet ? {} : { ...activeSheet.cells };

        // 1. Batch update HyperFormula and prepare cell state
        rows.forEach((row, rIdx) => {
          const targetRow = startPos.row + rIdx;
          if (targetRow >= state.gridSize.rows) return;

          row.forEach((value, cIdx) => {
            const targetCol = startPos.col + cIdx;
            if (targetCol >= state.gridSize.cols) return;

            const cellId = getCellId(targetCol, targetRow);
            
            // Update HyperFormula
            updateCellInHF(cellId, value, activeSheet.name);

            // Calculate Value
            let calculatedValue = value;
            if (value.startsWith('=')) {
                calculatedValue = getCellValueFromHF(cellId, activeSheet.name);
            }

            nextCells[cellId] = {
              ...(nextCells[cellId] || { id: cellId }),
              raw: value,
              value: calculatedValue
            };
          });
        });

        // 2. Re-evaluate simple dependencies
        Object.keys(nextCells).forEach(cid => {
            if (nextCells[cid].raw.startsWith('=')) {
                nextCells[cid].value = getCellValueFromHF(cid, activeSheet.name);
            }
        });

        // 3. Update Store
        set((prev) => ({
          sheets: prev.sheets.map((sheet) => {
            if (sheet.id !== prev.activeSheetId) return sheet;
            return { ...sheet, cells: nextCells };
          })
        }));
      },

      selectCell: (id, isShift = false) => {
        set((prev) => ({
          sheets: prev.sheets.map((sheet) => {
            if (sheet.id !== prev.activeSheetId) return sheet;
            
            let anchor = sheet.selectionAnchor;
            let active = sheet.activeCell;
            
            if (!isShift || !anchor) {
                anchor = id;
                active = id;
            }
            
            let newSelection = [id];
            
            return {
                ...sheet,
                activeCell: active,
                selectionAnchor: anchor,
                selectionRange: newSelection
            };
          })
        }));
      },

      selectRange: (startId, endId) => {
         // Placeholder for logic if needed
      }
    }),
    {
      limit: 50,
      partialize: (state) => ({ sheets: state.sheets }),
      equality: (a, b) => a === b
    }
  )
);
