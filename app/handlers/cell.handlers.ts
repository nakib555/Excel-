
import React, { useCallback } from 'react';
import { Sheet, CellId, CellData, CellStyle, ValidationRule } from '../../types';
import { 
    validateCellValue, parseCellId, getCellId, adjustFormulaReferences, getRange, checkIntersect, getStyleId, calculateRotatedDimensions, numToChar,
    updateCellInHF, getCellValueFromHF, extractDependencies
} from '../../utils';
import { DEFAULT_ROW_HEIGHT, DEFAULT_COL_WIDTH } from '../constants/grid.constants';

interface UseCellHandlersProps {
    setSheets: React.Dispatch<React.SetStateAction<Sheet[]>>;
    activeSheetId: string;
    activeSheetName: string; // Added sheet name
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

        // 1. Sync HyperFormula Engine First
        updateCellInHF(id, rawValue, activeSheetName);

        setSheets(prevSheets => prevSheets.map(sheet => {
            if (sheet.id !== activeSheetId) return sheet;

            const nextCells = { ...sheet.cells };
            let nextRowHeights = { ...sheet.rowHeights };
            let nextColWidths = { ...sheet.columnWidths };

            // 2. Update Source Cell in React State
            // We get the calculated value from HF immediately
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

            // 3. Update Dependencies
            // For a robust implementation, we should ask HF which cells changed. 
            // For MVP, we naively re-check visible cells or just rely on HF lazy eval if we were using it for rendering directly.
            // Here we iterate known formula cells in the sheet.
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
            
            // If dragging, we anchor at startId and extend to endId
            return { 
                ...s, 
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
        // Fill logic placeholder
    }, [activeSheetId, setSheets]);

    const handleClear = useCallback(() => { 
        if (confirm("Clear all?")) setSheets(p => p.map(s => s.id===activeSheetId ? { ...s, cells: {}, tables: {} } : s)); 
    }, [activeSheetId, setSheets]);

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
