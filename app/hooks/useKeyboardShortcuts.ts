
import { useEffect } from 'react';
import { CellId } from '../../types';

interface UseKeyboardShortcutsProps {
    selectionRange: CellId[] | null;
    activeCell: CellId | null;
    cells: any;
    onCellChange: (id: string, val: string) => void;
    onNavigate: (dir: any, isShift: boolean) => void;
}

export const useKeyboardShortcuts = ({ 
    selectionRange, activeCell, cells, onCellChange, onNavigate 
}: UseKeyboardShortcutsProps) => {
    
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
            
            if (e.key === 'Delete' || e.key === 'Backspace') {
                 if (selectionRange && selectionRange.length > 0) {
                     e.preventDefault();
                     selectionRange.forEach(id => {
                         if (onCellChange) onCellChange(id, ''); 
                     });
                 } else if (activeCell) {
                     e.preventDefault();
                     if (onCellChange) onCellChange(activeCell, '');
                 }
            }
            
            if (e.key === ' ' && activeCell) {
                 const cell = cells[activeCell];
                 if (cell && cell.isCheckbox) {
                     e.preventDefault(); 
                     const currentVal = String(cell.value).toUpperCase() === 'TRUE';
                     if (onCellChange) onCellChange(activeCell, currentVal ? 'FALSE' : 'TRUE');
                 }
            }
    
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                 e.preventDefault();
                 const direction = e.key === 'ArrowUp' ? 'up' : 
                                   e.key === 'ArrowDown' ? 'down' :
                                   e.key === 'ArrowLeft' ? 'left' : 'right';
                 onNavigate(direction, e.shiftKey);
            }
            
            if (e.key === 'Tab') {
                e.preventDefault();
                onNavigate(e.shiftKey ? 'left' : 'right', false);
            }
            
            if (e.key === 'Enter') {
                 e.preventDefault();
                 onNavigate(e.shiftKey ? 'up' : 'down', false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
      }, [activeCell, selectionRange, cells, onCellChange, onNavigate]);
};
