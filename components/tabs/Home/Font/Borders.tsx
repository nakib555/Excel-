import React, { useState, useRef, useEffect, memo } from 'react';
import { createPortal } from 'react-dom';
import { 
  Square, 
  Grid, 
  BorderAll, 
  BorderBottom, 
  BorderTop, 
  BorderLeft, 
  BorderRight, 
  BorderOuter, 
  Check, 
  ChevronDown, 
  Palette, 
  Minus 
} from 'lucide-react';
import { cn } from '../../../../utils';
import { Tooltip } from '../../../shared';

export type BorderPlacement = 
    | 'bottom' 
    | 'top' 
    | 'left' 
    | 'right' 
    | 'all' 
    | 'outside' 
    | 'thick-outside' 
    | 'none' 
    | 'bottom-double' 
    | 'thick-bottom' 
    | 'top-bottom' 
    | 'top-double-bottom';

export type LineStyle = 'thin' | 'medium' | 'thick' | 'double' | 'dashed';

interface BordersProps {
    onApplyBorder?: (placement: BorderPlacement, lineStyle: LineStyle, lineColor: string) => void;
}

const COLOR_SWATCHES = [
    '#000000', '#475569', '#dc2626', '#ea580c', '#d97706', 
    '#16a34a', '#0284c7', '#2563eb', '#7c3aed', '#db2777'
];

const LINE_STYLES: { id: LineStyle; label: string; preview: React.ReactNode }[] = [
    { 
        id: 'thin', 
        label: 'Thin', 
        preview: <div className="w-16 h-[1px] bg-slate-800" /> 
    },
    { 
        id: 'medium', 
        label: 'Medium', 
        preview: <div className="w-16 h-[2px] bg-slate-800" /> 
    },
    { 
        id: 'thick', 
        label: 'Thick', 
        preview: <div className="w-16 h-[3px] bg-slate-800" /> 
    },
    { 
        id: 'double', 
        label: 'Double', 
        preview: (
            <div className="w-16 flex flex-col gap-[1px]">
                <div className="w-full h-[1px] bg-slate-800" />
                <div className="w-full h-[1px] bg-slate-800" />
            </div>
        )
    },
    { 
        id: 'dashed', 
        label: 'Dashed', 
        preview: <div className="w-16 border-t-2 border-dashed border-slate-800" /> 
    }
];

const BORDER_PRESETS: { id: BorderPlacement; label: string; icon: React.ReactNode; group: 'basic' | 'outer' | 'advanced' }[] = [
    { id: 'bottom', label: 'Bottom Border', icon: <div className="w-4 h-4 border border-dashed border-slate-300 border-b-slate-900 border-b-2" />, group: 'basic' },
    { id: 'top', label: 'Top Border', icon: <div className="w-4 h-4 border border-dashed border-slate-300 border-t-slate-900 border-t-2" />, group: 'basic' },
    { id: 'left', label: 'Left Border', icon: <div className="w-4 h-4 border border-dashed border-slate-300 border-l-slate-900 border-l-2" />, group: 'basic' },
    { id: 'right', label: 'Right Border', icon: <div className="w-4 h-4 border border-dashed border-slate-300 border-r-slate-900 border-r-2" />, group: 'basic' },
    { id: 'none', label: 'No Border', icon: <div className="w-4 h-4 border border-dashed border-slate-300" />, group: 'basic' },
    { id: 'all', label: 'All Borders', icon: <div className="w-4 h-4 grid grid-cols-2 grid-rows-2 border border-slate-900"><div className="border border-slate-900" /><div className="border border-slate-900" /><div className="border border-slate-900" /><div className="border border-slate-900" /></div>, group: 'basic' },
    
    { id: 'outside', label: 'Outside Borders', icon: <div className="w-4 h-4 border-2 border-slate-900" />, group: 'outer' },
    { id: 'thick-outside', label: 'Thick Outside Borders', icon: <div className="w-4 h-4 border-[3px] border-slate-900" />, group: 'outer' },
    { id: 'thick-bottom', label: 'Thick Bottom Border', icon: <div className="w-4 h-4 border border-dashed border-slate-300 border-b-slate-900 border-b-[3px]" />, group: 'outer' },
    { id: 'bottom-double', label: 'Bottom Double Border', icon: <div className="w-4 h-4 border border-dashed border-slate-300 border-b-slate-900 border-b-[3px] border-b-double" />, group: 'outer' },
    
    { id: 'top-bottom', label: 'Top and Bottom Border', icon: <div className="w-4 h-4 border-t-2 border-b-2 border-slate-900 border-dashed border-x-slate-300" />, group: 'advanced' },
    { id: 'top-double-bottom', label: 'Top and Double Bottom', icon: <div className="w-4 h-4 border-t-2 border-b-[3px] border-b-double border-slate-900 border-dashed border-x-slate-300" />, group: 'advanced' },
];

