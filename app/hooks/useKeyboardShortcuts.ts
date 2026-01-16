
import { useHotkeys } from 'react-hotkeys-hook';
import { CellId } from '../../types';

interface UseKeyboardShortcutsProps {
    selectionRange: CellId[] | null;
    activeCell: CellId | null;
    cells: any;
    onCellChange: (id: string, val: string) => void;
    onNavigate: (dir: any, isShift: boolean) => void;
    onUndo?: () => void;
    onRedo?: () => void;
}

export const useKeyboardShortcuts = ({ 
    selectionRange, activeCell, cells, onCellChange, onNavigate, onUndo, onRedo 
}: UseKeyboardShortcutsProps) => {
    
    // Delete / Backspace
    useHotkeys(['delete', 'backspace'], (e) => {
        if (selectionRange && selectionRange.length > 0) {
             e.preventDefault();
             selectionRange.forEach(id => onCellChange(id, ''));
        } else if (activeCell) {
             e.preventDefault();
             onCellChange(activeCell, '');
        }
    }, { enableOnFormTags: false }, [selectionRange, activeCell, onCellChange]);

    // Navigation (Arrows)
    useHotkeys('up', (e) => { e.preventDefault(); onNavigate('up', e.shiftKey); }, { enableOnFormTags: false }, [onNavigate]);
    useHotkeys('down', (e) => { e.preventDefault(); onNavigate('down', e.shiftKey); }, { enableOnFormTags: false }, [onNavigate]);
    useHotkeys('left', (e) => { e.preventDefault(); onNavigate('left', e.shiftKey); }, { enableOnFormTags: false }, [onNavigate]);
    useHotkeys('right', (e) => { e.preventDefault(); onNavigate('right', e.shiftKey); }, { enableOnFormTags: false }, [onNavigate]);

    // Tab / Enter
    useHotkeys('tab', (e) => { e.preventDefault(); onNavigate(e.shiftKey ? 'left' : 'right', false); }, { enableOnFormTags: true }, [onNavigate]);
    useHotkeys('enter', (e) => { e.preventDefault(); onNavigate(e.shiftKey ? 'up' : 'down', false); }, { enableOnFormTags: false }, [onNavigate]);

    // Undo / Redo
    useHotkeys('ctrl+z, meta+z', (e) => { e.preventDefault(); onUndo?.(); }, { enableOnFormTags: true }, [onUndo]);
    useHotkeys('ctrl+y, meta+y, ctrl+shift+z, meta+shift+z', (e) => { e.preventDefault(); onRedo?.(); }, { enableOnFormTags: true }, [onRedo]);

    // Checkbox toggle (Space)
    useHotkeys('space', (e) => {
        if (activeCell) {
             const cell = cells[activeCell];
             if (cell && cell.isCheckbox) {
                 e.preventDefault(); 
                 const currentVal = String(cell.value).toUpperCase() === 'TRUE';
                 onCellChange(activeCell, currentVal ? 'FALSE' : 'TRUE');
             }
        }
    }, { enableOnFormTags: false }, [activeCell, cells, onCellChange]);
};
