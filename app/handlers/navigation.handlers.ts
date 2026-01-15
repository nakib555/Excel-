
import React, { useCallback } from 'react';
import { NavigationDirection } from '../../components/Cell';
import { getNextCellId, parseCellId, getCellId } from '../../utils';
import { MAX_ROWS, MAX_COLS } from '../constants/grid.constants';
import { GridSize } from '../../types';

interface UseNavigationHandlersProps {
    activeCell: string | null;
    selectionAnchor: string | null;
    selectionRange: string[] | null;
    gridSize: GridSize;
    handleCellClick: (id: string, isShift: boolean) => void;
    setGridSize: React.Dispatch<React.SetStateAction<GridSize>>;
}

export const useNavigationHandlers = ({ 
    activeCell, 
    selectionAnchor, 
    selectionRange,
    gridSize, 
    handleCellClick, 
    setGridSize 
}: UseNavigationHandlersProps) => {
    
    const handleNavigate = useCallback((direction: NavigationDirection, isShift: boolean) => {
        if (!activeCell) return;
        
        let cursorCell = activeCell;

        // If expanding selection with Shift, we need to navigate from the "Lead" cell,
        // not necessarily the Active Cell (which might be the anchor).
        if (isShift && selectionAnchor && selectionRange && selectionRange.length > 0) {
            const first = parseCellId(selectionRange[0]);
            const last = parseCellId(selectionRange[selectionRange.length - 1]);
            const anchor = parseCellId(selectionAnchor);

            if (first && last && anchor) {
                // Determine Lead based on Anchor position relative to bounds
                // Lead is the corner opposite to Anchor in the bounding box
                
                const minR = first.row;
                const minC = first.col;
                const maxR = last.row;
                const maxC = last.col;

                const leadR = (anchor.row === minR) ? maxR : minR;
                const leadC = (anchor.col === minC) ? maxC : minC;
                
                cursorCell = getCellId(leadC, leadR);
            }
        }

        let dRow = 0, dCol = 0;
        switch (direction) {
            case 'up': dRow = -1; break;
            case 'down': dRow = 1; break;
            case 'left': dCol = -1; break;
            case 'right': dCol = 1; break;
        }
        
        const nextId = getNextCellId(cursorCell, dRow, dCol, gridSize.rows, gridSize.cols);
        
        if (nextId && nextId !== cursorCell) {
             handleCellClick(nextId, isShift);
        }
    }, [activeCell, selectionAnchor, selectionRange, gridSize, handleCellClick]);

    const handleNameBoxSubmit = useCallback((input: string) => {
        const coords = parseCellId(input);
        if (!coords) return;
        const { row, col } = coords;
        if (row >= MAX_ROWS || col >= MAX_COLS) {
            alert(`Cell reference out of bounds.`);
            return;
        }
        setGridSize(prev => ({
            rows: Math.max(prev.rows, row + 50), 
            cols: Math.max(prev.cols, col + 20)
        }));
        const id = getCellId(col, row);
        handleCellClick(id, false);
    }, [handleCellClick, setGridSize]);

    return { handleNavigate, handleNameBoxSubmit };
};
