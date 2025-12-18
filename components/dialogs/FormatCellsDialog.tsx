
import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Lock, Info, ChevronDown, Check, MousePointer2, RotateCw } from 'lucide-react';
import { CellStyle } from '../../types';
import { cn } from '../../utils';
import { motion, AnimatePresence } from 'framer-motion';

interface FormatCellsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialStyle: CellStyle;
  onApply: (style: CellStyle) => void;
}

const TABS = ['Number', 'Alignment', 'Font', 'Border', 'Fill', 'Protection'];

const CATEGORIES = [
  'General', 'Number', 'Currency', 'Accounting', 'Date', 'Time', 
  'Percentage', 'Fraction', 'Scientific', 'Text', 'Special', 'Custom'
];

const COLORS = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#00FFFF', '#FF00FF',
    '#800000', '#008000', '#008000', '#808000', '#800080', '#008080', '#C0C0C0', '#808080',
    '#9999FF', '#993366', '#FFFFCC', '#CCFFFF', '#660066', '#FF8080', '#0066CC', '#CCCCFF',
    '#0f172a', '#1e293b', '#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0', '#f1f5f9', '#f8fafc'
];

const HORIZONTAL_ALIGN_OPTIONS = [
    { value: 'general', label: 'General' },
    { value: 'left', label: 'Left (Indent)' },
    { value: 'center', label: 'Center' },
    { value: 'right', label: 'Right (Indent)' },
    { value: 'fill', label: 'Fill' },
    { value: 'justify', label: 'Justify' },
    { value: 'centerAcross', label: 'Center Across Selection' },
    { value: 'distributed', label: 'Distributed (Indent)' },
];

const VERTICAL_ALIGN_OPTIONS = [
    { value: 'top', label: 'Top' },
    { value: 'middle', label: 'Center' },
    { value: 'bottom', label: 'Bottom' },
    { value: 'justify', label: 'Justify' },
    { value: 'distributed', label: 'Distributed' },
];

