
import React, { useCallback } from 'react';
import { Sheet, CellData, CellStyle, ValidationRule, CellId } from '../../types';
import { 
    validateCellValue, parseCellId, getCellId, adjustFormulaReferences, getRange, checkIntersect, getStyleId, calculateRotatedDimensions, numToChar, charToNum,
    updateCellInHF, getCellValueFromHF, extractDependencies
} from '../../utils';
import { DEFAULT_ROW_HEIGHT, DEFAULT_COL_WIDTH } from '../constants/grid.constants';

interface UseCellHandlersProps {
    setSheets: React.Dispatch<React.SetStateAction<Sheet[]>>;
    activeSheetId: string;
    activeSheetName: string; 
    validations: Record<CellId, ValidationRule>;
    activeCell: CellId | null;
    selectionRange: CellId[] | null;
    cells: Record<CellId, CellData>;
    setActiveSheetId: (id: string) => void;
    gridSize: { rows: number, cols: number };
}

export const useCellHandlers = ({ 
    setSheets, activeSheetId, activeSheetName, validations, activeCell, selectionRange, cells, setActiveSheetId, gridSize
}: UseCellHandlersProps) => {

    const handleCellChange = useCallback((id: CellId, rawValue: string) => {
        // Validation Logic
        const validationRule = validations[id];
        if (validationRule) {
            const isValid = validateCellValue(rawValue, validationRule);
            if (!isValid) {
                if (validationRule.showErrorMessage !== false) {
                    alert(`${validationRule.errorTitle || 'Invalid Data'}\n${validationRule.errorMessage || 'The value you entered is not valid.'}`);
                }
                return;
            }
        }

        updateCellInHF(id, rawValue, activeSheetName);

        setSheets(prevSheets => prevSheets.map(sheet => {
            if (sheet.id !== activeSheetId) return sheet;

            const nextCells = { ...sheet.cells };
            let nextRowHeights = { ...sheet.rowHeights };
            let nextColWidths = { ...sheet.columnWidths };

            const calculatedValue = getCellValueFromHF(id, activeSheetName);
            
            const oldCell = nextCells[id];
            const hasStyle = !!oldCell?.styleId;
            const hasSpecial = oldCell?.isCheckbox || oldCell?.link || oldCell?.comment || oldCell?.filterButton;

            if (!rawValue && !hasStyle && !hasSpecial) {
                delete nextCells[id];
            } else {
                nextCells[id] = {
                    ...(nextCells[id] || { id }),
                    raw: rawValue,
                    value: calculatedValue 
                } as CellData;
            }

            Object.keys(nextCells).forEach(cellId => {
                if (nextCells[cellId].raw.startsWith('=')) {
                    nextCells[cellId].value = getCellValueFromHF(cellId, activeSheetName);
                }
            });

            return { ...sheet, cells: nextCells, rowHeights: nextRowHeights, columnWidths: nextColWidths };
        }));
    }, [activeSheetId, activeSheetName, validations, setSheets]);

    const handleCellClick = useCallback((id: CellId, isShift: boolean) => {
        setSheets(prevSheets => prevSheets.map(sheet => {
            if (sheet.id !== activeSheetId) return sheet;
            
            // Excel Behavior:
            // If NOT Shift-Clicking, the clicked cell becomes the new Anchor AND Active Cell.
            // If Shift-Clicking, the Anchor remains the same, Active Cell remains the same (usually), but selection expands.
            
            let anchor = sheet.selectionAnchor;
            let active = sheet.activeCell;

            if (!isShift || !anchor) {
                anchor = id;
                active = id;
            }

            // Calculate new range from Anchor -> Clicked ID
            let newSelection = [id];
            if (isShift && anchor) {
                newSelection = getRange(anchor, id);
                // Active cell usually stays as the anchor/lead during shift-select in Excel, 
                // but visually we often just keep the focus where it was or move it. 
                // Standard Excel: Active cell doesn't change on Shift+Click, only selection grows.
                // We keep active cell as is if shift is held.
                active = sheet.activeCell || id; 
            }
            
            return { 
                ...sheet, 
                activeCell: active, 
                selectionAnchor: anchor,
                selectionRange: newSelection 
            };
        }));
    }, [activeSheetId, setSheets]);

    const handleSelectionDrag = useCallback((startId: string, endId: string) => {
        setSheets(prev => prev.map(s => {
            if (s.id !== activeSheetId) return s;
            
            // Dragging implies creating a range from an anchor (startId) to current target (endId)
            // In Excel, dragging usually starts from the active cell/anchor.
            // Here, startId is likely the anchor if we started dragging from active cell.
            return { 
                ...s, 
                activeCell: startId,
                selectionAnchor: startId,
                selectionRange: getRange(startId, endId) 
            };
        }));
    }, [activeSheetId, setSheets]);

    const handleBatchSelection = useCallback((ids: string[]) => {
        if (!ids.length) return;
        setSheets(prev => prev.map(s => {
            if (s.id !== activeSheetId) return s;
            return { 
                ...s, 
                activeCell: ids[0], 
                selectionAnchor: ids[0],
                selectionRange: ids 
            };
        }));
    }, [activeSheetId, setSheets]);

    const handleCellDoubleClick = useCallback((id: CellId) => {
        handleCellClick(id, false);
    }, [handleCellClick]);

    const handleAutoSum = useCallback((funcName: string = 'SUM') => {
        if (!activeCell) return;
        
        let formula = `=${funcName}()`; 
        if (selectionRange && selectionRange.length > 1) {
             const start = selectionRange[0];
             const end = selectionRange[selectionRange.length-1];
             formula = `=${funcName}(${start}:${end})`;
        }

        handleCellChange(activeCell, formula);
    }, [activeCell, selectionRange, handleCellChange]);

    const handleMerge = useCallback((type: 'center' | 'across' | 'cells' | 'unmerge') => {
        setSheets(prev => prev.map(sheet => {
            if (sheet.id !== activeSheetId || !sheet.selectionRange) return sheet;
            const selection = sheet.selectionRange;
            if (selection.length < 2 && type !== 'unmerge') return sheet;

            let newMerges = [...sheet.merges];
            if (type === 'unmerge') {
               const start = selection[0];
               const end = selection[selection.length - 1];
               const selRangeStr = `${start}:${end}`;
               newMerges = newMerges.filter(m => !checkIntersect(m, selRangeStr));
            } else {
               const start = selection[0];
               const end = selection[selection.length - 1];
               const rangeStr = `${start}:${end}`;
               newMerges = newMerges.filter(m => !checkIntersect(m, rangeStr));
               newMerges.push(rangeStr);
            }
            return { ...sheet, merges: newMerges };
        }));
    }, [activeSheetId, setSheets]);

    const handleFill = useCallback((sourceRange: CellId[], targetRange: CellId[]) => {
        if (!sourceRange.length || !targetRange.length) return;

        setSheets(prev => prev.map(sheet => {
            if (sheet.id !== activeSheetId) return sheet;

            const nextCells = { ...sheet.cells };
            
            const sourceStart = parseCellId(sourceRange[0]);
            if (!sourceStart) return sheet;

            targetRange.forEach(targetId => {
                if (sourceRange.includes(targetId)) return;

                const targetPos = parseCellId(targetId);
                if (!targetPos) return;

                const rowOffset = targetPos.row - sourceStart.row;
                const colOffset = targetPos.col - sourceStart.col;
                
                const sourceRows = new Set(sourceRange.map(id => parseCellId(id)!.row)).size;
                const sourceCols = new Set(sourceRange.map(id => parseCellId(id)!.col)).size;
                
                const srcRowIdx = sourceStart.row + (rowOffset % sourceRows);
                const srcColIdx = sourceStart.col + (colOffset % sourceCols);
                const sourceId = getCellId(srcColIdx, srcRowIdx);
                
                const sourceCell = sheet.cells[sourceId];

                if (sourceCell) {
                    let newRaw = sourceCell.raw;
                    
                    if (newRaw.startsWith('=')) {
                         const rDelta = targetPos.row - srcRowIdx;
                         const cDelta = targetPos.col - srcColIdx;
                         newRaw = adjustFormulaReferences(newRaw, rDelta, cDelta);
                    }

                    nextCells[targetId] = {
                        ...sourceCell,
                        id: targetId,
                        raw: newRaw,
                        value: newRaw 
                    };
                    
                    updateCellInHF(targetId, newRaw, activeSheetName);
                } else {
                    if (nextCells[targetId]) {
                        delete nextCells[targetId];
                        updateCellInHF(targetId, '', activeSheetName);
                    }
                }
            });
            
            targetRange.forEach(id => {
                if (nextCells[id]?.raw.startsWith('=')) {
                    nextCells[id].value = getCellValueFromHF(id, activeSheetName);
                }
            });

            return { ...sheet, cells: nextCells };
        }));
    }, [activeSheetId, activeSheetName, setSheets]);

    const handleClear = useCallback((type: 'all' | 'formats' | 'contents' = 'all') => {
        setSheets(prev => prev.map(sheet => {
            if (sheet.id !== activeSheetId) return sheet;
            
            const targets = sheet.selectionRange && sheet.selectionRange.length > 0 
                ? sheet.selectionRange 
                : (sheet.activeCell ? [sheet.activeCell] : []);
            
            if (targets.length === 0) return sheet;

            const nextCells = { ...sheet.cells };
            
            targets.forEach(id => {
                const cell = nextCells[id];
                if (!cell) return;

                if (type === 'all') {
                    delete nextCells[id];
                    updateCellInHF(id, '', activeSheetName); 
                } else if (type === 'contents') {
                    // Keep style, remove value/raw
                    nextCells[id] = { ...cell, value: '', raw: '' };
                    updateCellInHF(id, '', activeSheetName);
                } else if (type === 'formats') {
                    // Remove styleId
                    const { styleId, ...rest } = cell;
                    nextCells[id] = rest;
                    
                    // Cleanup if empty
                    const hasContent = rest.value || rest.raw || rest.comment || rest.link || rest.isCheckbox || rest.filterButton;
                    if (!hasContent) {
                        delete nextCells[id];
                    }
                }
            });

            return { ...sheet, cells: nextCells };
        }));
    }, [activeSheetId, activeSheetName, setSheets]);

    const handleAddSheet = useCallback(() => { 
        setSheets(prev => {
            const id = `sheet${Date.now()}`; 
            let sheetNum = prev.length + 1;
            while (prev.some(s => s.name.toLowerCase() === `sheet ${sheetNum}`.toLowerCase())) {
                sheetNum++;
            }
            const name = `Sheet ${sheetNum}`;
            const newSheet: Sheet = { 
                id, 
                name, 
                cells: {}, 
                styles: {}, 
                merges: [], 
                tables: {}, 
                validations: {}, 
                dependentsMap: {}, 
                activeCell: 'A1', 
                selectionAnchor: 'A1', 
                selectionRange: ['A1'], 
                columnWidths: {}, 
                rowHeights: {} 
            };
            setActiveSheetId(id);
            return [...prev, newSheet];
        });
    }, [setSheets, setActiveSheetId]);

    const handleRenameSheet = useCallback((sheetId: string, newName: string) => {
        const trimmed = newName.trim();
        if (!trimmed) return false;
        
        let success = true;
        setSheets(prev => {
            const exists = prev.some(s => s.id !== sheetId && s.name.toLowerCase() === trimmed.toLowerCase());
            if (exists) {
                alert(`A sheet named "${trimmed}" already exists.`);
                success = false;
                return prev;
            }
            return prev.map(sheet => {
                if (sheet.id !== sheetId) return sheet;
                return { ...sheet, name: trimmed };
            });
        });
        return success;
    }, [setSheets]);

    const handleDeleteSheet = useCallback((sheetId?: string) => {
        const targetId = sheetId || activeSheetId;
        setSheets(prev => {
            if (prev.length <= 1) {
                alert('A workbook must contain at least one visible worksheet.');
                return prev;
            }
            const targetSheet = prev.find(s => s.id === targetId);
            const targetName = targetSheet?.name || 'this sheet';
            const confirmed = window.confirm ? window.confirm(`Are you sure you want to delete "${targetName}"? Data will be permanently deleted.`) : true;
            if (!confirmed) return prev;

            const targetIdx = prev.findIndex(s => s.id === targetId);
            const remaining = prev.filter(s => s.id !== targetId);
            
            if (targetId === activeSheetId) {
                const newIdx = Math.min(targetIdx, remaining.length - 1);
                setActiveSheetId(remaining[newIdx].id);
            }
            return remaining;
        });
    }, [activeSheetId, setActiveSheetId, setSheets]);

    const handleDuplicateSheet = useCallback((sheetId?: string) => {
        const targetId = sheetId || activeSheetId;
        setSheets(prev => {
            const source = prev.find(s => s.id === targetId);
            if (!source) return prev;
            
            const newId = `sheet${Date.now()}`;
            let baseName = `${source.name} (Copy)`;
            let count = 1;
            while (prev.some(s => s.name === baseName)) {
                count++;
                baseName = `${source.name} (Copy ${count})`;
            }

            const copy: Sheet = {
                ...JSON.parse(JSON.stringify(source)),
                id: newId,
                name: baseName
            };
            const targetIdx = prev.findIndex(s => s.id === targetId);
            const next = [...prev];
            next.splice(targetIdx + 1, 0, copy);
            setActiveSheetId(newId);
            return next;
        });
    }, [activeSheetId, setActiveSheetId, setSheets]);

    const handleDataValidationSave = useCallback((rule: ValidationRule | null) => {
        setSheets(prev => prev.map(sheet => {
            if (sheet.id !== activeSheetId || !sheet.selectionRange) return sheet;
            const nextValidations = { ...sheet.validations };
            sheet.selectionRange.forEach(id => {
                if (rule) nextValidations[id] = rule;
                else delete nextValidations[id];
            });
            return { ...sheet, validations: nextValidations };
        }));
    }, [activeSheetId, setSheets]);

    const handleSaveComment = useCallback((cellId: string, comment: string) => {
        setSheets(prev => prev.map(sheet => {
            if (sheet.id !== activeSheetId) return sheet;
            const nextCells = { ...sheet.cells };
            nextCells[cellId] = { ...(nextCells[cellId] || { id: cellId, raw: '', value: '' }), comment: comment.trim() };
            return { ...sheet, cells: nextCells };
        }));
    }, [activeSheetId, setSheets]);

    const handleDeleteComment = useCallback(() => {
        if (!activeCell) return;
        handleSaveComment(activeCell, '');
    }, [activeCell, handleSaveComment]);

    // Handle Drag and Drop Moving Cells
    const handleMoveCells = useCallback((sourceRange: string[], targetStartId: string) => {
        if (!sourceRange.length) return;

        setSheets(prev => prev.map(sheet => {
            if (sheet.id !== activeSheetId) return sheet;

            const nextCells = { ...sheet.cells };
            const nextValidations = { ...sheet.validations };
            
            const sourceStart = parseCellId(sourceRange[0]);
            const targetStart = parseCellId(targetStartId);
            
            if (!sourceStart || !targetStart) return sheet;

            const rowDelta = targetStart.row - sourceStart.row;
            const colDelta = targetStart.col - sourceStart.col;

            // 1. Copy data to temporary storage to handle overlapping ranges safely
            const movedData: Array<{ id: string, cell: CellData, validation?: ValidationRule }> = [];
            
            sourceRange.forEach(srcId => {
                const cell = nextCells[srcId];
                const validation = nextValidations[srcId];
                
                const p = parseCellId(srcId);
                if (p) {
                    const newId = getCellId(p.col + colDelta, p.row + rowDelta);
                    
                    // Adjust formulas
                    let finalCell = cell;
                    if (cell && cell.raw && cell.raw.startsWith('=')) {
                        // For moving, standard excel behavior is usually keeping references absolute 
                        // unless specifically filling. However, adjusting relative refs 
                        // is often expected in modern web grid moves to preserve relative logic.
                        // We will keep raw as is for "Cut/Paste" behavior (Move), 
                        // unlike Fill which increments.
                        // Actually, Cut/Paste usually DOES NOT change formula refs inside the moved cell,
                        // but DOES change refs pointing TO the moved cell (too complex for this MVP).
                        // We will copy raw as is.
                        finalCell = { ...cell };
                    } else if (cell) {
                        finalCell = { ...cell };
                    }

                    if (finalCell) {
                        movedData.push({ id: newId, cell: { ...finalCell, id: newId }, validation });
                    } else {
                        // Mark as empty if source was empty (to overwrite target)
                        movedData.push({ id: newId, cell: null as any, validation: undefined });
                    }
                }
            });

            // 2. Clear Source Range
            sourceRange.forEach(srcId => {
                delete nextCells[srcId];
                delete nextValidations[srcId];
                updateCellInHF(srcId, '', activeSheetName);
            });

            // 3. Write to Target
            const newSelection: string[] = [];
            movedData.forEach(({ id, cell, validation }) => {
                newSelection.push(id);
                if (cell) {
                    nextCells[id] = cell;
                    updateCellInHF(id, cell.raw, activeSheetName);
                } else {
                    delete nextCells[id];
                    updateCellInHF(id, '', activeSheetName);
                }

                if (validation) nextValidations[id] = validation;
                else delete nextValidations[id];
            });

            // Re-evaluate affected cells (simple approach: re-eval all formulas)
            Object.values(nextCells).forEach((c: CellData) => {
                if (c.raw && c.raw.startsWith('=')) {
                    c.value = getCellValueFromHF(c.id, activeSheetName);
                }
            });

            return { 
                ...sheet, 
                cells: nextCells, 
                validations: nextValidations,
                activeCell: newSelection[0],
                selectionAnchor: newSelection[0],
                selectionRange: newSelection
            };
        }));
    }, [activeSheetId, activeSheetName, setSheets]);

    const handleSelectAll = useCallback(() => {
        setSheets(prevSheets => prevSheets.map(sheet => {
            if (sheet.id !== activeSheetId) return sheet;
            const startId = 'A1';
            const endId = getCellId(gridSize.cols - 1, gridSize.rows - 1);
            const allCells = getRange(startId, endId);
            return {
                ...sheet,
                activeCell: 'A1',
                selectionAnchor: 'A1',
                selectionRange: allCells
            };
        }));
    }, [activeSheetId, gridSize, setSheets]);

    const handleInsertRow = useCallback(() => {
        const targetRow = activeCell ? (parseCellId(activeCell)?.row ?? 0) : 0;
        setSheets(prev => prev.map(sheet => {
            if (sheet.id !== activeSheetId) return sheet;
            const nextCells: Record<CellId, CellData> = {};
            Object.values(sheet.cells).forEach(cell => {
                const pos = parseCellId(cell.id);
                if (!pos) return;
                if (pos.row >= targetRow) {
                    const newId = getCellId(pos.col, pos.row + 1);
                    let newRaw = cell.raw;
                    if (newRaw.startsWith('=')) {
                        newRaw = adjustFormulaReferences(newRaw, 1, 0);
                    }
                    nextCells[newId] = { ...cell, id: newId, raw: newRaw };
                    updateCellInHF(newId, newRaw, sheet.name);
                } else {
                    nextCells[cell.id] = cell;
                }
            });

            const nextRowHeights: Record<number, number> = {};
            Object.entries(sheet.rowHeights || {}).forEach(([rStr, h]) => {
                const r = parseInt(rStr, 10);
                if (r >= targetRow) {
                    nextRowHeights[r + 1] = h;
                } else {
                    nextRowHeights[r] = h;
                }
            });

            return {
                ...sheet,
                cells: nextCells,
                rowHeights: nextRowHeights
            };
        }));
    }, [activeCell, activeSheetId, setSheets]);

    const handleInsertColumn = useCallback(() => {
        const targetCol = activeCell ? (parseCellId(activeCell)?.col ?? 0) : 0;
        setSheets(prev => prev.map(sheet => {
            if (sheet.id !== activeSheetId) return sheet;
            const nextCells: Record<CellId, CellData> = {};
            Object.values(sheet.cells).forEach(cell => {
                const pos = parseCellId(cell.id);
                if (!pos) return;
                if (pos.col >= targetCol) {
                    const newId = getCellId(pos.col + 1, pos.row);
                    let newRaw = cell.raw;
                    if (newRaw.startsWith('=')) {
                        newRaw = adjustFormulaReferences(newRaw, 0, 1);
                    }
                    nextCells[newId] = { ...cell, id: newId, raw: newRaw };
                    updateCellInHF(newId, newRaw, sheet.name);
                } else {
                    nextCells[cell.id] = cell;
                }
            });

            const nextColWidths: Record<string, number> = {};
            Object.entries(sheet.columnWidths || {}).forEach(([colChar, w]) => {
                const c = charToNum(colChar);
                if (c >= targetCol) {
                    nextColWidths[numToChar(c + 1)] = w;
                } else {
                    nextColWidths[colChar] = w;
                }
            });

            return {
                ...sheet,
                cells: nextCells,
                columnWidths: nextColWidths
            };
        }));
    }, [activeCell, activeSheetId, setSheets]);

    const handleDeleteRow = useCallback(() => {
        const targetRow = activeCell ? (parseCellId(activeCell)?.row ?? 0) : 0;
        setSheets(prev => prev.map(sheet => {
            if (sheet.id !== activeSheetId) return sheet;
            const nextCells: Record<CellId, CellData> = {};
            Object.values(sheet.cells).forEach(cell => {
                const pos = parseCellId(cell.id);
                if (!pos) return;
                if (pos.row === targetRow) {
                    updateCellInHF(cell.id, '', sheet.name);
                    return; // deleted
                }
                if (pos.row > targetRow) {
                    const newId = getCellId(pos.col, pos.row - 1);
                    let newRaw = cell.raw;
                    if (newRaw.startsWith('=')) {
                        newRaw = adjustFormulaReferences(newRaw, -1, 0);
                    }
                    nextCells[newId] = { ...cell, id: newId, raw: newRaw };
                    updateCellInHF(newId, newRaw, sheet.name);
                } else {
                    nextCells[cell.id] = cell;
                }
            });

            const nextRowHeights: Record<number, number> = {};
            Object.entries(sheet.rowHeights || {}).forEach(([rStr, h]) => {
                const r = parseInt(rStr, 10);
                if (r < targetRow) {
                    nextRowHeights[r] = h;
                } else if (r > targetRow) {
                    nextRowHeights[r - 1] = h;
                }
            });

            return {
                ...sheet,
                cells: nextCells,
                rowHeights: nextRowHeights
            };
        }));
    }, [activeCell, activeSheetId, setSheets]);

    const handleDeleteColumn = useCallback(() => {
        const targetCol = activeCell ? (parseCellId(activeCell)?.col ?? 0) : 0;
        setSheets(prev => prev.map(sheet => {
            if (sheet.id !== activeSheetId) return sheet;
            const nextCells: Record<CellId, CellData> = {};
            Object.values(sheet.cells).forEach(cell => {
                const pos = parseCellId(cell.id);
                if (!pos) return;
                if (pos.col === targetCol) {
                    updateCellInHF(cell.id, '', sheet.name);
                    return; // deleted
                }
                if (pos.col > targetCol) {
                    const newId = getCellId(pos.col - 1, pos.row);
                    let newRaw = cell.raw;
                    if (newRaw.startsWith('=')) {
                        newRaw = adjustFormulaReferences(newRaw, 0, -1);
                    }
                    nextCells[newId] = { ...cell, id: newId, raw: newRaw };
                    updateCellInHF(newId, newRaw, sheet.name);
                } else {
                    nextCells[cell.id] = cell;
                }
            });

            const nextColWidths: Record<string, number> = {};
            Object.entries(sheet.columnWidths || {}).forEach(([colChar, w]) => {
                const c = charToNum(colChar);
                if (c < targetCol) {
                    nextColWidths[colChar] = w;
                } else if (c > targetCol) {
                    nextColWidths[numToChar(c - 1)] = w;
                }
            });

            return {
                ...sheet,
                cells: nextCells,
                columnWidths: nextColWidths
            };
        }));
    }, [activeCell, activeSheetId, setSheets]);

    const handleInsertCells = useCallback(() => {
        if (!selectionRange || selectionRange.length === 0) {
            handleInsertRow();
            return;
        }
        const coords = selectionRange.map(id => parseCellId(id)).filter(Boolean) as { col: number; row: number }[];
        const minRow = Math.min(...coords.map(c => c.row));
        const maxRow = Math.max(...coords.map(c => c.row));
        const numRows = maxRow - minRow + 1;
        const minCol = Math.min(...coords.map(c => c.col));
        const maxCol = Math.max(...coords.map(c => c.col));

        setSheets(prev => prev.map(sheet => {
            if (sheet.id !== activeSheetId) return sheet;
            const nextCells: Record<CellId, CellData> = { ...sheet.cells };
            
            for (let c = minCol; c <= maxCol; c++) {
                for (let r = gridSize.rows - 1; r >= minRow; r--) {
                    const currId = getCellId(c, r);
                    const newId = getCellId(c, r + numRows);
                    if (nextCells[currId]) {
                        nextCells[newId] = { ...nextCells[currId], id: newId };
                        delete nextCells[currId];
                    }
                }
            }
            return { ...sheet, cells: nextCells };
        }));
    }, [selectionRange, handleInsertRow, activeSheetId, gridSize.rows, setSheets]);

    const handleDeleteCells = useCallback(() => {
        if (!selectionRange || selectionRange.length === 0) {
            handleDeleteRow();
            return;
        }
        const coords = selectionRange.map(id => parseCellId(id)).filter(Boolean) as { col: number; row: number }[];
        const minRow = Math.min(...coords.map(c => c.row));
        const maxRow = Math.max(...coords.map(c => c.row));
        const numRows = maxRow - minRow + 1;
        const minCol = Math.min(...coords.map(c => c.col));
        const maxCol = Math.max(...coords.map(c => c.col));

        setSheets(prev => prev.map(sheet => {
            if (sheet.id !== activeSheetId) return sheet;
            const nextCells: Record<CellId, CellData> = { ...sheet.cells };
            
            for (let c = minCol; c <= maxCol; c++) {
                for (let r = minRow; r < gridSize.rows; r++) {
                    const currId = getCellId(c, r);
                    const shiftedId = getCellId(c, r + numRows);
                    if (nextCells[shiftedId]) {
                        nextCells[currId] = { ...nextCells[shiftedId], id: currId };
                    } else {
                        delete nextCells[currId];
                    }
                }
            }
            return { ...sheet, cells: nextCells };
        }));
    }, [selectionRange, handleDeleteRow, activeSheetId, gridSize.rows, setSheets]);

    const handleDirectionalFill = useCallback((direction: 'down' | 'right' | 'up' | 'left') => {
        if (!activeCell) return;
        const range = selectionRange && selectionRange.length > 1 ? selectionRange : [activeCell];
        const coords = range.map(id => parseCellId(id)).filter(Boolean) as { col: number; row: number }[];
        const minCol = Math.min(...coords.map(c => c.col));
        const maxCol = Math.max(...coords.map(c => c.col));
        const minRow = Math.min(...coords.map(c => c.row));
        const maxRow = Math.max(...coords.map(c => c.row));

        if (range.length === 1) {
            let sourceId: CellId | null = null;
            if (direction === 'down' && minRow > 0) sourceId = getCellId(minCol, minRow - 1);
            else if (direction === 'right' && minCol > 0) sourceId = getCellId(minCol - 1, minRow);
            else if (direction === 'up' && minRow < gridSize.rows - 1) sourceId = getCellId(minCol, minRow + 1);
            else if (direction === 'left' && minCol < gridSize.cols - 1) sourceId = getCellId(minCol + 1, minRow);

            if (sourceId) {
                handleFill([sourceId], [activeCell]);
            }
            return;
        }

        const sourceRange: CellId[] = [];
        const targetRange: CellId[] = [];

        if (direction === 'down') {
            for (let c = minCol; c <= maxCol; c++) {
                sourceRange.push(getCellId(c, minRow));
                for (let r = minRow + 1; r <= maxRow; r++) {
                    targetRange.push(getCellId(c, r));
                }
            }
        } else if (direction === 'right') {
            for (let r = minRow; r <= maxRow; r++) {
                sourceRange.push(getCellId(minCol, r));
                for (let c = minCol + 1; c <= maxCol; c++) {
                    targetRange.push(getCellId(c, r));
                }
            }
        } else if (direction === 'up') {
            for (let c = minCol; c <= maxCol; c++) {
                sourceRange.push(getCellId(c, maxRow));
                for (let r = minRow; r < maxRow; r++) {
                    targetRange.push(getCellId(c, r));
                }
            }
        } else if (direction === 'left') {
            for (let r = minRow; r <= maxRow; r++) {
                sourceRange.push(getCellId(maxCol, r));
                for (let c = minCol; c < maxCol; c++) {
                    targetRange.push(getCellId(c, r));
                }
            }
        }

        if (sourceRange.length && targetRange.length) {
            handleFill(sourceRange, targetRange);
        }
    }, [activeCell, selectionRange, gridSize, handleFill]);

    const handleSort = useCallback((order: 'asc' | 'desc') => {
        if (!activeCell) return;
        const activePos = parseCellId(activeCell);
        if (!activePos) return;

        setSheets(prev => prev.map(sheet => {
            if (sheet.id !== activeSheetId) return sheet;

            let minCol = activePos.col;
            let maxCol = activePos.col;
            let minRow = activePos.row;
            let maxRow = activePos.row;

            if (selectionRange && selectionRange.length > 1) {
                const coords = selectionRange.map(id => parseCellId(id)).filter(Boolean) as { col: number; row: number }[];
                minCol = Math.min(...coords.map(c => c.col));
                maxCol = Math.max(...coords.map(c => c.col));
                minRow = Math.min(...coords.map(c => c.row));
                maxRow = Math.max(...coords.map(c => c.row));
            } else {
                const populated = Object.keys(sheet.cells).map(id => parseCellId(id)).filter(Boolean) as { col: number; row: number }[];
                const connected = populated.filter(p => Math.abs(p.col - activePos.col) <= 3 && Math.abs(p.row - activePos.row) <= 15);
                if (connected.length > 0) {
                    minCol = Math.min(...connected.map(c => c.col));
                    maxCol = Math.max(...connected.map(c => c.col));
                    minRow = Math.min(...connected.map(c => c.row));
                    maxRow = Math.max(...connected.map(c => c.row));
                }
            }

            if (maxRow <= minRow) return sheet;

            const sortCol = activePos.col >= minCol && activePos.col <= maxCol ? activePos.col : minCol;

            const rowData: { rowIndex: number; sortVal: string; cells: Record<number, CellData> }[] = [];
            for (let r = minRow; r <= maxRow; r++) {
                const sortCellId = getCellId(sortCol, r);
                const sortVal = sheet.cells[sortCellId]?.value || sheet.cells[sortCellId]?.raw || '';
                const cellsInRow: Record<number, CellData> = {};
                for (let c = minCol; c <= maxCol; c++) {
                    const cid = getCellId(c, r);
                    if (sheet.cells[cid]) {
                        cellsInRow[c] = sheet.cells[cid];
                    }
                }
                rowData.push({ rowIndex: r, sortVal, cells: cellsInRow });
            }

            rowData.sort((a, b) => {
                const numA = parseFloat(a.sortVal.replace(/[^0-9.-]+/g, ''));
                const numB = parseFloat(b.sortVal.replace(/[^0-9.-]+/g, ''));
                const bothNumeric = !isNaN(numA) && !isNaN(numB) && a.sortVal.trim() !== '' && b.sortVal.trim() !== '';

                let cmp = 0;
                if (bothNumeric) {
                    cmp = numA - numB;
                } else {
                    cmp = a.sortVal.localeCompare(b.sortVal);
                }
                return order === 'desc' ? -cmp : cmp;
            });

            const nextCells = { ...sheet.cells };
            for (let i = 0; i < rowData.length; i++) {
                const targetRow = minRow + i;
                const source = rowData[i];
                for (let c = minCol; c <= maxCol; c++) {
                    const targetId = getCellId(c, targetRow);
                    const sourceCell = source.cells[c];
                    if (sourceCell) {
                        nextCells[targetId] = { ...sourceCell, id: targetId };
                        updateCellInHF(targetId, sourceCell.raw, sheet.name);
                    } else {
                        delete nextCells[targetId];
                        updateCellInHF(targetId, '', sheet.name);
                    }
                }
            }

            return { ...sheet, cells: nextCells };
        }));
    }, [activeCell, selectionRange, activeSheetId, setSheets]);

    const handleToggleFilter = useCallback(() => {
        if (!activeCell) return;
        const range = selectionRange && selectionRange.length > 1 ? selectionRange : [activeCell];
        const coords = range.map(id => parseCellId(id)).filter(Boolean) as { col: number; row: number }[];
        const minRow = Math.min(...coords.map(c => c.row));
        const minCol = Math.min(...coords.map(c => c.col));
        const maxCol = Math.max(...coords.map(c => c.col));

        setSheets(prev => prev.map(sheet => {
            if (sheet.id !== activeSheetId) return sheet;
            const nextCells = { ...sheet.cells };
            const firstCell = nextCells[getCellId(minCol, minRow)];
            const enable = !firstCell?.filterButton;

            for (let c = minCol; c <= maxCol; c++) {
                const id = getCellId(c, minRow);
                nextCells[id] = {
                    ...(nextCells[id] || { id, raw: '', value: '' }),
                    filterButton: enable
                };
            }
            return { ...sheet, cells: nextCells };
        }));
    }, [activeCell, selectionRange, activeSheetId, setSheets]);

    const handleClearRules = useCallback((scope: 'selection' | 'sheet') => {
        setSheets(prev => prev.map(sheet => {
            if (sheet.id !== activeSheetId) return sheet;
            const nextCells = { ...sheet.cells };
            const targets = scope === 'selection' 
                ? (selectionRange || (activeCell ? [activeCell] : []))
                : Object.keys(sheet.cells);

            targets.forEach(id => {
                if (nextCells[id]) {
                    const { styleId, ...rest } = nextCells[id];
                    nextCells[id] = rest as CellData;
                }
            });
            return { ...sheet, cells: nextCells };
        }));
    }, [activeCell, selectionRange, activeSheetId, setSheets]);

    const handleApplyCFRule = useCallback((ruleType: string, customVal?: any) => {
        const targets = selectionRange || (activeCell ? [activeCell] : []);
        if (!targets.length) return;

        setSheets(prev => prev.map(sheet => {
            if (sheet.id !== activeSheetId) return sheet;
            const nextCells = { ...sheet.cells };
            let registry = { ...sheet.styles };

            let cfStyle: CellStyle = {};
            if (ruleType === 'greaterThan' || ruleType === 'highlight-red') {
                cfStyle = { bg: '#fee2e2', color: '#991b1b', bold: true };
            } else if (ruleType === 'lessThan' || ruleType === 'highlight-green') {
                cfStyle = { bg: '#dcfce7', color: '#166534', bold: true };
            } else if (ruleType === 'between' || ruleType === 'highlight-yellow') {
                cfStyle = { bg: '#fef9c3', color: '#854d0e' };
            } else if (ruleType === 'equal' || ruleType === 'duplicate') {
                cfStyle = { bg: '#e0e7ff', color: '#3730a3', bold: true };
            } else if (ruleType === 'databar') {
                cfStyle = { bg: '#e0f2fe', color: '#0369a1' };
            } else if (ruleType === 'colorscale') {
                cfStyle = { bg: '#ecfdf5', color: '#065f46' };
            }

            const { id: newStyleId, registry: updatedReg } = getStyleId(registry, cfStyle);
            registry = updatedReg;

            targets.forEach(id => {
                nextCells[id] = {
                    ...(nextCells[id] || { id, raw: '', value: '' }),
                    styleId: newStyleId
                };
            });

            return { ...sheet, cells: nextCells, styles: registry };
        }));
    }, [activeCell, selectionRange, activeSheetId, setSheets]);

    return {
        handleCellChange,
        handleCellClick,
        handleSelectAll,
        handleSelectionDrag,
        handleBatchSelection,
        handleCellDoubleClick,
        handleAutoSum,
        handleMerge,
        handleFill,
        handleDirectionalFill,
        handleInsertRow,
        handleInsertColumn,
        handleInsertCells,
        handleDeleteRow,
        handleDeleteColumn,
        handleDeleteCells,
        handleSort,
        handleToggleFilter,
        handleClearRules,
        handleApplyCFRule,
        handleClear,
        handleAddSheet,
        handleRenameSheet,
        handleDeleteSheet,
        handleDuplicateSheet,
        handleDataValidationSave,
        handleSaveComment,
        handleDeleteComment,
        handleMoveCells
    };
};
