import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Keyboard, 
  Search, 
  X, 
  Sparkles, 
  Navigation, 
  Calculator, 
  Palette, 
  Layers 
} from 'lucide-react';
import { cn } from '../../utils';

interface KeyboardShortcutsDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

interface ShortcutItem {
    keys: string[];
    description: string;
    level: 'common' | 'intermediate' | 'advanced';
    category: 'Essential' | 'Navigation' | 'Formulas' | 'Formatting' | 'Worksheet';
}

const SHORTCUTS: ShortcutItem[] = [
    // Essential
    { keys: ['Ctrl', 'C'], description: 'Copy selected cell(s) or range', level: 'common', category: 'Essential' },
    { keys: ['Ctrl', 'X'], description: 'Cut selected cell(s) or range', level: 'common', category: 'Essential' },
    { keys: ['Ctrl', 'V'], description: 'Paste copied or cut cells', level: 'common', category: 'Essential' },
    { keys: ['Ctrl', 'Z'], description: 'Undo the last action', level: 'common', category: 'Essential' },
    { keys: ['Ctrl', 'Y'], description: 'Redo the last undone action', level: 'common', category: 'Essential' },
    { keys: ['Ctrl', 'A'], description: 'Select the entire active worksheet', level: 'common', category: 'Essential' },
    { keys: ['Ctrl', 'F'], description: 'Open Find & Replace dialog', level: 'common', category: 'Essential' },
    { keys: ['Ctrl', 'H'], description: 'Open Replace dialog mode', level: 'common', category: 'Essential' },
    { keys: ['Delete'], description: 'Clear contents of selected cells', level: 'common', category: 'Essential' },

    // Navigation & Selection
    { keys: ['↑', '↓', '←', '→'], description: 'Move active cell by one cell in any direction', level: 'common', category: 'Navigation' },
    { keys: ['Shift', 'Arrows'], description: 'Extend rectangular cell selection', level: 'common', category: 'Navigation' },
    { keys: ['Home'], description: 'Move to the beginning of the current row (Column A)', level: 'intermediate', category: 'Navigation' },
    { keys: ['Ctrl', 'Home'], description: 'Jump directly to the first cell in worksheet (A1)', level: 'intermediate', category: 'Navigation' },
    { keys: ['Ctrl', 'End'], description: 'Jump to the last used cell in the worksheet', level: 'advanced', category: 'Navigation' },
    { keys: ['Ctrl', 'Arrows'], description: 'Jump to the edge of the current data region', level: 'advanced', category: 'Navigation' },
    { keys: ['Ctrl', 'Shift', 'Arrows'], description: 'Select all cells to the edge of the data region', level: 'advanced', category: 'Navigation' },
    { keys: ['Page Up', '/', 'Down'], description: 'Scroll up or down by one full screen page', level: 'intermediate', category: 'Navigation' },

    // Formulas & Functions
    { keys: ['='], description: 'Start entering an Excel formula', level: 'common', category: 'Formulas' },
    { keys: ['Tab'], description: 'Autocomplete selected formula suggestion with parenthesis', level: 'common', category: 'Formulas' },
    { keys: ['Alt', '='], description: 'Insert AutoSum formula for adjacent numbers', level: 'intermediate', category: 'Formulas' },
    { keys: ['F2'], description: 'Enter edit mode in active cell / formula bar', level: 'intermediate', category: 'Formulas' },
    { keys: ['Enter'], description: 'Commit cell edit and move down', level: 'common', category: 'Formulas' },
    { keys: ['Shift', 'Enter'], description: 'Commit cell edit and move up', level: 'intermediate', category: 'Formulas' },
    { keys: ['Escape'], description: 'Cancel current cell entry or formula edit', level: 'common', category: 'Formulas' },

    // Formatting & Numbers (Advanced)
    { keys: ['Ctrl', '1'], description: 'Open full Format Cells dialog (Numbers, Font, Border)', level: 'advanced', category: 'Formatting' },
    { keys: ['Ctrl', 'B'], description: 'Toggle Bold formatting on selection', level: 'common', category: 'Formatting' },
    { keys: ['Ctrl', 'I'], description: 'Toggle Italic formatting on selection', level: 'common', category: 'Formatting' },
    { keys: ['Ctrl', 'U'], description: 'Toggle Underline formatting on selection', level: 'common', category: 'Formatting' },
    { keys: ['Ctrl', '5'], description: 'Toggle Strikethrough formatting on selection', level: 'advanced', category: 'Formatting' },
    { keys: ['Ctrl', 'Shift', '$'], description: 'Apply Currency formatting with 2 decimal places', level: 'advanced', category: 'Formatting' },
    { keys: ['Ctrl', 'Shift', '%'], description: 'Apply Percentage formatting with no decimals', level: 'advanced', category: 'Formatting' },
    { keys: ['Ctrl', 'Shift', '#'], description: 'Apply Date formatting (Year-Month-Day)', level: 'advanced', category: 'Formatting' },

    // Worksheet & View
    { keys: ['Shift', 'F11'], description: 'Insert a brand new worksheet', level: 'intermediate', category: 'Worksheet' },
    { keys: ['Ctrl', '+'], description: 'Zoom into the worksheet', level: 'common', category: 'Worksheet' },
    { keys: ['Ctrl', '-'], description: 'Zoom out of the worksheet', level: 'common', category: 'Worksheet' },
    { keys: ['Ctrl', '/'], description: 'Open this Keyboard Shortcuts cheat sheet', level: 'common', category: 'Worksheet' },
];

