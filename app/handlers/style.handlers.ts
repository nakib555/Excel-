
import React, { useCallback } from 'react';
import { Sheet, CellStyle, CellData } from '../../types';
import { getStyleId } from '../../utils';

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
            
            sheet.selectionRange.forEach(id => {
                const existing = nextCells[id];
                const cell: CellData = existing ? { ...existing } : { id, raw: '', value: '' };
                
                const styleId = cell.styleId;
                const currentStyle: CellStyle = styleId && nextStyles[styleId] ? nextStyles[styleId] : {};
                
                const newStyle = { ...currentStyle, [key]: value };
                const res = getStyleId(nextStyles, newStyle);
                nextStyles = res.registry;
                const newStyleId = res.id;
                
                nextCells[id] = {
                    ...cell,
                    styleId: newStyleId
                };
            });
            
            return { ...sheet, cells: nextCells, styles: nextStyles };
        }));
    }, [activeSheetId, setSheets]);

    const handleApplyFullStyle = useCallback((newStyle: CellStyle) => {
        setSheets(prevSheets => prevSheets.map(sheet => {
            if (sheet.id !== activeSheetId || !sheet.selectionRange) return sheet;
            
            const nextCells: Record<string, CellData> = { ...sheet.cells };
            let nextStyles: Record<string, CellStyle> = { ...sheet.styles };
            
            sheet.selectionRange.forEach(id => {
                const existing = nextCells[id];
                const cell: CellData = existing ? { ...existing } : { id, raw: '', value: '' };
                
                const styleId = cell.styleId;
                const currentStyle: CellStyle = styleId && nextStyles[styleId] ? nextStyles[styleId] : {};
                
                const mergedStyle: CellStyle = { ...currentStyle, ...newStyle };
                
                const res = getStyleId(nextStyles, mergedStyle);
                nextStyles = res.registry;
                nextCells[id] = { ...cell, styleId: res.id };
            });
            return { ...sheet, cells: nextCells, styles: nextStyles };
        }));
    }, [activeSheetId, setSheets]);

    return { handleStyleChange, handleApplyFullStyle };
};
