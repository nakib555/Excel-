
import React, { useCallback } from 'react';
import { NavigationDirection } from '../../components/Cell';
import { getNextCellId, parseCellId, getCellId } from '../../utils';
import { MAX_ROWS, MAX_COLS } from '../constants/grid.constants';
import { GridSize } from '../../types';

interface UseNavigationHandlersProps {
    activeCell: string | null;
    gridSize: GridSize;
    handleCellClick: (id: string, isShift: boolean) => void;
    setGridSize: React.Dispatch<React.SetStateAction<GridSize>>;
}

export const useNavigationHandlers = ({ activeCell, gridSize, handleCellClick, setGridSize }: UseNavigationHandlersProps) => {
    
    const handleNavigate = useCallback((direction: NavigationDirection, isShift: boolean) => {
        if (!activeCell) return;
        let dRow = 0, dCol = 0;
        switch (direction) {
            case 'up': dRow = -1; break;
            case 'down': dRow = 1; break;
            case 'left': dCol = -1; break;
            case 'right': dCol = 1; break;
        }
        const nextId = getNextCellId(activeCell, dRow, dCol, gridSize.rows, gridSize.cols);
        if (nextId && nextId !== activeCell) handleCellClick(nextId, isShift);
    }, [activeCell, gridSize, handleCellClick]);

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
