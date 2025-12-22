
import React, { useCallback } from 'react';
import { Sheet, CellStyle, CellData } from '../../types';
import { getStyleId, parseCellId, calculateRotatedDimensions, numToChar } from '../../utils';
import { DEFAULT_ROW_HEIGHT, DEFAULT_COL_WIDTH } from '../../components/Grid';

interface UseStyleHandlersProps {
    setSheets: React.Dispatch<React.SetStateAction<Sheet[]>>;
    activeSheetId: string;
}

export const useStyleHandlers = ({ setSheets, activeSheetId }: UseStyleHandlersProps) => {
    
    const handleStyleChange = useCallback((key: keyof CellStyle, value: any) => {
        setSheets(prevSheets => prevSheets.map(sheet => {
            if (sheet.id !== activeSheetId || !sheet.selectionRange) return sheet;
            
            const nextCells: Record<string, CellData> = { ...sheet.cells };
            let nextStyles: Record<string, CellStyle> = { ...sheet.styles };
            const nextRowHeights = { ...sheet.rowHeights };
            const nextColWidths = { ...sheet.columnWidths };
            
            sheet.selectionRange.forEach(id => {
                const existing = nextCells[id];
                const cell: CellData = existing ? { ...existing } : { id, raw: '', value: '' };
                
                const styleId = cell.styleId;
                const currentStyle: CellStyle = styleId && nextStyles[styleId] ? nextStyles[styleId] : {};
                
                const newStyle = { ...currentStyle, [key]: value };
                
                // --- Reset mutually exclusive properties ---
                if (key === 'verticalText' && value === true) {
                    newStyle.textRotation = 0;
                } else if (key === 'textRotation' && value !== 0) {
                    newStyle.verticalText = false;
                }

                const res = getStyleId(nextStyles, newStyle);
                nextStyles = res.registry;
                const newStyleId = res.id;
                
                nextCells[id] = {
                    ...cell,
                    styleId: newStyleId
                };

                // --- Auto-Resize Logic ---
                // Trigger resizing if rotation, orientation, font size, OR FORMAT changes.
                // Format changes (e.g. currency, decimals) can significantly change the length/size of vertically/rotated text.
                const resizeTriggers = ['textRotation', 'verticalText', 'fontSize', 'fontFamily', 'bold', 'format', 'decimalPlaces', 'currencySymbol'];
                
                if (resizeTriggers.includes(key as string) && cell.value) {
                    const dims = calculateRotatedDimensions(cell.value, newStyle);
                    
                    if (dims.height > 0 || dims.width > 0) {
                        const { row, col } = parseCellId(id)!;
                        const colChar = numToChar(col);

                        // Update Row Height - Expand to fit, allow shrink to Default
                        const minH = DEFAULT_ROW_HEIGHT;
                        const requiredH = Math.max(minH, dims.height);
                        
                        // We set the row height to the required height (or default if it shrank small)
                        if (requiredH > 0) {
                            nextRowHeights[row] = requiredH;
                        }

                        // Update Column Width
                        const minW = DEFAULT_COL_WIDTH;
                        const requiredW = Math.max(minW, dims.width);
                        
                        if (requiredW > 0) {
                            nextColWidths[colChar] = requiredW;
                        }
                    }
                }
            });
            
            return { ...sheet, cells: nextCells, styles: nextStyles, rowHeights: nextRowHeights, columnWidths: nextColWidths };
        }));
    }, [activeSheetId, setSheets]);

    const handleApplyFullStyle = useCallback((newStyle: CellStyle) => {
        setSheets(prevSheets => prevSheets.map(sheet => {
            if (sheet.id !== activeSheetId || !sheet.selectionRange) return sheet;
            
            const nextCells: Record<string, CellData> = { ...sheet.cells };
            let nextStyles: Record<string, CellStyle> = { ...sheet.styles };
            const nextRowHeights = { ...sheet.rowHeights };
            const nextColWidths = { ...sheet.columnWidths };
            
            sheet.selectionRange.forEach(id => {
                const existing = nextCells[id];
                const cell: CellData = existing ? { ...existing } : { id, raw: '', value: '' };
                
                const styleId = cell.styleId;
                const currentStyle: CellStyle = styleId && nextStyles[styleId] ? nextStyles[styleId] : {};
                
                const mergedStyle: CellStyle = { ...currentStyle, ...newStyle };
                
                // Logic to ensure consistency if full style has conflicting rotation
                if (newStyle.textRotation !== undefined && newStyle.textRotation !== 0) mergedStyle.verticalText = false;
                if (newStyle.verticalText === true) mergedStyle.textRotation = 0;

                const res = getStyleId(nextStyles, mergedStyle);
                nextStyles = res.registry;
                nextCells[id] = { ...cell, styleId: res.id };

                // --- Auto-Resize Logic ---
                if ((mergedStyle.textRotation || mergedStyle.verticalText) && cell.value) {
                    const dims = calculateRotatedDimensions(cell.value, mergedStyle);
                    if (dims.height > 0) {
                        const { row, col } = parseCellId(id)!;
                        const colChar = numToChar(col);

                        const minH = DEFAULT_ROW_HEIGHT;
                        const requiredH = Math.max(minH, dims.height);
                        nextRowHeights[row] = requiredH;

                        const minW = DEFAULT_COL_WIDTH;
                        const requiredW = Math.max(minW, dims.width);
                        nextColWidths[colChar] = requiredW;
                    }
                }
            });
            return { ...sheet, cells: nextCells, styles: nextStyles, rowHeights: nextRowHeights, columnWidths: nextColWidths };
        }));
    }, [activeSheetId, setSheets]);

    return { handleStyleChange, handleApplyFullStyle };
};
    