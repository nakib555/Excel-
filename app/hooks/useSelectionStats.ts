
import { useMemo } from 'react';
import { CellId, CellData } from '../../types';

export const useSelectionStats = (selectionRange: CellId[] | null, cells: Record<CellId, CellData>) => {
  return useMemo(() => {
    if (!selectionRange || selectionRange.length <= 1) return null;
    let sum = 0, count = 0, numericCount = 0;
    selectionRange.forEach(id => {
        const cell = cells[id];
        if (cell && cell.value) {
            count++;
            const cleanValue = cell.value.replace(/[^0-9.-]+/g,"");
            const num = parseFloat(cleanValue);
            if (!isNaN(num) && cell.value.trim() !== '') {
                sum += num;
                numericCount++;
            }
        }
    });
    return {
        sum,
        count,
        average: numericCount > 0 ? sum / numericCount : 0,
        hasNumeric: numericCount > 0
    };
  }, [selectionRange, cells]);
};