// Ported dropdown to prevent clipping by overflow-y-auto parents
const ModernSelect = ({ 
    value, 
    options, 
    onChange, 
    className 
}: { 
    value: string, 
    options: { value: string, label: string }[], 
    onChange: (val: string) => void, 
    className?: string 
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [coords, setCoords] = useState<{ top: number; left: number; width: number } | null>(null);

    const updateCoords = () => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setCoords({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
                width: rect.width
            });
        }
    };

    useLayoutEffect(() => {
        if (isOpen) {
            updateCoords();
            window.addEventListener('scroll', updateCoords, true);
            window.addEventListener('resize', updateCoords);
        }
        return () => {
            window.removeEventListener('scroll', updateCoords, true);
            window.removeEventListener('resize', updateCoords);
        };
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                triggerRef.current && !triggerRef.current.contains(event.target as Node) &&
                dropdownRef.current && !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        if (isOpen) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const selectedLabel = options.find(o => o.value === value)?.label || value;

    return (
        <div className={cn("relative", className)}>
            <button
                ref={triggerRef}
                onClick={() => setIsOpen(!isOpen)}
                className="w-full h-10 bg-white border border-slate-200 rounded-xl px-4 text-[13px] text-slate-800 flex items-center justify-between hover:border-primary-400 hover:shadow-sm transition-all focus:ring-4 focus:ring-primary-500/10 outline-none"
            >
                <span className="truncate font-medium">{selectedLabel}</span>
                <ChevronDown size={16} className={cn("text-slate-400 transition-transform duration-300", isOpen && "rotate-180")} />
            </button>
            
            {isOpen && coords && createPortal(
                <div 
                    ref={dropdownRef}
                    className="fixed z-[9999] bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 ring-1 ring-black/5"
                    style={{ 
                        top: coords.top + 4, 
                        left: coords.left, 
                        width: coords.width,
                        maxHeight: '300px'
                    }}
                >
                    <div className="overflow-y-auto max-h-[290px] py-1.5 scrollbar-thin">
                        {options.map(option => (
                            <div
                                key={option.value}
                                onClick={() => { onChange(option.value); setIsOpen(false); }}
                                className={cn(
                                    "px-4 py-2.5 text-[13px] cursor-pointer hover:bg-slate-50 text-slate-700 transition-colors flex items-center justify-between mx-1 rounded-lg",
                                    option.value === value && "bg-primary-50 text-primary-700 font-bold hover:bg-primary-50"
                                )}
                            >
                                <span>{option.label}</span>
                                {option.value === value && <Check size={14} className="text-primary-600" />}
                            </div>
                        ))}
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

const ScrollableList = ({ 
    items, 
    selected, 
    onSelect, 
    className, 
    itemStyle 
}: { 
    items: (string|number)[], 
    selected: string|number, 
    onSelect: (val: any) => void, 
    className?: string,
    itemStyle?: (item: any) => React.CSSProperties
}) => {
    const selectedRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        if (selectedRef.current) {
            selectedRef.current.scrollIntoView({ block: 'nearest' });
        }
    }, [selected]);

    return (
        <div className={cn("border border-slate-200 bg-white/50 overflow-y-auto flex flex-col h-full shadow-inner select-none rounded-lg scrollbar-thin", className)}>
            {items.map(item => {
                const isSelected = selected === item;
                return (
                    <div 
                        key={item} 
                        ref={isSelected ? selectedRef : null}
                        className={cn(
                            "px-4 py-2 text-[12px] cursor-pointer whitespace-nowrap transition-all",
                            isSelected ? "bg-primary-600 text-white font-semibold shadow-md z-10 scale-[1.02]" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        )}
                        style={itemStyle ? itemStyle(item) : {}}
                        onClick={() => onSelect(item)}
                    >
                        {item}
                    </div>
                );
            })}
        </div>
    );
};

const GroupBox = ({ label, children, className }: { label: string, children?: React.ReactNode, className?: string }) => (
    <div className={cn("border border-slate-200 rounded-2xl p-6 relative pt-8 bg-white/40 backdrop-blur-sm shadow-soft transition-all", className)}>
        <span className="absolute -top-3 left-6 bg-white border border-slate-200 rounded-full px-4 py-0.5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] shadow-sm">{label}</span>
        {children}
    </div>
);

const NumberTab = ({ style, onChange, isMobile }: { style: CellStyle, onChange: any, isMobile: boolean }) => {
    const getCategoryFromFormat = () => {
        if (!style.format || style.format === 'general') return 'General';
        const map: any = { 
            'number': 'Number', 'currency': 'Currency', 'accounting': 'Accounting', 
            'shortDate': 'Date', 'longDate': 'Date', 'time': 'Time', 
            'percent': 'Percentage', 'fraction': 'Fraction', 'scientific': 'Scientific', 
            'text': 'Text' 
        };
        return map[style.format] || 'Custom';
    };
    const selectedCat = getCategoryFromFormat();
    
    return (
        <div className={cn("flex h-full", isMobile ? "flex-col gap-6" : "gap-8")}>
            <div className={cn("flex flex-col gap-2", isMobile ? "w-full" : "w-[180px]")}>
                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider px-1">Category:</span>
                <ScrollableList 
                    items={CATEGORIES}
                    selected={selectedCat}
                    onSelect={(cat) => {
                        const map: any = {
                            'General': 'general', 'Number': 'number', 'Currency': 'currency', 'Accounting': 'accounting',
                            'Date': 'shortDate', 'Time': 'time', 'Percentage': 'percent', 'Fraction': 'fraction',
                            'Scientific': 'scientific', 'Text': 'text'
                        };
                        if (map[cat]) onChange('format', map[cat]);
                    }}
                    className={cn("flex-1 border-slate-100", isMobile ? "min-h-[140px]" : "min-h-[300px]")}
                />
            </div>
            
            <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-1">
                <div className="flex flex-col gap-2">
                    <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider px-1">Preview</span>
                    <div className="h-14 bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-xl flex items-center px-5 text-base text-slate-900 font-mono shadow-inner group">
                        {style.format === 'currency' ? `${style.currencySymbol || '$'}1,234.56` : '1234.56'}
                    </div>
                </div>
            </div>
        </div>
    );
};

const AlignmentTab = ({ style, onChange, isMobile }: { style: CellStyle, onChange: any, isMobile: boolean }) => {
    const indentEnabled = style.align === 'left' || style.align === 'right' || style.align === 'distributed';
    const clockRef = useRef<HTMLDivElement>(null);

    const handleClockInteraction = (e: React.MouseEvent | React.TouchEvent) => {
        if (!clockRef.current) return;
        const rect = clockRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        let clientX, clientY;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        const angleRad = Math.atan2(centerY - clientY, clientX - centerX);
        let angleDeg = Math.round(angleRad * (180 / Math.PI));
        angleDeg = Math.max(-90, Math.min(90, angleDeg));
        
        onChange('textRotation', angleDeg);
        onChange('verticalText', false);
    };

    return (
        <div className={cn("grid h-full", isMobile ? "grid-cols-1 gap-6 pb-20" : "grid-cols-[1fr_260px] gap-10")}>
            <div className="flex flex-col gap-6">
                <GroupBox label="Text alignment">
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between px-1">
                                <span className="text-[12px] text-slate-500 font-semibold uppercase tracking-wider">Horizontal</span>
                                {indentEnabled && (
                                    <div className="flex items-center gap-3">
                                        <span className="text-[11px] text-slate-400 font-bold">INDENT</span>
                                        <input 
                                            type="number" 
                                            className="w-16 h-8 bg-slate-50 border border-slate-200 rounded-lg px-2 text-[13px] font-mono font-bold text-slate-700 outline-none"
                                            value={style.indent || 0}
                                            onChange={(e) => onChange('indent', Math.max(0, parseInt(e.target.value) || 0))}
                                            min={0}
                                        />
                                    </div>
                                )}
                            </div>
                            <ModernSelect 
                                value={style.align || 'general'}
                                options={HORIZONTAL_ALIGN_OPTIONS}
                                onChange={(val) => onChange('align', val)}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="text-[12px] text-slate-500 font-semibold uppercase tracking-wider px-1">Vertical</span>
                            <ModernSelect 
                                value={style.verticalAlign || 'bottom'}
                                options={VERTICAL_ALIGN_OPTIONS}
                                onChange={(val) => onChange('verticalAlign', val)}
                            />
                        </div>
                    </div>
                </GroupBox>

                <GroupBox label="Text control">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-8 py-1">
                        {[
                            { key: 'wrapText', label: 'Wrap text', desc: 'Auto-adjust row height' },
                            { key: 'shrinkToFit', label: 'Shrink to fit', desc: 'Downscale text size' },
                            { key: 'mergeCells', label: 'Merge cells', desc: 'Combine selected' }
                        ].map(item => (
                            <label key={item.key} className="flex items-center gap-4 cursor-pointer group">
                                <div className={cn(
                                    "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300",
                                    !!(style as any)[item.key] ? "bg-primary-600 border-primary-600 shadow-md" : "bg-white border-slate-200"
                                )}>
                                    {!!(style as any)[item.key] && <Check size={14} className="text-white stroke-[3]" />}
                                    <input 
                                        type="checkbox" 
                                        className="sr-only" 
                                        checked={!!(style as any)[item.key]} 
                                        onChange={(e) => {
                                            if (item.key === 'wrapText' && e.target.checked) onChange('shrinkToFit', false);
                                            if (item.key === 'shrinkToFit' && e.target.checked) onChange('wrapText', false);
                                            onChange(item.key as any, e.target.checked);
                                        }} 
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[14px] font-bold text-slate-700">{item.label}</span>
                                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">{item.desc}</span>
                                </div>
                            </label>
                        ))}
                    </div>
                </GroupBox>
            </div>

            <div className="flex flex-col gap-6">
                <GroupBox label="Orientation" className="flex-1 flex flex-col min-h-[360px]">
                    <div className="flex-1 flex flex-col items-center justify-between py-2 gap-8">
                        <div 
                            ref={clockRef}
                            onMouseDown={handleClockInteraction}
                            onTouchStart={handleClockInteraction}
                            className="relative w-40 h-40 md:w-44 md:h-44 rounded-full border-4 border-slate-100 bg-white shadow-soft flex items-center justify-center cursor-crosshair"
                        >
                            {[...Array(12)].map((_, i) => (
                                <div key={i} className="absolute h-full w-[1.5px] pointer-events-none" style={{ transform: `rotate(${i * 30}deg)` }}>
                                    <div className={cn(
                                        "w-full rounded-full transition-all", 
                                        i % 3 === 0 ? "h-3 bg-slate-300" : "h-1.5 bg-slate-100"
                                    )} />
                                </div>
                            ))}
                            <div className={cn(
                                "absolute inset-0 flex items-center justify-center transition-all duration-500 pointer-events-none",
                                style.verticalText ? "opacity-100 scale-100" : "opacity-10 scale-90"
                            )}>
                                <div className={cn(
                                    "w-10 h-[70%] border-2 rounded-xl flex flex-col items-center justify-center gap-1.5 font-mono text-[9px] font-black tracking-widest",
                                    style.verticalText ? "border-primary-500 text-primary-600 bg-primary-50" : "border-slate-300 text-slate-400"
                                )}>
                                    <span>T</span><span>E</span><span>X</span><span>T</span>
                                </div>
                            </div>
                            <div 
                                className="absolute h-[4px] w-[46%] bg-gradient-to-r from-primary-400 to-primary-600 origin-left top-1/2 left-1/2 transition-transform duration-500 shadow-md rounded-full z-20 pointer-events-none"
                                style={{ transform: `rotate(${(style.textRotation || 0) * -1}deg)` }}
                            >
                                <div className="absolute -right-3 -top-2.5 w-6 h-6 bg-white border-4 border-primary-600 rounded-full shadow-xl" />
                            </div>
                            <div className="w-4 h-4 bg-white rounded-full z-30 border-4 border-slate-300 pointer-events-none" />
                        </div>

                        <div className="w-full flex flex-col gap-4">
                             <div className="flex items-center gap-4 bg-slate-900 rounded-2xl p-2 pl-5 border border-slate-800">
                                <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] flex-1">Degrees</span>
                                <div className="flex items-center gap-1 bg-slate-800 rounded-xl p-1 pr-3">
                                    <input 
                                        type="number" 
                                        className="w-12 h-10 bg-transparent text-center text-lg font-mono font-black text-white outline-none"
                                        value={style.textRotation || 0}
                                        onChange={(e) => {
                                            const deg = Math.max(-90, Math.min(90, parseInt(e.target.value) || 0));
                                            onChange('textRotation', deg);
                                            onChange('verticalText', false);
                                        }}
                                        min={-90} max={90}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => { 
                                        const isVertical = !style.verticalText;
                                        onChange('verticalText', isVertical); 
                                        if(isVertical) onChange('textRotation', 0); 
                                    }}
                                    className={cn(
                                        "flex-1 h-12 rounded-xl flex items-center justify-center gap-2 text-[12px] font-bold transition-all border-2",
                                        style.verticalText ? "bg-primary-600 border-primary-600 text-white shadow-lg" : "bg-white border-slate-100 text-slate-500"
                                    )}
                                >
                                    <span className="font-black">Vertical</span>
                                </button>
                                <button 
                                    onClick={() => { onChange('textRotation', 0); onChange('verticalText', false); }}
                                    className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all"
                                >
                                    <RotateCw size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </GroupBox>
            </div>
        </div>
    );
};

const FontTab = ({ style, onChange, isMobile }: { style: CellStyle, onChange: any, isMobile: boolean }) => (
    <div className="flex flex-col h-full gap-6 pb-4">
        {/* Top Section: Font, Style, Size */}
        <div className={cn("grid gap-4", isMobile ? "grid-cols-1" : "grid-cols-[1fr_160px_100px]")}>
            {/* Font Family */}
            <div className="flex flex-col gap-2">
                <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider px-1">Typeface</span>
                <div className="border border-slate-200 rounded-xl bg-slate-50/50 p-1 flex flex-col flex-1 min-h-[160px] max-h-[200px]">
                    <input 
                        type="text" 
                        value={style.fontFamily || 'Inter'} 
                        onChange={(e) => onChange('fontFamily', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium mb-1 focus:ring-2 focus:ring-primary-100 outline-none"
                    />
                    <ScrollableList 
                        items={['Inter', 'Arial', 'Calibri', 'Times New Roman', 'Courier New', 'Verdana', 'Georgia', 'Trebuchet MS', 'Comic Sans MS']}
                        selected={style.fontFamily || 'Inter'}
                        onSelect={(val) => onChange('fontFamily', val)}
                        className="flex-1 border-0 bg-transparent shadow-none"
                        itemStyle={(font) => ({ fontFamily: font as string })}
                    />
                </div>
            </div>

            {/* Font Style */}
            <div className="flex flex-col gap-2">
                <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider px-1">Style</span>
                <div className="border border-slate-200 rounded-xl bg-slate-50/50 p-1 flex flex-col flex-1 min-h-[160px] max-h-[200px]">
                    <input 
                        type="text" 
                        value={style.bold && style.italic ? 'Bold Italic' : style.bold ? 'Bold' : style.italic ? 'Italic' : 'Regular'} 
                        readOnly
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium mb-1 focus:outline-none text-slate-500"
                    />
                    <ScrollableList 
                        items={['Regular', 'Italic', 'Bold', 'Bold Italic']}
                        selected={style.bold && style.italic ? 'Bold Italic' : style.bold ? 'Bold' : style.italic ? 'Italic' : 'Regular'}
                        onSelect={(s) => { onChange('bold', s.includes('Bold')); onChange('italic', s.includes('Italic')); }}
                        className="flex-1 border-0 bg-transparent shadow-none"
                        itemStyle={(s) => ({ 
                            fontWeight: s.includes('Bold') ? 'bold' : 'normal', 
                            fontStyle: s.includes('Italic') ? 'italic' : 'normal' 
                        })}
                    />
                </div>
            </div>

            {/* Font Size */}
            <div className="flex flex-col gap-2">
                <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider px-1">Size</span>
                <div className="border border-slate-200 rounded-xl bg-slate-50/50 p-1 flex flex-col flex-1 min-h-[160px] max-h-[200px]">
                    <input 
                        type="number" 
                        value={style.fontSize || 11} 
                        onChange={(e) => onChange('fontSize', parseInt(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium mb-1 focus:ring-2 focus:ring-primary-100 outline-none"
                    />
                    <ScrollableList 
                        items={[8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72]}
                        selected={style.fontSize || 11}
                        onSelect={(val) => onChange('fontSize', val)}
                        className="flex-1 border-0 bg-transparent shadow-none"
                    />
                </div>
            </div>
        </div>

        {/* Middle Section: Underline & Color & Effects */}
        <div className={cn("grid gap-6", isMobile ? "grid-cols-1" : "grid-cols-2")}>
            
            <div className="flex flex-col gap-4">
                {/* Underline */}
                <div className="flex flex-col gap-2">
                    <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider px-1">Underline</span>
                    <ModernSelect 
                        value={style.underline ? 'single' : 'none'} 
                        options={[
                            { value: 'none', label: 'None' },
                            { value: 'single', label: 'Single' },
                            { value: 'double', label: 'Double' },
                            { value: 'single_acc', label: 'Single Accounting' },
                            { value: 'double_acc', label: 'Double Accounting' }
                        ]}
                        onChange={(val) => onChange('underline', val !== 'none')}
                    />
                </div>

                {/* Color */}
                <div className="flex flex-col gap-2">
                    <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider px-1">Color</span>
                    <div className="relative">
                        <ModernSelect 
                            value={style.color || '#000000'}
                            options={[{value: style.color || '#000000', label: 'Current Color'}]} 
                            onChange={() => {}}
                            className="pointer-events-none opacity-90"
                        />
                        {/* Custom Color Trigger Overlay */}
                        <div className="absolute inset-0 z-10 opacity-0 cursor-pointer">
                            <input 
                                type="color" 
                                className="w-full h-full cursor-pointer"
                                value={style.color || '#000000'}
                                onChange={(e) => onChange('color', e.target.value)}
                            />
                        </div>
                        {/* Visual Indicator */}
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md border border-slate-200 shadow-sm pointer-events-none" style={{ backgroundColor: style.color || '#000000' }} />
                    </div>
                </div>
            </div>

            {/* Effects & Preview */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider px-1">Effects</span>
                    <div className="flex flex-col gap-3 py-1">
                        <label className="flex items-center gap-3 cursor-pointer group select-none">
                            <div className={cn("w-5 h-5 rounded border-2 flex items-center justify-center transition-all", style.strikethrough ? "bg-primary-600 border-primary-600" : "bg-white border-slate-300 group-hover:border-primary-400")}>
                                {style.strikethrough && <Check size={12} className="text-white stroke-[4]" />}
                            </div>
                            <span className="text-sm text-slate-700 font-medium">Strikethrough</span>
                            <input type="checkbox" className="hidden" checked={!!style.strikethrough} onChange={(e) => onChange('strikethrough', e.target.checked)} />
                        </label>
                        
                        <label className="flex items-center gap-3 cursor-not-allowed opacity-50 group select-none" title="Not available">
                            <div className="w-5 h-5 rounded border-2 border-slate-200 bg-slate-50 flex items-center justify-center"></div>
                            <span className="text-sm text-slate-500 font-medium">Superscript</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-not-allowed opacity-50 group select-none" title="Not available">
                            <div className="w-5 h-5 rounded border-2 border-slate-200 bg-slate-50 flex items-center justify-center"></div>
                            <span className="text-sm text-slate-500 font-medium">Subscript</span>
                        </label>
                    </div>
                </div>
            </div>
        </div>

        {/* Preview Box */}
        <GroupBox label="Preview" className="mt-auto">
            <div className="h-16 flex items-center justify-center overflow-hidden">
                <span style={{ 
                    fontFamily: style.fontFamily || 'Inter',
                    fontSize: `${Math.min(32, (style.fontSize || 11) * 1.5)}px`,
                    fontWeight: style.bold ? 'bold' : 'normal',
                    fontStyle: style.italic ? 'italic' : 'normal',
                    textDecoration: [
                        style.underline ? 'underline' : '',
                        style.strikethrough ? 'line-through' : ''
                    ].filter(Boolean).join(' '),
                    color: style.color || '#000000'
                }}>
                    AaBbCcYyZz
                </span>
            </div>
        </GroupBox>
    </div>
);

const BorderTab = ({ style, onChange, isMobile }: { style: CellStyle, onChange: any, isMobile: boolean }) => (
    <div className="flex flex-col gap-6 h-full justify-center items-center text-center px-4 md:px-6">
        <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center text-slate-200 border-2 border-dashed border-slate-100">
             <Info size={40} strokeWidth={1} />
        </div>
        <div>
            <h3 className="text-[17px] font-black text-slate-800 tracking-tight">Style Borders</h3>
            <p className="text-[12px] text-slate-500 mt-2 leading-relaxed font-medium">
                Advanced border customizer is in development.<br/>Use Home tab for rapid borders.
            </p>
        </div>
    </div>
);

const FillTab = ({ style, onChange, isMobile }: { style: CellStyle, onChange: any, isMobile: boolean }) => (
    <div className="flex flex-col gap-6 h-full">
        <GroupBox label="Background Color">
            <div className={cn("grid gap-2 p-2", isMobile ? "grid-cols-5" : "grid-cols-10")}>
                {COLORS.map(c => (
                    <button
                        key={c}
                        className={cn(
                            "w-8 h-8 rounded-lg border border-slate-200 transition-all hover:scale-110",
                            style.bg === c && "ring-2 ring-primary-500 ring-offset-2 scale-110"
                        )}
                        style={{ backgroundColor: c }}
                        onClick={() => onChange('bg', c)}
                        title={c}
                    />
                ))}
            </div>
        </GroupBox>
    </div>
);

const ProtectionTab = ({ style, onChange, isMobile }: { style: CellStyle, onChange: any, isMobile: boolean }) => (
    <div className="flex flex-col gap-6 h-full py-4">
        <div className="grid gap-6">
            <label className="flex items-start gap-4 p-5 rounded-[24px] bg-slate-50 border border-slate-100 cursor-pointer group hover:bg-white hover:shadow-xl transition-all">
                <div className="w-6 h-6 rounded-lg border-2 border-slate-200 flex items-center justify-center bg-white mt-1 group-hover:border-primary-500">
                    <input 
                        type="checkbox" 
                        className="w-4 h-4 accent-primary-600"
                        checked={style.protection?.locked !== false} 
                        onChange={(e) => onChange('protection', { ...(style.protection || {}), locked: e.target.checked })} 
                    />
                </div>
                <div className="flex flex-col">
                    <span className="text-base font-black text-slate-800 flex items-center gap-2">
                        <Lock size={18} className="text-primary-600" />
                        Locked
                    </span>
                    <span className="text-[13px] text-slate-500 mt-1 font-medium">Prevents cells from being edited when sheet protection is active.</span>
                </div>
            </label>
        </div>
    </div>
);

const FormatCellsDialog: React.FC<FormatCellsDialogProps> = ({ isOpen, onClose, initialStyle, onApply }) => {
  const [activeTab, setActiveTab] = useState('Alignment');
  const [style, setStyle] = useState<CellStyle>(initialStyle);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dragRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
      if (isOpen) {
          setStyle(JSON.parse(JSON.stringify(initialStyle)));
          if (!isMobile) {
            const width = 680;
            const height = 680;
            setPosition({ 
                x: (window.innerWidth - width) / 2, 
                y: (window.innerHeight - height) / 2 
            });
          }
      }
  }, [isOpen, initialStyle, isMobile]);

  useEffect(() => {
      const handleMouseMove = (e: MouseEvent) => {
          if (!isDragging || isMobile) return;
          setPosition(prev => ({ x: prev.x + e.movementX, y: prev.y + e.movementY }));
      };
      const handleMouseUp = () => setIsDragging(false);
      if (isDragging) {
          window.addEventListener('mousemove', handleMouseMove);
          window.addEventListener('mouseup', handleMouseUp);
      }
      return () => {
          window.removeEventListener('mousemove', handleMouseMove);
          window.removeEventListener('mouseup', handleMouseUp);
      };
  }, [isDragging, isMobile]);

  const updateStyle = (key: keyof CellStyle, value: any) => {
      setStyle(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
      onApply(style);
      onClose();
  };

  if (!isOpen) return null;

  const floatingClass = isMobile 
    ? "fixed bottom-4 left-4 right-4 z-[2001] bg-white flex flex-col overflow-hidden rounded-[32px] shadow-2xl border border-slate-200" 
    : "fixed w-[680px] h-[680px] rounded-[40px] shadow-2xl z-[2001] bg-white border border-slate-200 overflow-hidden flex flex-col";

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/60 backdrop-blur-md">
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    initial={isMobile ? { y: '100%', opacity: 0 } : { scale: 0.9, opacity: 0 }}
                    animate={isMobile ? { y: 0, opacity: 1 } : { scale: 1, opacity: 1, x: position.x, y: position.y }}
                    exit={isMobile ? { y: '100%', opacity: 0 } : { scale: 0.9, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className={cn(floatingClass, !isMobile && "fixed m-0")}
                    style={{
                        ...( !isMobile ? { left: 0, top: 0 } : { height: '80vh' })
                    }}
                >
                    <div 
                        ref={dragRef}
                        className={cn("h-20 flex items-center justify-between px-8 select-none flex-shrink-0 relative", !isMobile && "cursor-move")}
                        onMouseDown={(e) => {
                            if (!isMobile && (e.target === dragRef.current || (e.target as HTMLElement).tagName === 'SPAN')) {
                                setIsDragging(true);
                            }
                        }}
                    >
                        {isMobile && <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-slate-200 rounded-full opacity-50" />}
                        <div className="flex items-center gap-4 mt-2">
                             <div className="w-10 h-10 rounded-2xl bg-primary-600 flex items-center justify-center text-white shadow-lg">
                                <MousePointer2 size={20} className="fill-white" />
                             </div>
                             <div className="flex flex-col">
                                <span className="text-[17px] font-black text-slate-900 tracking-tight">Format Cells</span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Properties</span>
                             </div>
                        </div>
                        <button onClick={onClose} className="mt-2 w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-all">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="px-6 md:px-10 py-1 flex-shrink-0">
                        <div className="flex bg-slate-50/50 p-1.5 rounded-[22px] gap-1 overflow-x-auto no-scrollbar border border-slate-100 shadow-inner snap-x scroll-smooth items-center">
                            {TABS.map(tab => {
                                const active = activeTab === tab;
                                return (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={cn(
                                            "px-4 md:px-6 py-2.5 md:py-3 text-[12px] md:text-[13px] font-black rounded-[18px] transition-all whitespace-nowrap flex-shrink-0 snap-center min-w-max",
                                            active 
                                                ? "bg-white text-primary-700 shadow-sm border border-slate-100 scale-[1.02]" 
                                                : "text-slate-400 hover:text-slate-600 hover:bg-white/40"
                                        )}
                                    >
                                        {tab}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex-1 bg-white px-6 md:px-10 py-6 md:py-10 overflow-y-auto scrollbar-thin">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.2 }}
                                className="h-full"
                            >
                                {activeTab === 'Number' && <NumberTab style={style} onChange={updateStyle} isMobile={isMobile} />}
                                {activeTab === 'Alignment' && <AlignmentTab style={style} onChange={updateStyle} isMobile={isMobile} />}
                                {activeTab === 'Font' && <FontTab style={style} onChange={updateStyle} isMobile={isMobile} />}
                                {activeTab === 'Border' && <BorderTab style={style} onChange={updateStyle} isMobile={isMobile} />}
                                {activeTab === 'Fill' && <FillTab style={style} onChange={updateStyle} isMobile={isMobile} />}
                                {activeTab === 'Protection' && <ProtectionTab style={style} onChange={updateStyle} isMobile={isMobile} />}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <div className="h-24 md:h-28 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end px-6 md:px-10 gap-3 md:gap-5 flex-shrink-0 pb-2 md:pb-4">
                        <button 
                            onClick={onClose} 
                            className="px-6 md:px-8 py-3 rounded-2xl text-[13px] font-black text-slate-400 hover:text-slate-900"
                        >
                            Discard
                        </button>
                        <button 
                            onClick={handleApply} 
                            className="px-10 md:px-14 py-3 bg-slate-900 rounded-[22px] text-[14px] font-black text-white hover:bg-slate-800 shadow-xl active:scale-95 transition-all"
                        >
                            Save Changes
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
};

export default FormatCellsDialog;