const CATEGORIES = [
    { id: 'All', label: 'All Shortcuts', icon: Sparkles },
    { id: 'Essential', label: 'Essential & Clipboard', icon: Keyboard },
    { id: 'Navigation', label: 'Navigation & Range', icon: Navigation },
    { id: 'Formulas', label: 'Formulas & Functions', icon: Calculator },
    { id: 'Formatting', label: 'Formatting & Numbers', icon: Palette },
    { id: 'Worksheet', label: 'Worksheet & Rows', icon: Layers },
];

const KeyboardShortcutsDialog: React.FC<KeyboardShortcutsDialogProps> = ({ isOpen, onClose }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    // Close on Escape
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    const filteredShortcuts = useMemo(() => {
        return SHORTCUTS.filter(item => {
            const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
            const query = searchQuery.toLowerCase().trim();
            const matchesSearch = !query || 
                item.description.toLowerCase().includes(query) ||
                item.keys.some(k => k.toLowerCase().includes(query)) ||
                item.category.toLowerCase().includes(query);
            return matchesCategory && matchesSearch;
        });
    }, [searchQuery, selectedCategory]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 md:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div 
                className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden ring-1 ring-black/5 animate-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-4 md:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
                            <Keyboard size={20} />
                        </div>
                        <div>
                            <h2 className="text-base md:text-lg font-bold text-slate-800 flex items-center gap-2">
                                Keyboard Shortcuts
                                <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                    Common to Pro Level
                                </span>
                            </h2>
                            <p className="text-xs text-slate-500">
                                Boost spreadsheet productivity with quick key combinations
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                        title="Close"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Search & Categories Bar */}
                <div className="p-3 md:p-4 border-b border-slate-100 bg-white space-y-3">
                    <div className="relative">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search shortcuts by action or key (e.g. copy, formula, sum, range)..."
                            className="w-full pl-10 pr-4 py-2 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 transition-all shadow-2xs"
                            autoFocus
                        />
                    </div>

                    {/* Category Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
                        {CATEGORIES.map(cat => {
                            const Icon = cat.icon;
                            const isSelected = selectedCategory === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={cn(
                                        "px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer",
                                        isSelected 
                                            ? "bg-emerald-600 text-white shadow-xs" 
                                            : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800"
                                    )}
                                >
                                    <Icon size={13} />
                                    <span>{cat.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Shortcuts List Table */}
                <div className="flex-1 overflow-y-auto p-3 md:p-5 scrollbar-thin">
                    {filteredShortcuts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                            {filteredShortcuts.map((item, index) => (
                                <div
                                    key={index}
                                    className="p-3 rounded-xl border border-slate-100 bg-white hover:border-slate-200 hover:shadow-xs transition-all flex items-center justify-between gap-3"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs font-medium text-slate-800 leading-snug">
                                            {item.description}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] text-slate-400 font-sans">
                                                {item.category}
                                            </span>
                                            {item.level === 'advanced' && (
                                                <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                                                    PRO
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Keys Badges */}
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                        {item.keys.map((k, kIdx) => (
                                            <React.Fragment key={kIdx}>
                                                <kbd className="px-2 py-1 bg-slate-50 border border-slate-300 rounded-md font-mono text-[11px] font-semibold text-slate-700 shadow-2xs min-w-[24px] text-center">
                                                    {k}
                                                </kbd>
                                                {kIdx < item.keys.length - 1 && (
                                                    <span className="text-slate-400 text-xs">+</span>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 text-center text-slate-400 text-xs">
                            No shortcuts found matching &ldquo;{searchQuery}&rdquo;
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
                    <span>Press <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px]">Esc</kbd> to close</span>
                    <button
                        onClick={onClose}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors cursor-pointer shadow-xs"
                    >
                        Got it
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default KeyboardShortcutsDialog;
