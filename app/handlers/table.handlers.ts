
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

// Helper to recompute and project table formatting into cells and styles
const applyTableStyles = (
    table: Table, 
    sourceCells: Record<string, CellData>, 
    sourceStyles: Record<string, CellStyle>
) => {
    const parts = table.range.split(':');
    const startId = parts[0];
    const endId = parts[1] || startId;
    const s = parseCellId(startId);
    const e = parseCellId(endId);
    if (!s || !e) return { cells: sourceCells, styles: sourceStyles };

    const minCol = Math.min(s.col, e.col);
    const maxCol = Math.max(s.col, e.col);
    const minRow = Math.min(s.row, e.row);
    const maxRow = Math.max(s.row, e.row);
    const preset = table.style;

    const nextCells = { ...sourceCells };
    let nextStyles = { ...sourceStyles };

    for (let r = minRow; r <= maxRow; r++) {
        for (let c = minCol; c <= maxCol; c++) {
            const id = getCellId(c, r);
            const isHeader = table.headerRow && r === minRow;
            const isTotal = table.totalRow && r === maxRow && (!table.headerRow || r > minRow);
            const isFirstCol = table.firstColumn && c === minCol;
            const isLastCol = table.lastColumn && c === maxCol;

            const bodyRowIndex = table.headerRow ? r - (minRow + 1) : r - minRow;
            const bodyColIndex = c - minCol;

            const cell = nextCells[id] || { id, raw: '', value: '' };
            const currentStyle = cell.styleId ? (nextStyles[cell.styleId] || {}) : {};
            let newStyle: CellStyle = { ...currentStyle };
            let showFilter = false;

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
                showFilter = table.filterButton;
            } else if (isTotal) {
                newStyle.bold = true;
                newStyle.borders = {
                    ...(newStyle.borders || {}),
                    top: { style: 'thin', color: '#000000' },
                    bottom: { style: 'double', color: '#000000' }
                };
            } else if (bodyRowIndex >= 0) {
                if (table.bandedColumns) {
                    const isOddCol = bodyColIndex % 2 === 0;
                    newStyle.bg = isOddCol ? preset.rowOddBg : preset.rowEvenBg;
                } else if (table.bandedRows) {
                    const isOddRow = bodyRowIndex % 2 === 0;
                    newStyle.bg = isOddRow ? preset.rowOddBg : preset.rowEvenBg;
                } else {
                    newStyle.bg = '#ffffff';
                }

                if (preset.rowEvenBg || preset.rowOddBg) {
                    newStyle.color = '#000000';
                }

                if (isFirstCol || isLastCol) {
                    newStyle.bold = true;
                } else if (!currentStyle.bold) {
                    newStyle.bold = false;
                }
                showFilter = false;
            }

            const res = getStyleId(nextStyles, newStyle);
            nextStyles = res.registry;
            nextCells[id] = {
                ...cell,
                styleId: res.id,
                filterButton: showFilter ? true : undefined
            };
        }
    }

    return { cells: nextCells, styles: nextStyles };
};

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

        setSheets(prev => prev.map(sheet => {
            if (sheet.id !== activeSheetId) return sheet;

            const nextTables = { ...sheet.tables };
            const tableId = `Table${Object.keys(nextTables).length + 1}`;
            const newTable: Table = {
                id: tableId,
                name: tableId,
                range: rangeStr,
                headerRow: hasHeaders,
                totalRow: false,
                bandedRows: true,
                firstColumn: false,
                lastColumn: false,
                bandedColumns: false,
                filterButton: hasHeaders,
                style: preset
            };
            nextTables[tableId] = newTable;

            const { cells: nextCells, styles: nextStyles } = applyTableStyles(newTable, sheet.cells, sheet.styles);

            return { ...sheet, cells: nextCells, styles: nextStyles, tables: nextTables };
        }));
    }, [activeSheetId, createTableState.preset, setSheets]);

    const handleTableOptionChange = useCallback((tableId: string, key: keyof Table, value: any) => {
        setSheets(prev => prev.map(sheet => {
            if (sheet.id !== activeSheetId) return sheet;
            const table = sheet.tables[tableId];
            if (!table) return sheet;

            const updatedTable: Table = { ...table, [key]: value };
            const nextTables = { ...sheet.tables, [tableId]: updatedTable };

            if (key === 'name') {
                return { ...sheet, tables: nextTables };
            }

            const { cells: nextCells, styles: nextStyles } = applyTableStyles(updatedTable, sheet.cells, sheet.styles);
            return { ...sheet, cells: nextCells, styles: nextStyles, tables: nextTables };
        }));
    }, [activeSheetId, setSheets]);

    return { handleFormatAsTable, handleCreateTableConfirm, handleTableOptionChange };
};
