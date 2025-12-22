
import React, { useCallback } from 'react';
import { Sheet, CellData } from '../../types';
import { parseCellId, numToChar, measureTextWidth } from '../../utils';
import { MIN_ROW_HEIGHT, MIN_COL_WIDTH, DEFAULT_ROW_HEIGHT, DEFAULT_COL_WIDTH } from '../../components/Grid';

interface UseResizeHandlersProps {
    setSheets: React.Dispatch<React.SetStateAction<Sheet[]>>;
    activeSheetId: string;
    activeSheet: Sheet;
    activeCell: string | null;
}

export const useResizeHandlers = ({ setSheets, activeSheetId, activeSheet, activeCell }: UseResizeHandlersProps) => {

    const handleColumnResize = useCallback((colId: string, width: number) => {
        setSheets(prev => prev.map(s => s.id === activeSheetId ? { ...s, columnWidths: { ...s.columnWidths, [colId]: width } } : s));
    }, [activeSheetId, setSheets]);

    const handleRowResize = useCallback((rowIdx: number, height: number) => {
        setSheets(prev => prev.map(s => s.id === activeSheetId ? { ...s, rowHeights: { ...s.rowHeights, [rowIdx]: height } } : s));
    }, [activeSheetId, setSheets]);

    const handleAutoFit = useCallback((colIdx: number) => {
        const colChar = numToChar(colIdx);
        let maxWidth = 0;
        Object.values(activeSheet.cells).forEach((cell: CellData) => {
            const { col } = parseCellId(cell.id)!;
            if (col === colIdx) {
                const style = cell.styleId ? activeSheet.styles[cell.styleId] : {};
                const fontSize = style.fontSize || 13;
                const fontFamily = style.fontFamily || 'Inter';
                const bold = style.bold || false;
                const val = cell.value || '';
                const width = measureTextWidth(val, fontSize, fontFamily, bold);
                if (width > maxWidth) maxWidth = width;
            }
        });
        const padding = 12; 
        const finalWidth = Math.max(MIN_COL_WIDTH, Math.min(500, maxWidth + padding));
        handleColumnResize(colChar, finalWidth);
    }, [activeSheet, handleColumnResize]);

    const resizeActiveRow = useCallback((delta: number) => { 
        if (activeCell) { 
            const { row } = parseCellId(activeCell)!; 
            handleRowResize(row, Math.max(MIN_ROW_HEIGHT, (activeSheet.rowHeights[row] || DEFAULT_ROW_HEIGHT) + delta)); 
        } 
    }, [activeCell, activeSheet.rowHeights, handleRowResize]);

    const resizeActiveCol = useCallback((delta: number) => { 
        if (activeCell) { 
            const { col } = parseCellId(activeCell)!; 
            const c = numToChar(col); 
            handleColumnResize(c, Math.max(MIN_COL_WIDTH, (activeSheet.columnWidths[c] || DEFAULT_COL_WIDTH) + delta)); 
        } 
    }, [activeCell, activeSheet.columnWidths, handleColumnResize]);
  
    const handleResetActiveResize = useCallback(() => { 
        setSheets(prev => prev.map(s => {
            if (s.id !== activeSheetId) return s;
            
            const newColWidths = { ...s.columnWidths };
            const newRowHeights = { ...s.rowHeights };
            
            const targets = s.selectionRange && s.selectionRange.length > 0 
                ? s.selectionRange 
                : (activeCell ? [activeCell] : []);

            targets.forEach(id => {
                const p = parseCellId(id);
                if (p) {
                    const c = numToChar(p.col);
                    delete newColWidths[c];
                    delete newRowHeights[p.row];
                }
            });
            
            return { 
                ...s, 
                columnWidths: newColWidths, 
                rowHeights: newRowHeights 
            };
        })); 
    }, [activeSheetId, activeCell, setSheets]);

    return { 
        handleColumnResize, 
        handleRowResize, 
        handleAutoFit, 
        resizeActiveRow, 
        resizeActiveCol, 
        handleResetActiveResize 
    };
};
