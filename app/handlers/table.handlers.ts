
import React, { useCallback } from 'react';
import { Sheet, Table, CellData, CellStyle } from '../../types';
import { parseCellId, getCellId, getStyleId } from '../../utils';

interface UseTableHandlersProps {
    setSheets: React.Dispatch<React.SetStateAction<Sheet[]>>;
    activeSheetId: string;
    setCreateTableState: React.Dispatch<React.SetStateAction<{ isOpen: boolean, preset: any | null, range: string }>>;
    selectionRange: string[] | null;
    createTableState: { isOpen: boolean, preset: any | null, range: string };
}

export const useTableHandlers = ({ setSheets, activeSheetId, setCreateTableState, selectionRange, createTableState }: UseTableHandlersProps) => {

    const handleFormatAsTable = useCallback((stylePreset: any) => {
        if (!selectionRange) return;
        const start = selectionRange[0];
        const end = selectionRange[selectionRange.length - 1];
        const rangeStr = selectionRange.length > 1 ? `${start}:${end}` : start;
        setCreateTableState({ isOpen: true, preset: stylePreset, range: rangeStr });
    }, [selectionRange, setCreateTableState]);

    const handleCreateTableConfirm = useCallback((rangeStr: string, hasHeaders: boolean) => {
        if (!createTableState.preset) return;
        const preset = createTableState.preset;

        const parts = rangeStr.split(':');
        const startId = parts[0];
        const endId = parts[1] || startId;
        const s = parseCellId(startId);
        const e = parseCellId(endId);
        if (!s || !e) return;

        const minCol = Math.min(s.col, e.col);
        const maxCol = Math.max(s.col, e.col);
        const minRow = Math.min(s.row, e.row);
        const maxRow = Math.max(s.row, e.row);

        setSheets(prev => prev.map(sheet => {
            if (sheet.id !== activeSheetId) return sheet;
            
            const nextCells: Record<string, CellData> = { ...sheet.cells };
            let nextStyles: Record<string, CellStyle> = { ...sheet.styles };
            const nextTables = { ...sheet.tables };

            // Create Table Metadata
            const tableId = `Table${Object.keys(nextTables).length + 1}`;
            const newTable: Table = {
                id: tableId,
                name: tableId,
                range: rangeStr,
                headerRow: hasHeaders,
                totalRow: false,
                bandedRows: true,
                filterButton: hasHeaders,
                style: preset
            };
            nextTables[tableId] = newTable;

            // Apply Styles
            const rangeCells: string[] = [];
            for (let r = minRow; r <= maxRow; r++) {
                for (let c = minCol; c <= maxCol; c++) {
                    rangeCells.push(getCellId(c, r));
                }
            }

            rangeCells.forEach(id => {
                const { row } = parseCellId(id)!;
                const isHeader = hasHeaders && row === minRow;
                const bodyRowIndex = hasHeaders ? row - (minRow + 1) : row - minRow;
                
                const cell = nextCells[id] || { id, raw: '', value: '' };
                const currentStyle = cell.styleId ? (nextStyles[cell.styleId] || {}) : {};
                
                let newStyle = { ...currentStyle };
                let filterButton = false;

                if (isHeader) {
                    newStyle.bg = preset.headerBg;
                    newStyle.color = preset.headerColor;
                    newStyle.bold = true;
                    if (preset.border) {
                        newStyle.borders = { 
                            ...(newStyle.borders || {}),
                            bottom: { style: 'thin', color: preset.border }
                        };
                    }
                    filterButton = true;
                } else if (bodyRowIndex >= 0) {
                    const isOddRow = bodyRowIndex % 2 === 0; 
                    newStyle.bg = isOddRow ? preset.rowOddBg : preset.rowEvenBg;
                    if (preset.rowEvenBg || preset.rowOddBg) {
                        newStyle.color = '#000000';
                    }
                    filterButton = false;
                }

                const res = getStyleId(nextStyles, newStyle);
                nextStyles = res.registry;
                
                nextCells[id] = { 
                    ...cell, 
                    styleId: res.id,
                    filterButton: filterButton ? true : undefined
                };
            });

            return { ...sheet, cells: nextCells, styles: nextStyles, tables: nextTables };
        }));
    }, [activeSheetId, createTableState.preset, setSheets]);

    const handleTableOptionChange = useCallback((tableId: string, key: keyof Table, value: any) => {
        setSheets(prev => prev.map(sheet => {
            if (sheet.id !== activeSheetId) return sheet;
            const table = sheet.tables[tableId];
            if (!table) return sheet;

            const updatedTable = { ...table, [key]: value };
            const nextTables = { ...sheet.tables, [tableId]: updatedTable };
            
            return { ...sheet, tables: nextTables };
        }));
    }, [activeSheetId, setSheets]);

    return { handleFormatAsTable, handleCreateTableConfirm, handleTableOptionChange };
};
