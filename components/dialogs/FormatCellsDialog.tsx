import React, { useState, useEffect, useRef, memo } from 'react';
import { X, Lock, Info, ChevronDown, Check, MousePointer2, RotateCw, Type, Palette, AlignLeft, LayoutGrid, Hash } from 'lucide-react';
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

const FONTS = ['Inter', 'Arial', 'Calibri', 'Times New Roman', 'Courier New', 'Verdana', 'JetBrains Mono', 'Segoe UI', 'Impact', 'Georgia'];
const FONT_STYLES = ['Regular', 'Italic', 'Bold', 'Bold Italic'];
const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72];
const UNDERLINE_OPTIONS = [
    { value: 'none', label: 'None' },
    { value: 'single', label: 'Single' },
    { value: 'double', label: 'Double' },
    { value: 'singleAccounting', label: 'Single Accounting' },
    { value: 'doubleAccounting', label: 'Double Accounting' },
];

const COLORS = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#00FFFF', '#FF00FF',
    '#4472C4', '#ED7D31', '#A5A5A5', '#FFC000', '#5B9BD5', '#70AD47', '#264478', '#9E480E',
    '#636363', '#997300', '#255E91', '#43682B', '#0f172a', '#1e293b', '#334155', '#475569',
    '#10b981', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'
];

