
import React, { useCallback } from 'react';
import { Sheet, CellId, CellData, CellStyle, ValidationRule } from '../../types';
import { 
    validateCellValue, parseCellId, getCellId, evaluateFormula, extractDependencies, 
    adjustFormulaReferences, getRange, checkIntersect, getStyleId, calculateRotatedDimensions, numToChar 
} from '../../utils';
import { DEFAULT_ROW_HEIGHT, DEFAULT_COL_WIDTH } from '../../components/Grid';

interface UseCellHandlersProps {
    setSheets: React.Dispatch<React.SetStateAction<Sheet[]>>;
    activeSheetId: string;
    validations: Record<CellId, ValidationRule>;
    activeCell: CellId | null;
    selectionRange: CellId[] | null;
    cells: Record<CellId, CellData>;
    setActiveSheetId: (id: string) => void;
}

export const useCellHandlers = ({ 
    setSheets, activeSheetId, validations, activeCell, selectionRange, cells, setActiveSheetId 
}: UseCellHandlersProps) => {

    const handleCellChange = useCallback((id: CellId, rawValue: string) => {
        // Check validation first
        const validationRule = validations[id];
        if (validationRule) {
            const isValid = validateCellValue(rawValue, validationRule);
            if (!isValid) {
                if (validationRule.showErrorMessage !== false) {
                    alert(`${validationRule.errorTitle || 'Invalid Data'}\n${validationRule.errorMessage || 'The value you entered is not valid.'}`);
                }
                return; // Reject change
            }
        }

        setSheets(prevSheets => prevSheets.map(sheet => {
            if (sheet.id !== activeSheetId) return sheet;

            const nextCells = { ...sheet.cells };
            const nextDependents = { ...sheet.dependentsMap };
            let nextTables = { ...sheet.tables };
            let nextRowHeights = { ...sheet.rowHeights };
            let nextColWidths = { ...sheet.columnWidths };

            const oldCell = nextCells[id];
            if (oldCell?.raw.startsWith('=')) {
                const oldDeps = extractDependencies(oldCell.raw);
                oldDeps.forEach(depId => {
                    if (nextDependents[depId]) {
                        nextDependents[depId] = nextDependents[depId].filter(d => d !== id);
                        if (nextDependents[depId].length === 0) delete nextDependents[depId];
                    }
                });
            }

            // Auto-Expand Table Logic
            const { row, col } = parseCellId(id)!;
            let tableModified = false;
            Object.keys(nextTables).forEach(tId => {
                const t = nextTables[tId];
                const parts = t.range.split(':');
                const start = parseCellId(parts[0])!;
                const end = parseCellId(parts[1])!;
                
                // If typing immediately below table within table columns
                if (row === end.row + 1 && col >= start.col && col <= end.col) {
                    const newEnd = getCellId(end.col, end.row + 1);
                    t.range = `${parts[0]}:${newEnd}`;
                    tableModified = true;
                }
            });

            const hasStyle = !!oldCell?.styleId;
            const hasSpecial = oldCell?.isCheckbox || oldCell?.link || oldCell?.comment || oldCell?.filterButton;

            if (!rawValue && !hasStyle && !hasSpecial && !tableModified) {
                delete nextCells[id];
            } else {
                nextCells[id] = {
                ...(nextCells[id] || { id }),
                raw: rawValue,
                value: rawValue 
                } as CellData;
            }

            // Auto-Resize Logic if Rotated OR ShrinkToFit
            const currentCell = nextCells[id];
            if (currentCell) {
                const currentStyle = (currentCell.styleId && sheet.styles[currentCell.styleId]) ? sheet.styles[currentCell.styleId] : {};
                
                // Check rotation OR shrinkToFit
                if (currentStyle.textRotation || currentStyle.verticalText || currentStyle.shrinkToFit) {
                     // Calculate required dimensions
                     const dims = calculateRotatedDimensions(rawValue, currentStyle);
                     
                     // Row Height: Automatically expand to fit, shrink if text shrinks but not below default
                     const minH = DEFAULT_ROW_HEIGHT;
                     const requiredH = Math.max(minH, dims.height);
                     
                     // Only apply if it's actually larger than default OR resizing down
                     if (dims.height > 0) {
                         nextRowHeights[row] = requiredH;
                     }
                     
                     // Col Width
                     const colChar = numToChar(col);
                     const minW = DEFAULT_COL_WIDTH;
                     const requiredW = Math.max(minW, dims.width);
                     
                     if (dims.width > 0) {
                         nextColWidths[colChar] = requiredW;
                     }
                }
            }

            if (rawValue.startsWith('=')) {
                const newDeps = extractDependencies(rawValue);
                newDeps.forEach(depId => {
                    if (!nextDependents[depId]) nextDependents[depId] = [];
                    if (!nextDependents[depId].includes(id)) nextDependents[depId].push(id);
                });
            }

            const updateQueue = [id];
            const visited = new Set<string>(); 

            let head = 0;
            while (head < updateQueue.length) {
                const currentId = updateQueue[head++];
                if (visited.has(currentId) && currentId !== id) continue; 
                visited.add(currentId);
                
                const cell = nextCells[currentId];
                if (!cell) continue;

                if (cell.raw.startsWith('=')) {
                    cell.value = evaluateFormula(cell.raw, nextCells);
                } 

                const dependents = nextDependents[currentId];
                if (dependents) {
                    dependents.forEach(dep => updateQueue.push(dep));
                }
            }

            return { ...sheet, cells: nextCells, dependentsMap: nextDependents, tables: nextTables, rowHeights: nextRowHeights, columnWidths: nextColWidths };
        }));
    }, [activeSheetId, validations, setSheets]);

    const handleCellClick = useCallback((id: CellId, isShift: boolean) => {
        setSheets(prevSheets => prevSheets.map(sheet => {
            if (sheet.id !== activeSheetId) return sheet;
            
            let anchor = sheet.selectionAnchor;
            if (!isShift || !anchor) {
                anchor = id;
            }

            let newSelection = [id];
            if (isShift && anchor) {
                newSelection = getRange(anchor, id);
            }
            
            return { 
                ...sheet, 
                activeCell: id, 
                selectionAnchor: anchor,
                selectionRange: newSelection 
            };
        }));
    }, [activeSheetId, setSheets]);

    const handleSelectionDrag = useCallback((startId: string, endId: string) => {
        setSheets(prev => prev.map(s => {
            if (s.id !== activeSheetId) return s;
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

        const { row: activeRow, col: activeCol } = parseCellId(activeCell)!;
        
        const isNumericCell = (r: number, c: number) => {
            const id = getCellId(c, r);
            const cell = cells[id];
            if (!cell || !cell.value) return false;
            return !isNaN(parseFloat(String(cell.value).replace(/[^0-9.-]+/g,"")));
        };

        if (!selectionRange || selectionRange.length <= 1) {
            let formulaRange = '';
            let startRow = activeRow - 1;
            while (startRow >= 0 && isNumericCell(startRow, activeCol)) {
                startRow--;
            }
            startRow++;

            if (startRow < activeRow) {
                const startId = getCellId(activeCol, startRow);
                const endId = getCellId(activeCol, activeRow - 1);
                formulaRange = `${startId}:${endId}`;
            } else {
                let startCol = activeCol - 1;
                while (startCol >= 0 && isNumericCell(activeRow, startCol)) {
                    startCol--;
                }
                startCol++;

                if (startCol < activeCol) {
                    const startId = getCellId(startCol, activeRow);
                    const endId = getCellId(activeCol - 1, activeRow);
                    formulaRange = `${startId}:${endId}`;
                }
            }
            
            const formula = formulaRange ? `=${funcName}(${formulaRange})` : `=${funcName}()`;
            handleCellChange(activeCell, formula);
        } else {
            const coords = selectionRange.map(id => parseCellId(id)!);
            const minRow = Math.min(...coords.map(c => c.row));
            const maxRow = Math.max(...coords.map(c => c.row));
            const minCol = Math.min(...coords.map(c => c.col));
            const maxCol = Math.max(...coords.map(c => c.col));

            const updates: Record<string, string> = {};
            
            for (let c = minCol; c <= maxCol; c++) {
                const startId = getCellId(c, minRow);
                const endId = getCellId(c, maxRow);
                const targetId = getCellId(c, maxRow + 1);
                updates[targetId] = `=${funcName}(${startId}:${endId})`;
            }

            setSheets(prevSheets => prevSheets.map(sheet => {
                if (sheet.id !== activeSheetId) return sheet;
                const nextCells = { ...sheet.cells };
                Object.entries(updates).forEach(([id, formula]) => {
                    nextCells[id] = { ...(nextCells[id] || { id }), raw: formula, value: formula }; 
                });
                Object.keys(updates).forEach(id => {
                    if (nextCells[id].raw.startsWith('=')) {
                        nextCells[id].value = evaluateFormula(nextCells[id].raw, nextCells);
                    }
                });
                return { ...sheet, cells: nextCells };
            }));
        }
    }, [activeCell, selectionRange, cells, activeSheetId, handleCellChange, setSheets]);

    const handleMerge = useCallback((type: 'center' | 'across' | 'cells' | 'unmerge') => {
        setSheets(prev => prev.map(sheet => {
            if (sheet.id !== activeSheetId || !sheet.selectionRange) return sheet;
            
            const selection = sheet.selectionRange;
            if (selection.length < 2 && type !== 'unmerge') return sheet;

            const nextCells = { ...sheet.cells };
            let nextStyles = { ...sheet.styles };
            let newMerges = [...sheet.merges];

            const performMerge = (rangeStr: string, center: boolean) => {
                newMerges = newMerges.filter(m => !checkIntersect(m, rangeStr));
                newMerges.push(rangeStr);

                const startCellId = rangeStr.split(':')[0];
                if (center) {
                    const cell = nextCells[startCellId] || { id: startCellId, raw: '', value: '' };
                    const currentStyle = cell.styleId ? (nextStyles[cell.styleId] || {}) : {};
                    const newStyle = { ...currentStyle, align: 'center' as const, verticalAlign: 'middle' as const };
                    const res = getStyleId(nextStyles, newStyle as CellStyle);
                    nextStyles = res.registry;
                    nextCells[startCellId] = { ...cell, styleId: res.id };
                }
            };

            if (type === 'unmerge') {
               const start = selection[0];
               const end = selection[selection.length - 1];
               const selRangeStr = `${start}:${end}`;
               // Remove any merge that intersects with selection
               newMerges = newMerges.filter(m => !checkIntersect(m, selRangeStr));
            } else if (type === 'across') {
               const start = parseCellId(selection[0]);
               const end = parseCellId(selection[selection.length - 1]);
               if(start && end) {
                   const minRow = Math.min(start.row, end.row);
                   const maxRow = Math.max(start.row, end.row);
                   const minCol = Math.min(start.col, end.col);
                   const maxCol = Math.max(start.col, end.col);
                   
                   for(let r = minRow; r <= maxRow; r++) {
                       const rowRange = `${getCellId(minCol, r)}:${getCellId(maxCol, r)}`;
                       performMerge(rowRange, false);
                   }
               }
            } else {
               const start = selection[0];
               const end = selection[selection.length - 1];
               const rangeStr = `${start}:${end}`;
               performMerge(rangeStr, type === 'center');
            }

            return { ...sheet, merges: newMerges, cells: nextCells, styles: nextStyles };
        }));
    }, [activeSheetId, setSheets]);

    const handleFill = useCallback((sourceRange: CellId[], targetRange: CellId[]) => {
        if (!sourceRange.length || !targetRange.length) return;

        setSheets(prevSheets => prevSheets.map(sheet => {
            if (sheet.id !== activeSheetId) return sheet;
            
            const nextCells: Record<string, CellData> = { ...sheet.cells };
            const nextValidations = { ...sheet.validations };

            const sourceStart = parseCellId(sourceRange[0])!;
            const sourceEnd = parseCellId(sourceRange[sourceRange.length - 1])!;
            
            const sourceSet = new Set(sourceRange);
            
            targetRange.forEach(tid => {
                if (sourceSet.has(tid)) return; 
                
                const tCoord = parseCellId(tid)!;
                const height = sourceEnd.row - sourceStart.row + 1;
                const width = sourceEnd.col - sourceStart.col + 1;
                
                let rOffset = (tCoord.row - sourceStart.row) % height;
                let cOffset = (tCoord.col - sourceStart.col) % width;
                
                if (rOffset < 0) rOffset += height;
                if (cOffset < 0) cOffset += width;

                const sourceId = getCellId(sourceStart.col + cOffset, sourceStart.row + rOffset);
                const sourceCell = nextCells[sourceId] as CellData | undefined;

                if (!sourceCell) {
                    delete nextCells[tid];
                    return;
                }

                let newValue = sourceCell.raw;
                if (newValue.startsWith('=')) {
                    const rDelta = tCoord.row - (sourceStart.row + rOffset);
                    const cDelta = tCoord.col - (sourceStart.col + cOffset);
                    newValue = adjustFormulaReferences(newValue, rDelta, cDelta);
                } 
                
                const newCell: CellData = {
                    id: tid,
                    raw: newValue,
                    value: newValue, 
                    styleId: sourceCell.styleId, 
                    isCheckbox: sourceCell.isCheckbox,
                    link: sourceCell.link
                };
                
                nextCells[tid] = newCell;
                
                if (nextValidations[sourceId]) {
                    nextValidations[tid] = nextValidations[sourceId];
                }
            });

            Object.keys(nextCells).forEach(k => {
                if (nextCells[k].raw.startsWith('=')) {
                    nextCells[k].value = evaluateFormula(nextCells[k].raw, nextCells);
                }
            });

            return { ...sheet, cells: nextCells, validations: nextValidations, selectionRange: targetRange };
        }));
    }, [activeSheetId, setSheets]);

    const handleClear = useCallback(() => { 
        if (confirm("Clear all?")) setSheets(p => p.map(s => s.id===activeSheetId ? { ...s, cells: {}, tables: {} } : s)); 
    }, [activeSheetId, setSheets]);

    const handleAddSheet = useCallback(() => { 
        const id=`sheet${Date.now()}`; 
        setSheets(p => [...p, { id, name:`Sheet ${p.length+1}`, cells:{}, styles:{}, merges:[], tables:{}, validations:{}, dependentsMap:{}, activeCell:'A1', selectionAnchor:'A1', selectionRange:['A1'], columnWidths:{}, rowHeights:{} }]); 
        setActiveSheetId(id); 
    }, [setSheets, setActiveSheetId]);

    const handleDataValidationSave = useCallback((rule: ValidationRule | null) => {
        setSheets(prev => prev.map(sheet => {
            if (sheet.id !== activeSheetId || !sheet.selectionRange) return sheet;
            const nextValidations = { ...sheet.validations };
            sheet.selectionRange.forEach(id => {
                if (rule) {
                    nextValidations[id] = rule;
                } else {
                    delete nextValidations[id];
                }
            });
            return { ...sheet, validations: nextValidations };
        }));
    }, [activeSheetId, setSheets]);

    const handleSaveComment = useCallback((cellId: string, comment: string) => {
        setSheets(prev => prev.map(sheet => {
            if (sheet.id !== activeSheetId) return sheet;
            const nextCells = { ...sheet.cells };
            
            if (comment.trim()) {
                nextCells[cellId] = {
                    ...(nextCells[cellId] || { id: cellId, raw: '', value: '' }),
                    comment: comment.trim()
                };
            } else {
                if (nextCells[cellId]) {
                    const { comment, ...rest } = nextCells[cellId];
                    if (!rest.raw && !rest.styleId && !rest.isCheckbox && !rest.link && !rest.filterButton) {
                        delete nextCells[cellId];
                    } else {
                        nextCells[cellId] = rest as CellData;
                    }
                }
            }
            return { ...sheet, cells: nextCells };
        }));
    }, [activeSheetId, setSheets]);

    const handleDeleteComment = useCallback(() => {
        if (!activeCell) return;
        handleSaveComment(activeCell, '');
    }, [activeCell, handleSaveComment]);

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
        handleDeleteComment
    };
};