const Borders: React.FC<BordersProps> = ({ onApplyBorder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [lineColor, setLineColor] = useState('#000000');
    const [lineStyle, setLineStyle] = useState<LineStyle>('thin');
    const [activePlacement, setActivePlacement] = useState<BorderPlacement>('bottom');
    const buttonRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        if (!isOpen) return;
        const handleOutside = (e: MouseEvent) => {
            if (
                buttonRef.current && !buttonRef.current.contains(e.target as Node) &&
                dropdownRef.current && !dropdownRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleOutside);
        return () => document.removeEventListener('mousedown', handleOutside);
    }, [isOpen]);

    const handleApply = (placement: BorderPlacement) => {
        setActivePlacement(placement);
        if (onApplyBorder) {
            onApplyBorder(placement, lineStyle, lineColor);
        }
        setIsOpen(false);
    };

    const handleQuickClick = () => {
        // Direct click applies last chosen placement
        if (onApplyBorder) {
            onApplyBorder(activePlacement, lineStyle, lineColor);
        }
    };

    const buttonRect = buttonRef.current?.getBoundingClientRect();
    const dropdownTop = buttonRect ? Math.min(window.innerHeight - 420, buttonRect.bottom + 4) : 0;
    const dropdownLeft = buttonRect ? Math.max(8, Math.min(window.innerWidth - 260, buttonRect.left)) : 0;

    return (
        <div className="relative inline-flex items-center">
            {/* Split Button: Quick Action + Dropdown Arrow */}
            <Tooltip content="Borders (Apply border to selection)">
                <div className="flex items-center rounded hover:bg-slate-100 transition-colors group">
                    <button
                        ref={buttonRef}
                        onClick={handleQuickClick}
                        className="p-1 text-slate-700 hover:text-emerald-700 flex items-center justify-center cursor-pointer"
                        title="Apply border"
                    >
                        <div className="w-3.5 h-3.5 border-2 border-slate-700 rounded-[1px] relative flex items-center justify-center">
                            <div className="w-1.5 h-[1px] bg-slate-700" />
                        </div>
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsOpen(!isOpen);
                        }}
                        className="p-0.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                        title="More border options"
                    >
                        <ChevronDown size={11} className={cn("transition-transform", isOpen && "rotate-180")} />
                    </button>
                </div>
            </Tooltip>

            {/* Dropdown Menu Portal */}
            {isOpen && createPortal(
                <div
                    ref={dropdownRef}
                    className="fixed z-[9999] bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-2xl rounded-xl w-[260px] p-2 text-xs text-slate-800 ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-100 max-h-[460px] overflow-y-auto scrollbar-thin"
                    style={{ top: dropdownTop, left: dropdownLeft }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* BORDER PRESETS */}
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Border Placements
                    </div>
                    <div className="space-y-0.5 mb-2">
                        {BORDER_PRESETS.map((preset) => (
                            <button
                                key={preset.id}
                                onClick={() => handleApply(preset.id)}
                                className={cn(
                                    "w-full px-2.5 py-1.5 flex items-center gap-2.5 rounded-lg text-left transition-colors hover:bg-slate-100 cursor-pointer",
                                    activePlacement === preset.id && "bg-emerald-50 text-emerald-900 font-semibold"
                                )}
                            >
                                <span className="flex-shrink-0 flex items-center justify-center w-5 h-5">
                                    {preset.icon}
                                </span>
                                <span className="flex-1 truncate">{preset.label}</span>
                                {activePlacement === preset.id && (
                                    <Check size={13} className="text-emerald-600 flex-shrink-0" />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="border-t border-slate-100 my-2" />

                    {/* LINE COLOR PICKER */}
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Palette size={11} />
                        Line Color
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1.5 mb-1 flex-wrap">
                        {COLOR_SWATCHES.map((color) => (
                            <button
                                key={color}
                                onClick={() => setLineColor(color)}
                                className={cn(
                                    "w-5 h-5 rounded-full border border-slate-200 transition-transform hover:scale-115 cursor-pointer relative flex items-center justify-center shadow-2xs",
                                    lineColor === color && "ring-2 ring-emerald-500 ring-offset-1"
                                )}
                                style={{ backgroundColor: color }}
                                title={color}
                            >
                                {lineColor === color && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-white shadow-xs" />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="border-t border-slate-100 my-2" />

                    {/* LINE STYLE PICKER */}
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Minus size={11} />
                        Line Style
                    </div>
                    <div className="space-y-1 px-1">
                        {LINE_STYLES.map((style) => (
                            <button
                                key={style.id}
                                onClick={() => setLineStyle(style.id)}
                                className={cn(
                                    "w-full px-2.5 py-1.5 flex items-center justify-between rounded-lg hover:bg-slate-100 transition-colors cursor-pointer",
                                    lineStyle === style.id && "bg-slate-100 font-semibold"
                                )}
                            >
                                <span className="text-[11px] text-slate-600">{style.label}</span>
                                <div className="flex items-center gap-2">
                                    {style.preview}
                                    {lineStyle === style.id && <Check size={12} className="text-emerald-600" />}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default memo(Borders);