const CATEGORIES = [
  'General', 'Number', 'Currency', 'Accounting', 'Date', 'Time', 
  'Percentage', 'Fraction', 'Scientific', 'Text', 'Special', 'Custom'
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

const TEXT_DIRECTION_OPTIONS = [
    { value: 'context', label: 'Context' },
    { value: 'ltr', label: 'Left-to-Right' },
    { value: 'rtl', label: 'Right-to-Left' },
];

// --- SHARED UI COMPONENTS ---

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
        <div className={cn("border border-slate-200 bg-white overflow-y-auto flex flex-col h-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] select-none rounded-lg scrollbar-thin", className)}>
            {items.map(item => {
                const isSelected = String(selected) === String(item);
                return (
                    <div 
                        key={item} 
                        ref={isSelected ? selectedRef : null}
                        className={cn(
                            "px-3 py-1.5 text-[12px] cursor-pointer whitespace-nowrap transition-all",
                            isSelected ? "bg-primary-600 text-white font-semibold z-10" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
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

const ModernSelect = ({ 
    value, 
    options, 
    onChange, 
    className,
    label
}: { 
    value: string, 
    options: { value: string, label: string }[], 
    onChange: (val: string) => void, 
    className?: string,
    label?: string
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedLabel = options.find(o => o.value === value)?.label || value;

    return (
        <div ref={containerRef} className={cn("flex flex-col gap-1.5", className)}>
            {label && <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider px-1">{label}</span>}
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full h-9 bg-white border border-slate-200 rounded-lg px-3 text-[12px] text-slate-800 flex items-center justify-between hover:border-primary-400 hover:shadow-sm transition-all focus:ring-4 focus:ring-primary-500/5 outline-none"
                >
                    <span className="truncate font-medium">{selectedLabel}</span>
                    <ChevronDown size={14} className={cn("text-slate-400 transition-transform duration-300", isOpen && "rotate-180")} />
                </button>
                <AnimatePresence>
                    {isOpen && (
                        <motion.div 
                            initial={{ opacity: 0, y: 4, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 4, scale: 0.98 }}
                            className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl z-[1100] max-h-48 overflow-auto py-1 animate-in ring-1 ring-black/5"
                        >
                            {options.map(option => (
                                <div
                                    key={option.value}
                                    onClick={() => { onChange(option.value); setIsOpen(false); }}
                                    className={cn(
                                        "px-3 py-2 text-[12px] cursor-pointer hover:bg-slate-50 text-slate-700 transition-colors flex items-center justify-between mx-1 rounded-md",
                                        option.value === value && "bg-primary-50 text-primary-700 font-bold"
                                    )}
                                >
                                    <span>{option.label}</span>
                                    {option.value === value && <Check size={12} className="text-primary-600" />}
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const GroupBox = ({ label, children, className }: { label: string, children?: React.ReactNode, className?: string }) => (
    <div className={cn("border border-slate-200 rounded-2xl p-6 relative pt-8 bg-white/40 backdrop-blur-sm shadow-soft transition-all", className)}>
        <span className="absolute -top-3 left-6 bg-white border border-slate-200 rounded-full px-4 py-0.5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] shadow-sm">{label}</span>
        {children}
    </div>
);

// --- TAB COMPONENTS ---

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
        <div className={cn("grid h-full", isMobile ? "grid-cols-1 gap-6" : "grid-cols-[1fr_260px] gap-10")}>
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
                                            className="w-16 h-8 bg-slate-50 border border-slate-200 rounded-lg px-2 text-[13px] font-mono font-bold text-slate-700 outline-none shadow-sm focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all"
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
                            { key: 'wrapText', label: 'Wrap text' },
                            { key: 'shrinkToFit', label: 'Shrink to fit' },
                            { key: 'mergeCells', label: 'Merge cells' }
                        ].map(item => (
                            <label key={item.key} className="flex items-center gap-4 cursor-pointer group">
                                <div className={cn(
                                    "w-5 h-5 rounded border flex items-center justify-center transition-all",
                                    !!(style as any)[item.key] ? "bg-primary-600 border-primary-600" : "bg-white border-slate-300 group-hover:border-primary-400"
                                )}>
                                    {!!(style as any)[item.key] && <Check size={12} className="text-white stroke-[3]" />}
                                    <input 
                                        type="checkbox" 
                                        className="sr-only" 
                                        checked={!!(style as any)[item.key]} 
                                        onChange={(e) => onChange(item.key as any, e.target.checked)} 
                                    />
                                </div>
                                <span className="text-[13px] font-medium text-slate-700 group-hover:text-slate-900 transition-colors">{item.label}</span>
                            </label>
                        ))}
                    </div>
                </GroupBox>
            </div>
            <div className="flex flex-col gap-6 h-full">
                <GroupBox label="Orientation" className="flex-1 flex flex-col min-h-[360px]">
                    <div className="flex-1 flex flex-col items-center justify-between py-2 gap-8">
                        <div 
                            ref={clockRef}
                            onMouseDown={handleClockInteraction}
                            className="relative w-40 h-40 rounded-full border-2 border-slate-100 bg-white shadow-inner flex items-center justify-center cursor-crosshair"
                        >
                            {[...Array(12)].map((_, i) => (
                                <div key={i} className="absolute h-full w-[1px]" style={{ transform: `rotate(${i * 30}deg)` }}>
                                    <div className={cn("w-full h-2 rounded-full", i % 3 === 0 ? "bg-slate-300" : "bg-slate-100")} />
                                </div>
                            ))}
                            <div 
                                className="absolute h-[2px] w-[45%] bg-primary-600 origin-left top-1/2 left-1/2 transition-transform duration-300 shadow-lg"
                                style={{ transform: `rotate(${(style.textRotation || 0) * -1}deg)` }}
                            >
                                <div className="absolute -right-2 -top-1.5 w-4 h-4 bg-white border-2 border-primary-600 rounded-full shadow-md" />
                            </div>
                            <div className="w-2 h-2 bg-slate-300 rounded-full z-10" />
                        </div>
                        <div className="w-full flex flex-col gap-3">
                             <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-2 border border-slate-200">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex-1 px-1">Degrees</span>
                                <input 
                                    type="number" 
                                    className="w-14 h-8 bg-white border border-slate-200 rounded-lg text-center text-sm font-mono font-bold text-slate-700 outline-none"
                                    value={style.textRotation || 0}
                                    onChange={(e) => onChange('textRotation', Math.max(-90, Math.min(90, parseInt(e.target.value) || 0)))}
                                    min={-90} max={90}
                                />
                            </div>
                            <button 
                                onClick={() => onChange('verticalText', !style.verticalText)}
                                className={cn(
                                    "w-full h-10 rounded-xl flex items-center justify-center gap-2 text-[12px] font-bold transition-all border",
                                    style.verticalText ? "bg-primary-600 border-primary-600 text-white" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                                )}
                            >
                                <span>Vertical Text</span>
                            </button>
                        </div>
                    </div>
                </GroupBox>
            </div>
        </div>
    );
};

// --- FONT TAB IMPLEMENTATION ---

const FontTab = ({ style, onChange, isMobile }: { style: CellStyle, onChange: any, isMobile: boolean }) => {
    const [fontInput, setFontInput] = useState(style.fontFamily || 'Inter');
    const [styleInput, setStyleInput] = useState(style.bold && style.italic ? 'Bold Italic' : style.bold ? 'Bold' : style.italic ? 'Italic' : 'Regular');
    const [sizeInput, setSizeInput] = useState(String(style.fontSize || 11));

    // Sync internal inputs when global style changes
    useEffect(() => {
        setFontInput(style.fontFamily || 'Inter');
        setSizeInput(String(style.fontSize || 11));
        setStyleInput(style.bold && style.italic ? 'Bold Italic' : style.bold ? 'Bold' : style.italic ? 'Italic' : 'Regular');
    }, [style]);

    const handleStyleSelect = (s: string) => {
        setStyleInput(s);
        onChange('bold', s.includes('Bold'));
        onChange('italic', s.includes('Italic'));
    };

    return (
        <div className="flex flex-col gap-6 h-full overflow-hidden">
            {/* Top: 3-Column List Pickers */}
            <div className={cn("grid gap-4 flex-shrink-0", isMobile ? "grid-cols-1" : "grid-cols-[1.5fr_1fr_0.6fr]")}>
                {/* Font Family */}
                <div className="flex flex-col gap-2">
                    <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider px-1">Font:</span>
                    <div className="flex flex-col h-40 md:h-48 border border-slate-200 rounded-xl bg-white overflow-hidden shadow-soft">
                        <input 
                            type="text" 
                            className="w-full h-9 px-3 border-b border-slate-100 text-[13px] font-medium text-slate-800 outline-none focus:bg-slate-50"
                            value={fontInput}
                            onChange={(e) => { setFontInput(e.target.value); onChange('fontFamily', e.target.value); }}
                        />
                        <ScrollableList 
                            items={FONTS}
                            selected={style.fontFamily || 'Inter'}
                            onSelect={(val) => { setFontInput(val); onChange('fontFamily', val); }}
                            className="border-none"
                            itemStyle={(font) => ({ fontFamily: font })}
                        />
                    </div>
                </div>

                {/* Font Style */}
                <div className="flex flex-col gap-2">
                    <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider px-1">Font style:</span>
                    <div className="flex flex-col h-40 md:h-48 border border-slate-200 rounded-xl bg-white overflow-hidden shadow-soft">
                        <input 
                            type="text" 
                            className="w-full h-9 px-3 border-b border-slate-100 text-[13px] font-medium text-slate-800 outline-none focus:bg-slate-50"
                            value={styleInput}
                            readOnly
                        />
                        <ScrollableList 
                            items={FONT_STYLES}
                            selected={styleInput}
                            onSelect={handleStyleSelect}
                            className="border-none"
                        />
                    </div>
                </div>

                {/* Font Size */}
                <div className="flex flex-col gap-2">
                    <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider px-1">Size:</span>
                    <div className="flex flex-col h-40 md:h-48 border border-slate-200 rounded-xl bg-white overflow-hidden shadow-soft">
                        <input 
                            type="text" 
                            className="w-full h-9 px-3 border-b border-slate-100 text-[13px] font-medium text-slate-800 outline-none focus:bg-slate-50 text-center"
                            value={sizeInput}
                            onChange={(e) => { setSizeInput(e.target.value); onChange('fontSize', parseInt(e.target.value) || 11); }}
                        />
                        <ScrollableList 
                            items={FONT_SIZES}
                            selected={style.fontSize || 11}
                            onSelect={(val) => { setSizeInput(String(val)); onChange('fontSize', val); }}
                            className="border-none text-center"
                        />
                    </div>
                </div>
            </div>

            {/* Middle: Selectors and Effects */}
            <div className={cn("grid gap-8 items-start", isMobile ? "grid-cols-1" : "grid-cols-[1fr_1.2fr]")}>
                <div className="flex flex-col gap-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ModernSelect 
                            label="Underline:"
                            value={style.underline ? 'single' : 'none'}
                            options={UNDERLINE_OPTIONS}
                            onChange={(val) => onChange('underline', val !== 'none')}
                        />
                        <div className="flex flex-col gap-1.5">
                            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider px-1">Color:</span>
                            <div className="flex gap-1.5 p-1 bg-white border border-slate-200 rounded-lg h-9 items-center justify-center">
                                <div className="w-5 h-5 rounded-md border border-slate-100 shadow-sm flex-shrink-0" style={{ backgroundColor: style.color || '#000000' }} />
                                <div className="w-[1px] h-4 bg-slate-100" />
                                <div className="flex-1 flex gap-1 overflow-x-auto no-scrollbar justify-center">
                                    {COLORS.slice(0, 8).map(c => (
                                        <button 
                                            key={c}
                                            onClick={() => onChange('color', c)}
                                            className={cn(
                                                "w-4 h-4 rounded-full border border-slate-200 hover:scale-125 transition-transform",
                                                style.color === c && "ring-1 ring-primary-500 ring-offset-1"
                                            )}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <GroupBox label="Effects">
                        <div className="grid grid-cols-1 gap-4">
                            {[
                                { key: 'strikethrough', label: 'Strikethrough' },
                                { key: 'superscript', label: 'Superscript', disabled: true },
                                { key: 'subscript', label: 'Subscript', disabled: true }
                            ].map(effect => (
                                <label key={effect.key} className={cn("flex items-center gap-3 cursor-pointer group", effect.disabled && "opacity-40 cursor-default")}>
                                    <div className={cn(
                                        "w-5 h-5 rounded border flex items-center justify-center transition-all",
                                        !!(style as any)[effect.key] ? "bg-primary-600 border-primary-600 shadow-sm" : "bg-white border-slate-300 group-hover:border-primary-400"
                                    )}>
                                        {!!(style as any)[effect.key] && <Check size={12} className="text-white stroke-[3]" />}
                                        <input 
                                            type="checkbox" 
                                            className="sr-only" 
                                            checked={!!(style as any)[effect.key]} 
                                            onChange={(e) => !effect.disabled && onChange(effect.key as any, e.target.checked)} 
                                        />
                                    </div>
                                    <span className="text-[13px] font-medium text-slate-700 group-hover:text-slate-900">{effect.label}</span>
                                </label>
                            ))}
                        </div>
                    </GroupBox>
                </div>

                {/* Preview Panel */}
                <div className="flex flex-col gap-2 h-full">
                    <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider px-1">Preview:</span>
                    <div className="flex-1 min-h-[140px] bg-slate-50 border border-slate-200 rounded-[24px] p-8 flex items-center justify-center text-center relative overflow-hidden shadow-inner group">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.03),transparent_70%)]" />
                        <span 
                            style={{ 
                                fontFamily: style.fontFamily || 'Inter',
                                fontSize: `${Math.min(32, (style.fontSize || 11) * 1.5)}px`,
                                fontWeight: style.bold ? 'bold' : 'normal',
                                fontStyle: style.italic ? 'italic' : 'normal',
                                textDecoration: style.underline ? 'underline' : 'none',
                                color: style.color || '#000000',
                                textDecorationLine: style.strikethrough ? 'line-through' : (style.underline ? 'underline' : 'none'),
                                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                            }}
                            className="relative z-10 break-all leading-tight"
                        >
                            AaBbCcYyZz
                        </span>
                        <div className="absolute bottom-3 right-6 text-[10px] text-slate-300 font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Visual Engine 3.0</div>
                    </div>
                    <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3 mt-1">
                        <Info size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
                        <p className="text-[11px] text-blue-700 leading-relaxed font-medium">
                            This is a TrueType font. The same font will be used on both your printer and your screen.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FillTab = ({ style, onChange, isMobile }: { style: CellStyle, onChange: any, isMobile: boolean }) => (
    <div className="flex flex-col gap-6 h-full">
        <GroupBox label="Background Color">
            <div className={cn("grid gap-2 p-2", isMobile ? "grid-cols-5" : "grid-cols-10")}>
                {COLORS.map(c => (
                    <button
                        key={c}
                        className={cn(
                            "w-8 h-8 rounded-lg border border-slate-200 transition-all hover:scale-110 active:scale-95 shadow-sm",
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
                <div className="w-6 h-6 rounded-lg border-2 border-slate-200 flex items-center justify-center bg-white mt-1 group-hover:border-primary-500 transition-all">
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
            <label className="flex items-start gap-4 p-5 rounded-[24px] bg-slate-50 border border-slate-100 cursor-pointer group hover:bg-white hover:shadow-xl transition-all">
                <div className="w-6 h-6 rounded-lg border-2 border-slate-200 flex items-center justify-center bg-white mt-1 group-hover:border-primary-500 transition-all">
                    <input 
                        type="checkbox" 
                        className="w-4 h-4 accent-primary-600"
                        checked={!!style.protection?.hidden} 
                        onChange={(e) => onChange('protection', { ...(style.protection || {}), hidden: e.target.checked })} 
                    />
                </div>
                <div className="flex flex-col">
                    <span className="text-base font-black text-slate-800">Hidden</span>
                    <span className="text-[13px] text-slate-500 mt-1 font-medium">Hides formulas from the formula bar in protected sheets.</span>
                </div>
            </label>
        </div>
    </div>
);

const FormatCellsDialog: React.FC<FormatCellsDialogProps> = ({ isOpen, onClose, initialStyle, onApply }) => {
  const [activeTab, setActiveTab] = useState('Number');
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
            setPosition({ 
                x: Math.max(0, (window.innerWidth - 720) / 2), 
                y: Math.max(0, (window.innerHeight - 740) / 2) 
            });
          }
          setActiveTab('Font'); 
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
    ? "fixed inset-x-4 top-[10vh] h-[80vh] max-h-[80vh] rounded-[32px] shadow-[0_40px_100px_-10px_rgba(0,0,0,0.5)] z-[2001] bg-white flex flex-col overflow-hidden border border-slate-100" 
    : "fixed w-[720px] h-[740px] rounded-[40px] shadow-[0_30px_100px_-20px_rgba(15,23,42,0.4)] z-[2001] bg-white border border-slate-200 overflow-hidden flex flex-col";

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/60 backdrop-blur-md pointer-events-auto">
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    initial={isMobile ? { y: '50%', opacity: 0, scale: 0.95 } : { scale: 0.9, opacity: 0 }}
                    animate={isMobile ? { y: 0, opacity: 1, scale: 1 } : { scale: 1, opacity: 1, x: position.x, y: position.y }}
                    exit={isMobile ? { y: '50%', opacity: 0, scale: 0.95 } : { scale: 0.9, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className={cn(floatingClass, !isMobile && "fixed m-0")}
                    style={!isMobile ? { left: 0, top: 0, position: 'fixed' } : {}}
                >
                    {/* Floating Title Bar */}
                    <div 
                        ref={dragRef}
                        className={cn(
                            "h-20 flex items-center justify-between px-8 md:px-10 select-none flex-shrink-0 relative",
                            !isMobile ? "cursor-move" : ""
                        )}
                        onMouseDown={(e) => {
                            if (!isMobile && (e.target === dragRef.current || (e.target as HTMLElement).tagName === 'SPAN' || (e.target as HTMLElement).tagName === 'DIV')) {
                                setIsDragging(true);
                            }
                        }}
                    >
                        {isMobile && <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-slate-200 rounded-full opacity-50" />}
                        <div className="flex items-center gap-4 mt-2">
                             <div className="w-10 h-10 rounded-2xl bg-primary-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/30">
                                <Type size={20} className="stroke-[2.5]" />
                             </div>
                             <div className="flex flex-col">
                                <span className="text-[17px] font-black text-slate-900 tracking-tight">Format Cells</span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Cell Identity & Styles</span>
                             </div>
                        </div>
                        <button onClick={onClose} className="mt-2 w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-all active:scale-90">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Modern Navigation */}
                    <div className="px-6 md:px-10 py-1 flex-shrink-0">
                        <div className="flex bg-slate-50/50 p-1.5 rounded-[22px] gap-1 overflow-x-auto no-scrollbar border border-slate-100 shadow-inner">
                            {TABS.map(tab => {
                                const active = activeTab === tab;
                                return (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={cn(
                                            "flex-1 px-4 md:px-5 py-2.5 md:py-3 text-[12px] md:text-[13px] font-black rounded-[18px] transition-all whitespace-nowrap",
                                            active 
                                                ? "bg-white text-primary-700 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-slate-100 scale-[1.02]" 
                                                : "text-slate-400 hover:text-slate-600 hover:bg-white/40"
                                        )}
                                    >
                                        {tab}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 bg-white px-6 md:px-10 py-6 md:py-8 overflow-y-auto scrollbar-thin">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
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

                    {/* High-Fidelity Footer */}
                    <div className="h-24 md:h-28 border-t border-slate-100 bg-slate-50/50 backdrop-blur-xl flex items-center justify-end px-6 md:px-10 gap-3 md:gap-5 flex-shrink-0 pb-2 md:pb-4">
                        <button 
                            onClick={onClose} 
                            className="px-6 md:px-8 py-3 rounded-2xl text-[13px] md:text-[14px] font-bold text-slate-400 hover:text-slate-900 transition-all active:scale-95"
                        >
                            Discard
                        </button>
                        <button 
                            onClick={handleApply} 
                            className="px-10 md:px-14 py-3 bg-slate-900 rounded-[22px] text-[13px] md:text-[14px] font-black text-white hover:bg-slate-800 shadow-2xl shadow-slate-900/20 active:scale-95 transition-all"
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

const BorderTab = ({ style, onChange, isMobile }: { style: CellStyle, onChange: any, isMobile: boolean }) => (
    <div className="flex flex-col gap-6 h-full justify-center items-center text-center px-4 md:px-6">
        <div className="w-20 h-20 md:w-24 md:h-24 bg-slate-50 rounded-[32px] flex items-center justify-center text-slate-200 border-2 border-dashed border-slate-100">
             <Info size={isMobile ? 40 : 48} strokeWidth={1} />
        </div>
        <div>
            <h3 className="text-[17px] md:text-[19px] font-black text-slate-800 tracking-tight">Style Borders</h3>
            <p className="text-[12px] md:text-[14px] text-slate-500 mt-2 leading-relaxed font-medium">
                Advanced border customizer is in development.<br/>Use Home tab for rapid borders.
            </p>
        </div>
    </div>
);

export default FormatCellsDialog;