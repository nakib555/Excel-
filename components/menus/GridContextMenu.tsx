import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  Scissors, 
  Copy, 
  Clipboard, 
  Trash2, 
  MessageSquarePlus, 
  SlidersHorizontal, 
  ChevronRight, 
  DollarSign, 
  Percent, 
  Calendar, 
  Hash, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  ArrowUp,
  ArrowDown,
  WrapText,
  FileSpreadsheet
} from 'lucide-react';
import { cn } from '../../utils';

interface GridContextMenuProps {
    x: number;
    y: number;
    cellId: string;
    onClose: () => void;
    onFormatNumber: (format: string) => void;
    onFormatAlignment: (key: 'align' | 'verticalAlign' | 'wrapText', value: any) => void;
    onCut?: () => void;
    onCopy?: () => void;
    onPaste?: () => void;
    onClear?: (type?: 'all' | 'formats' | 'contents') => void;
    onOpenFormatCells?: (tab?: string) => void;
    onInsertComment?: () => void;
}

const GridContextMenu: React.FC<GridContextMenuProps> = ({
    x,
    y,
    cellId,
    onClose,
    onFormatNumber,
    onFormatAlignment,
    onCut,
    onCopy,
    onPaste,
    onClear,
    onOpenFormatCells,
    onInsertComment
}) => {
    const menuRef = useRef<HTMLDivElement>(null);
    const [activeSubMenu, setActiveSubMenu] = useState<'number' | 'align' | null>(null);

    // Global listener to close on outside click or scroll
    useEffect(() => {
        const handleOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        window.addEventListener('mousedown', handleOutside);
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('wheel', onClose, { passive: true });
        return () => {
            window.removeEventListener('mousedown', handleOutside);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('wheel', onClose);
        };
    }, [onClose]);

    // Viewport clamping
    const menuWidth = 230;
    const menuHeight = 350;
    const posX = Math.max(10, Math.min(window.innerWidth - menuWidth - 10, x));
    const posY = Math.max(10, Math.min(window.innerHeight - menuHeight - 10, y));

    return createPortal(
        <div
            ref={menuRef}
            className="fixed z-[9999] bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-2xl rounded-xl ring-1 ring-black/5 p-1 w-[220px] text-xs text-slate-700 animate-in fade-in zoom-in-95 duration-100 select-none"
            style={{ top: posY, left: posX }}
            onClick={(e) => e.stopPropagation()}
            onContextMenu={(e) => e.preventDefault()}
        >
            {/* Header info */}
            <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 flex items-center justify-between">
                <span>Cell {cellId}</span>
                <span className="text-[9px] text-emerald-600 font-medium">Quick Actions</span>
            </div>

            {/* Clipboard section */}
            <div className="py-1">
                <button
                    onClick={() => { onCut?.(); onClose(); }}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors text-left cursor-pointer"
                >
                    <div className="flex items-center gap-2.5">
                        <Scissors size={13} className="text-slate-500" />
                        <span>Cut</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">Ctrl+X</span>
                </button>
                <button
                    onClick={() => { onCopy?.(); onClose(); }}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors text-left cursor-pointer"
                >
                    <div className="flex items-center gap-2.5">
                        <Copy size={13} className="text-slate-500" />
                        <span>Copy</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">Ctrl+C</span>
                </button>
                <button
                    onClick={() => { onPaste?.(); onClose(); }}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors text-left cursor-pointer"
                >
                    <div className="flex items-center gap-2.5">
                        <Clipboard size={13} className="text-slate-500" />
                        <span>Paste</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">Ctrl+V</span>
                </button>
            </div>

            <div className="border-t border-slate-100 my-1" />

            {/* Quick Number Formatting Submenu / Hover Action */}
            <div 
                className="relative"
                onMouseEnter={() => setActiveSubMenu('number')}
                onMouseLeave={() => setActiveSubMenu(null)}
            >
                <button
                    className={cn(
                        "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors text-left cursor-pointer",
                        activeSubMenu === 'number' ? "bg-emerald-50 text-emerald-900 font-semibold" : "hover:bg-slate-100 text-slate-700"
                    )}
                >
                    <div className="flex items-center gap-2.5">
                        <DollarSign size={13} className="text-emerald-600" />
                        <span>Number Format</span>
                    </div>
                    <ChevronRight size={12} className="text-slate-400" />
                </button>

                {activeSubMenu === 'number' && (
                    <div className="absolute left-full top-0 ml-1 bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-2xl rounded-xl ring-1 ring-black/5 p-1 w-[180px] text-xs space-y-0.5 animate-in fade-in zoom-in-95 duration-75">
                        <div className="px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                            Apply Format
                        </div>
                        <button
                            onClick={() => { onFormatNumber('general'); onClose(); }}
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-slate-100 text-slate-700 cursor-pointer text-left"
                        >
                            <span className="font-mono text-[11px] w-4 text-center font-bold text-slate-400">123</span>
                            <span>General</span>
                        </button>
                        <button
                            onClick={() => { onFormatNumber('currency'); onClose(); }}
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-slate-100 text-slate-700 cursor-pointer text-left"
                        >
                            <DollarSign size={13} className="text-emerald-600" />
                            <span>Currency ($)</span>
                        </button>
                        <button
                            onClick={() => { onFormatNumber('percent'); onClose(); }}
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-slate-100 text-slate-700 cursor-pointer text-left"
                        >
                            <Percent size={13} className="text-blue-600" />
                            <span>Percentage (%)</span>
                        </button>
                        <button
                            onClick={() => { onFormatNumber('date'); onClose(); }}
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-slate-100 text-slate-700 cursor-pointer text-left"
                        >
                            <Calendar size={13} className="text-orange-500" />
                            <span>Short Date</span>
                        </button>
                        <button
                            onClick={() => { onFormatNumber('number'); onClose(); }}
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-slate-100 text-slate-700 cursor-pointer text-left"
                        >
                            <Hash size={13} className="text-purple-600" />
                            <span>Number (1,234.00)</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Quick Alignment Submenu / Hover Action */}
            <div 
                className="relative"
                onMouseEnter={() => setActiveSubMenu('align')}
                onMouseLeave={() => setActiveSubMenu(null)}
            >
                <button
                    className={cn(
                        "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors text-left cursor-pointer",
                        activeSubMenu === 'align' ? "bg-emerald-50 text-emerald-900 font-semibold" : "hover:bg-slate-100 text-slate-700"
                    )}
                >
                    <div className="flex items-center gap-2.5">
                        <AlignCenter size={13} className="text-blue-600" />
                        <span>Alignment</span>
                    </div>
                    <ChevronRight size={12} className="text-slate-400" />
                </button>

                {activeSubMenu === 'align' && (
                    <div className="absolute left-full top-0 ml-1 bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-2xl rounded-xl ring-1 ring-black/5 p-1 w-[180px] text-xs space-y-0.5 animate-in fade-in zoom-in-95 duration-75">
                        <div className="px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                            Horizontal
                        </div>
                        <button
                            onClick={() => { onFormatAlignment('align', 'left'); onClose(); }}
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-slate-100 text-slate-700 cursor-pointer text-left"
                        >
                            <AlignLeft size={13} />
                            <span>Align Left</span>
                        </button>
                        <button
                            onClick={() => { onFormatAlignment('align', 'center'); onClose(); }}
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-slate-100 text-slate-700 cursor-pointer text-left"
                        >
                            <AlignCenter size={13} />
                            <span>Center</span>
                        </button>
                        <button
                            onClick={() => { onFormatAlignment('align', 'right'); onClose(); }}
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-slate-100 text-slate-700 cursor-pointer text-left"
                        >
                            <AlignRight size={13} />
                            <span>Align Right</span>
                        </button>

                        <div className="border-t border-slate-100 my-1" />

                        <div className="px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                            Vertical & Text
                        </div>
                        <button
                            onClick={() => { onFormatAlignment('verticalAlign', 'middle'); onClose(); }}
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-slate-100 text-slate-700 cursor-pointer text-left"
                        >
                            <AlignJustify size={13} />
                            <span>Middle Align</span>
                        </button>
                        <button
                            onClick={() => { onFormatAlignment('wrapText', true); onClose(); }}
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-slate-100 text-slate-700 cursor-pointer text-left"
                        >
                            <WrapText size={13} />
                            <span>Wrap Text</span>
                        </button>
                    </div>
                )}
            </div>

            <div className="border-t border-slate-100 my-1" />

            {/* Comment & Clear */}
            <button
                onClick={() => { onInsertComment?.(); onClose(); }}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors text-left cursor-pointer"
            >
                <MessageSquarePlus size={13} className="text-amber-500" />
                <span>Insert Note / Comment</span>
            </button>

            <button
                onClick={() => { onClear?.('contents'); onClose(); }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors text-left cursor-pointer"
            >
                <div className="flex items-center gap-2.5">
                    <Trash2 size={13} className="text-red-500" />
                    <span>Clear Contents</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Del</span>
            </button>

            <div className="border-t border-slate-100 my-1" />

            {/* Format Cells Full Dialog Launch */}
            <button
                onClick={() => { onOpenFormatCells?.('Number'); onClose(); }}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-semibold transition-colors text-left cursor-pointer mt-0.5"
            >
                <div className="flex items-center gap-2">
                    <FileSpreadsheet size={14} className="text-emerald-600" />
                    <span>Format Cells...</span>
                </div>
                <span className="text-[10px] text-emerald-700 font-mono">Ctrl+1</span>
            </button>
        </div>,
        document.body
    );
};

export default GridContextMenu;
