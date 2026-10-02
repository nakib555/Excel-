
import React, { useCallback } from 'react';
import { Sheet, CellStyle, CellData } from '../../types';
import { getStyleId, parseCellId, calculateRotatedDimensions, numToChar } from '../../utils';
import { DEFAULT_ROW_HEIGHT, DEFAULT_COL_WIDTH } from '../constants/grid.constants';

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
                const resizeTriggers = ['textRotation', 'verticalText', 'fontSize', 'fontFamily', 'bold', 'format', 'decimalPlaces', 'currencySymbol', 'shrinkToFit'];
                
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
                if ((mergedStyle.textRotation || mergedStyle.verticalText || mergedStyle.shrinkToFit) && cell.value) {
                    const dims = calculateRotatedDimensions(cell.value, mergedStyle);
                    if (dims.height > 0 || dims.width > 0) {
                        const { row, col } = parseCellId(id)!;
                        const colChar = numToChar(col);

                        const minH = DEFAULT_ROW_HEIGHT;
                        const requiredH = Math.max(minH, dims.height);
                        if (requiredH > 0) nextRowHeights[row] = requiredH;

                        const minW = DEFAULT_COL_WIDTH;
                        const requiredW = Math.max(minW, dims.width);
                        if (requiredW > 0) nextColWidths[colChar] = requiredW;
                    }
                }
            });
            return { ...sheet, cells: nextCells, styles: nextStyles, rowHeights: nextRowHeights, columnWidths: nextColWidths };
        }));
    }, [activeSheetId, setSheets]);

    const handleApplyBorder = useCallback((
        placement: 'bottom' | 'top' | 'left' | 'right' | 'all' | 'outside' | 'thick-outside' | 'none' | 'bottom-double' | 'thick-bottom' | 'top-bottom' | 'top-double-bottom',
        lineStyle: 'thin' | 'medium' | 'thick' | 'double' | 'dashed' = 'thin',
        lineColor: string = '#000000'
    ) => {
        setSheets(prevSheets => prevSheets.map(sheet => {
            if (sheet.id !== activeSheetId) return sheet;

            const targetRange = sheet.selectionRange && sheet.selectionRange.length > 0 
                ? sheet.selectionRange 
                : (sheet.activeCell ? [sheet.activeCell] : []);

            if (targetRange.length === 0) return sheet;

            const nextCells: Record<string, CellData> = { ...sheet.cells };
            let nextStyles: Record<string, CellStyle> = { ...sheet.styles };

            // Determine bounding box
            let minCol = Infinity, maxCol = -Infinity, minRow = Infinity, maxRow = -Infinity;
            targetRange.forEach(id => {
                const parsed = parseCellId(id);
                if (parsed) {
                    minCol = Math.min(minCol, parsed.col);
                    maxCol = Math.max(maxCol, parsed.col);
                    minRow = Math.min(minRow, parsed.row);
                    maxRow = Math.max(maxRow, parsed.row);
                }
            });

            const borderDef = { style: lineStyle, color: lineColor };
            const thickDef = { style: 'thick' as const, color: lineColor };
            const doubleDef = { style: 'double' as const, color: lineColor };

            targetRange.forEach(id => {
                const parsed = parseCellId(id);
                if (!parsed) return;
                const { col, row } = parsed;

                const existing = nextCells[id];
                const cell: CellData = existing ? { ...existing } : { id, raw: '', value: '' };
                const styleId = cell.styleId;
                const currentStyle: CellStyle = styleId && nextStyles[styleId] ? nextStyles[styleId] : {};
                const curBorders = { ...(currentStyle.borders || {}) };

                if (placement === 'none') {
                    delete curBorders.top;
                    delete curBorders.bottom;
                    delete curBorders.left;
                    delete curBorders.right;
                } else if (placement === 'all') {
                    curBorders.top = borderDef;
                    curBorders.bottom = borderDef;
                    curBorders.left = borderDef;
                    curBorders.right = borderDef;
                } else if (placement === 'outside') {
                    if (row === minRow) curBorders.top = borderDef;
                    if (row === maxRow) curBorders.bottom = borderDef;
                    if (col === minCol) curBorders.left = borderDef;
                    if (col === maxCol) curBorders.right = borderDef;
                } else if (placement === 'thick-outside') {
                    if (row === minRow) curBorders.top = thickDef;
                    if (row === maxRow) curBorders.bottom = thickDef;
                    if (col === minCol) curBorders.left = thickDef;
                    if (col === maxCol) curBorders.right = thickDef;
                } else if (placement === 'bottom') {
                    if (row === maxRow) curBorders.bottom = borderDef;
                } else if (placement === 'thick-bottom') {
                    if (row === maxRow) curBorders.bottom = thickDef;
                } else if (placement === 'bottom-double') {
                    if (row === maxRow) curBorders.bottom = doubleDef;
                } else if (placement === 'top') {
                    if (row === minRow) curBorders.top = borderDef;
                } else if (placement === 'left') {
                    if (col === minCol) curBorders.left = borderDef;
                } else if (placement === 'right') {
                    if (col === maxCol) curBorders.right = borderDef;
                } else if (placement === 'top-bottom') {
                    if (row === minRow) curBorders.top = borderDef;
                    if (row === maxRow) curBorders.bottom = borderDef;
                } else if (placement === 'top-double-bottom') {
                    if (row === minRow) curBorders.top = borderDef;
                    if (row === maxRow) curBorders.bottom = doubleDef;
                }

                const newStyle: CellStyle = { ...currentStyle, borders: curBorders };
                const res = getStyleId(nextStyles, newStyle);
                nextStyles = res.registry;
                nextCells[id] = { ...cell, styleId: res.id };
            });

            return { ...sheet, cells: nextCells, styles: nextStyles };
        }));
    }, [activeSheetId, setSheets]);

    return { handleStyleChange, handleApplyFullStyle, handleApplyBorder };
};