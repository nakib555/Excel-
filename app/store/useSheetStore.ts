
import { create } from 'zustand';
import { temporal } from 'zundo';
import { Sheet, GridSize, CellData, CellStyle } from '../../types';
import { getInitialSheets } from '../state/sheet.initial';
import { INITIAL_ROWS, INITIAL_COLS } from '../constants/grid.constants';
import { updateCellInHF, getCellValueFromHF } from '../../utils';

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
  selectCell: (id: string, isShift?: boolean) => void;
  selectRange: (startId: string, endId: string) => void;
  
  // Computed helpers (optional, can be selectors)
  getActiveSheet: () => Sheet | undefined;
}

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
            
            // Check dependencies to update other cells if needed
            // ( simplified for this step, ideally we get changes from HF )
            
            nextCells[id] = {
              ...(nextCells[id] || { id }),
              raw: rawValue,
              value: calculatedValue
            };

            // Re-evaluate simple dependencies
            // Note: In a full app, HyperFormula returns a list of changed cells.
            Object.keys(nextCells).forEach(cid => {
                if(nextCells[cid].raw.startsWith('=')) {
                    nextCells[cid].value = getCellValueFromHF(cid, activeSheet.name);
                }
            });

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
            
            // Calculate range (simplified logic, real logic handles diagonals)
            let newSelection = [id];
            
            // We use the util `getRange` in the component or here. 
            // For now, assuming single selection if logic is external or simple.
            // If shift, we need the logic. Importing getRange inside store might be circular if not careful.
            
            return {
                ...sheet,
                activeCell: active,
                selectionAnchor: anchor,
                selectionRange: newSelection // Updated by Grid interaction usually
            };
          })
        }));
      },

      selectRange: (startId, endId) => {
         // Logic usually handled by Grid gesture, pushing final range here
      }
    }),
    {
      limit: 50, // Undo history limit
      partialize: (state) => ({ sheets: state.sheets }), // Only track sheets for undo
      equality: (a, b) => a === b // Simple equality
    }
  )
);
