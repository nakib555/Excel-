
import React, { useCallback } from 'react';
import { Sheet, CellData, CellStyle, ValidationRule, CellId } from '../../types';
import { 
    validateCellValue, parseCellId, getCellId, adjustFormulaReferences, getRange, checkIntersect, getStyleId, calculateRotatedDimensions, numToChar,
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
}

export const useCellHandlers = ({ 
    setSheets, activeSheetId, activeSheetName, validations, activeCell, selectionRange, cells, setActiveSheetId 
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
        const id=`sheet${Date.now()}`; 
        const name = `Sheet ${Math.floor(Math.random() * 1000)}`;
        setSheets(p => [...p, { id, name, cells:{}, styles:{}, merges:[], tables:{}, validations:{}, dependentsMap:{}, activeCell:'A1', selectionAnchor:'A1', selectionRange:['A1'], columnWidths:{}, rowHeights:{} }]); 
        setActiveSheetId(id); 
    }, [setSheets, setActiveSheetId]);

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

    return {
        handleCellChange,
        handleCellClick,
        handleSelectionDrag,
        handleBatchSelection,
        handleCellDoubleClick,
        handleAutoSum,
        handleMerge,
        handleFill,
        handleClear,
        handleAddSheet,
        handleDataValidationSave,
        handleSaveComment,
        handleDeleteComment,
        handleMoveCells
    };
};
