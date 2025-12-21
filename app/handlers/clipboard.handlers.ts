
import React, { useCallback, useRef } from 'react';
import { Sheet, CellData, CellId } from '../../types';
import { parseCellId, getCellId } from '../../utils';

interface UseClipboardHandlersProps {
    setSheets: React.Dispatch<React.SetStateAction<Sheet[]>>;
    activeSheetId: string;
    activeCell: string | null;
    selectionRange: string[] | null;
    cells: Record<string, CellData>;
}

export const useClipboardHandlers = ({ setSheets, activeSheetId, activeCell, selectionRange, cells }: UseClipboardHandlersProps) => {
    const clipboardRef = useRef<{ cells: Record<CellId, CellData>; baseRow: number; baseCol: number } | null>(null);

    const handleCopy = useCallback(() => {
        if (selectionRange) {
            const c: Record<string, CellData> = {};
            selectionRange.forEach(id => {
                if (cells[id]) {
                    c[id] = JSON.parse(JSON.stringify(cells[id]));
                }
            });
            const p = parseCellId(selectionRange[0])!;
            clipboardRef.current = { cells: c, baseRow: p.row, baseCol: p.col };
        }
    }, [selectionRange, cells]);

    const handleCut = useCallback(() => {
        handleCopy();
        setSheets(p => p.map(s => {
            if (s.id !== activeSheetId) return s;
            const newCells = { ...s.cells };
            if (selectionRange) {
                selectionRange.forEach(id => {
                    delete newCells[id];
                });
            }
            return { ...s, cells: newCells };
        }));
    }, [handleCopy, activeSheetId, selectionRange, setSheets]);

    const handlePaste = useCallback(() => {
        if (clipboardRef.current && activeCell) {
            const { cells: cc, baseRow, baseCol } = clipboardRef.current;
            const t = parseCellId(activeCell)!;
            
            setSheets(p => p.map(s => {
                if (s.id !== activeSheetId) return s;
                
                const newCells = Object.values(cc).reduce((acc: Record<string, CellData>, c: CellData) => {
                    const o = parseCellId(c.id);
                    if (o) {
                        const nid = getCellId(t.col + (o.col - baseCol), t.row + (o.row - baseRow));
                        acc[nid] = { ...c, id: nid };
                    }
                    return acc;
                }, {} as Record<string, CellData>);

                return Object.assign({}, s, { 
                    cells: Object.assign({}, s.cells, newCells)
                });
            }));
        }
    }, [activeCell, activeSheetId, setSheets]);

    return { handleCopy, handleCut, handlePaste };
};
