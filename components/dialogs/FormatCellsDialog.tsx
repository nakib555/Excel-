
import React, { useState, useEffect, useRef } from 'react';
import { X, Lock, Info, ChevronDown, Check, MousePointer2 } from 'lucide-react';
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

const DATE_TYPES = [
    '*3/14/2012',
    'Wednesday, March 14, 2012',
    '2012-03-14',
    '3-14-12',
    '03-14-12',
    '14-Mar-12',
    '14-Mar'
];

const TIME_TYPES = [
    '*1:30:55 PM',
    '13:30:55',
    '1:30 PM',
    '13:30',
    '30:55.2',
];

const FRACTION_TYPES = [
    'Up to one digit (1/4)',
    'Up to two digits (21/25)',
    'Up to three digits (312/943)',
    'As halves (1/2)',
    'As quarters (2/4)',
    'As eighths (4/8)',
    'As sixteenths (8/16)'
];

const SPECIAL_TYPES = [
    'ZIP Code',
    'ZIP Code + 4',
    'Phone Number',
    'Social Security Number'
];

const CUSTOM_TYPES = [
    'General',
    '0',
    '0.00',
    '#,##0',
    '#,##0.00',
    '_($* #,##0_);_($* (#,##0);_($* "-"_);_(@_)',
    'mm-dd-yy',
    'd-mmm-yy',
    'd-mmm',
    'mmm-yy',
    'h:mm AM/PM',
    'h:mm:ss AM/PM',
    'h:mm',
    'h:mm:ss',
    'm/d/yyyy h:mm',
];

const NEGATIVE_NUMBERS = [
    { label: '1234.10', color: 'black', value: 'black' },
    { label: '-1234.10', color: 'red', value: 'red' },
    { label: '(1234.10)', color: 'black', value: 'paren_black' },
    { label: '(1234.10)', color: 'red', value: 'paren_red' }
];

const COLORS = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#00FFFF', '#FF00FF',
    '#800000', '#008000', '#000080', '#808000', '#800080', '#008080', '#C0C0C0', '#808080',
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

const TEXT_DIRECTION_OPTIONS = [
    { value: 'context', label: 'Context' },
    { value: 'ltr', label: 'Left-to-Right' },
    { value: 'rtl', label: 'Right-to-Left' },
];

const CURRENCY_SYMBOL_OPTIONS = [
    { value: 'USD', label: '$ English (United States)' },
    { value: 'None', label: 'None' },
    { value: 'GBP', label: '£ English (United Kingdom)' },
    { value: 'EUR', label: '€ Euro' },
    { value: 'CNY', label: '¥ Chinese' },
];

// Reusable components for the dialog
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
        <div ref={containerRef} className={cn("relative", className)}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full h-9 bg-white border border-slate-200 rounded-lg px-3 text-[12px] text-slate-800 flex items-center justify-between hover:border-primary-400 hover:shadow-sm transition-all focus:ring-2 focus:ring-primary-100"
            >
                <span className="truncate">{selectedLabel}</span>
                <ChevronDown size={14} className={cn("text-slate-400 transition-transform duration-200", isOpen && "rotate-180")} />
            </button>
            {isOpen && (
                <div className="absolute top-full left-0 w-full mt-1 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl shadow-xl z-[1100] max-h-60 overflow-auto py-1 animate-in fade-in zoom-in-95 duration-150 ring-1 ring-black/5">
                    {options.map(option => (
                        <div
                            key={option.value}
                            onClick={() => { onChange(option.value); setIsOpen(false); }}
                            className={cn(
                                "px-4 py-2 text-[12px] cursor-pointer hover:bg-primary-50 text-slate-700 transition-colors flex items-center justify-between",
                                option.value === value && "bg-primary-600 text-white hover:bg-primary-700"
                            )}
                        >
                            <span>{option.label}</span>
                            {option.value === value && <Check size={12} />}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const GroupBox = ({ label, children, className }: { label: string, children?: React.ReactNode, className?: string }) => (
    <div className={cn("border border-slate-200 rounded-xl p-5 relative pt-7 mt-4 bg-white/30 backdrop-blur-sm shadow-sm", className)}>
        <span className="absolute -top-3 left-4 bg-slate-50 border border-slate-200 rounded-full px-3 py-0.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
        {children}
    </div>
);

const NumberTab = ({ style, onChange, isMobile }: { style: CellStyle, onChange: any, isMobile: boolean }) => {
    const activeCat = style.format || 'general';
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
    const [selectedNegative, setSelectedNegative] = useState(NEGATIVE_NUMBERS[0].label);
    const [selectedType, setSelectedType] = useState<string>('');

    const handleCatChange = (cat: string) => {
        const map: any = {
            'General': 'general', 'Number': 'number', 'Currency': 'currency', 'Accounting': 'accounting',
            'Date': 'shortDate', 'Time': 'time', 'Percentage': 'percent', 'Fraction': 'fraction',
            'Scientific': 'scientific', 'Text': 'text'
        };
        if (map[cat]) onChange('format', map[cat]);
    };

    const descriptions: Record<string, string> = {
        'General': 'General format cells have no specific number format.',
        'Number': 'Number is used for general display of numbers. Currency and Accounting offer specialized formatting for monetary value.',
        'Currency': 'Currency formats are used for general monetary values. Use Accounting formats to align decimal points in a column.',
        'Accounting': 'Accounting formats line up the currency symbols and decimal points in a column.',
        'Date': 'Date formats display date and time serial numbers as date values.',
        'Time': 'Time formats display date and time serial numbers as date values.',
        'Percentage': 'Percentage formats multiply the cell value by 100 and display the result with a percent symbol.',
        'Fraction': 'Fraction formats display numbers as fractions based on the selected type.',
        'Scientific': 'Scientific formats display numbers in exponential notation.',
        'Text': 'Text format cells are treated as text even when a number is in the cell.',
        'Special': 'Special formats are useful for tracking list and database values.',
        'Custom': 'Type the number format code, using one of the existing codes as a starting point.'
    };

    return (
        <div className={cn("flex h-full", isMobile ? "flex-col gap-6" : "gap-8")}>
            <div className={cn("flex flex-col gap-2", isMobile ? "w-full" : "w-[180px]")}>
                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider px-1">Category:</span>
                <ScrollableList 
                    items={CATEGORIES}
                    selected={selectedCat}
                    onSelect={handleCatChange}
                    className="flex-1 min-h-[300px] border-slate-100"
                />
            </div>
            
            <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-1">
                <div className="flex flex-col gap-2">
                    <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider px-1">Preview</span>
                    <div className="h-14 bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-xl flex items-center px-5 text-base text-slate-900 font-mono shadow-inner group">
                        {style.format === 'currency' ? `${style.currencySymbol || '$'}1,234.56` : '1234.56'}
                        <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                            <Info size={14} className="text-slate-300" />
                        </div>
                    </div>
                </div>

                <div className="flex-1 flex flex-col gap-5">
                    {(selectedCat === 'Number' || selectedCat === 'Currency' || selectedCat === 'Accounting' || selectedCat === 'Percentage' || selectedCat === 'Scientific') && (
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-wrap items-end gap-6">
                                <div className="flex flex-col gap-2">
                                    <span className="text-[12px] text-slate-600 font-medium">Decimals:</span>
                                    <input 
                                        type="number" 
                                        className="w-24 h-9 border border-slate-200 rounded-lg px-3 text-[13px] outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-400 transition-all shadow-sm" 
                                        value={style.decimalPlaces ?? 2}
                                        onChange={(e) => onChange('decimalPlaces', parseInt(e.target.value) || 0)}
                                        min={0} max={30}
                                    />
                                </div>
                                {(selectedCat === 'Currency' || selectedCat === 'Accounting') && (
                                    <div className="flex flex-col gap-2 flex-1 min-w-[140px]">
                                        <span className="text-[12px] text-slate-600 font-medium">Symbol:</span>
                                        <ModernSelect 
                                            value={style.currencySymbol || 'USD'}
                                            options={CURRENCY_SYMBOL_OPTIONS}
                                            onChange={(val) => onChange('currencySymbol', val)}
                                        />
                                    </div>
                                )}
                            </div>
                            {selectedCat === 'Number' && (
                                <label className="flex items-center gap-3 cursor-pointer group w-fit">
                                    <div className="w-5 h-5 rounded border border-slate-300 flex items-center justify-center bg-white group-hover:border-primary-400 transition-all">
                                        <input type="checkbox" className="w-3.5 h-3.5 rounded-sm accent-primary-600" defaultChecked />
                                    </div>
                                    <span className="text-[13px] text-slate-700 group-hover:text-slate-900">Use 1000 Separator (,)</span>
                                </label>
                            )}
                        </div>
                    )}

                    {(selectedCat === 'Date' || selectedCat === 'Time' || selectedCat === 'Fraction' || selectedCat === 'Special' || selectedCat === 'Custom') && (
                        <div className="flex flex-col gap-3 flex-1">
                            <span className="text-[12px] text-slate-600 font-medium px-1">Type:</span>
                            {selectedCat === 'Custom' && (
                                <input 
                                    type="text" 
                                    className="w-full h-9 border border-slate-200 rounded-lg px-4 text-[13px] font-mono outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-400 shadow-sm mb-1"
                                    placeholder="Format code..."
                                    defaultValue="General"
                                />
                            )}
                            <ScrollableList 
                                items={
                                    selectedCat === 'Date' ? DATE_TYPES : 
                                    selectedCat === 'Time' ? TIME_TYPES : 
                                    selectedCat === 'Fraction' ? FRACTION_TYPES : 
                                    selectedCat === 'Special' ? SPECIAL_TYPES : CUSTOM_TYPES
                                }
                                selected={selectedType}
                                onSelect={setSelectedType}
                                className="flex-1 min-h-[200px]"
                            />
                        </div>
                    )}
                    
                    <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100 mt-auto">
                        <p className="text-[12px] text-slate-500 leading-relaxed italic">
                            {descriptions[selectedCat] || descriptions['General']}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AlignmentTab = ({ style, onChange, isMobile }: { style: CellStyle, onChange: any, isMobile: boolean }) => {
    const indentEnabled = style.align === 'left' || style.align === 'right' || style.align === 'distributed';
    
    return (
        <div className={cn("grid h-full", isMobile ? "grid-cols-1 gap-6" : "grid-cols-[1fr_240px] gap-8")}>
            <div className="flex flex-col gap-4">
                <GroupBox label="Text alignment">
                    <div className="grid gap-5">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <span className="text-[12px] text-slate-500 font-medium">Horizontal:</span>
                                {indentEnabled && (
                                    <div className="flex items-center gap-3">
                                        <span className="text-[11px] text-slate-400 font-bold uppercase">Indent:</span>
                                        <input 
                                            type="number" 
                                            className="w-16 h-7 bg-white border border-slate-200 rounded-md px-2 text-[12px] font-mono outline-none shadow-sm focus:ring-2 focus:ring-primary-100 focus:border-primary-400"
                                            value={style.indent || 0}
                                            onChange={(e) => onChange('indent', parseInt(e.target.value) || 0)}
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
                            <span className="text-[12px] text-slate-500 font-medium">Vertical:</span>
                            <ModernSelect 
                                value={style.verticalAlign || 'bottom'}
                                options={VERTICAL_ALIGN_OPTIONS}
                                onChange={(val) => onChange('verticalAlign', val)}
                            />
                        </div>
                    </div>
                </GroupBox>

                <GroupBox label="Text control">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 py-1">
                        {[
                            { key: 'wrapText', label: 'Wrap text' },
                            { key: 'shrinkToFit', label: 'Shrink to fit' },
                            { key: 'mergeCells', label: 'Merge cells' }
                        ].map(item => (
                            <label key={item.key} className="flex items-center gap-3 cursor-pointer group">
                                <div className={cn(
                                    "w-5 h-5 rounded border flex items-center justify-center transition-all",
                                    !!(style as any)[item.key] ? "bg-primary-600 border-primary-600 shadow-sm" : "bg-white border-slate-300 group-hover:border-primary-400"
                                )}>
                                    {!!(style as any)[item.key] && <Check size={12} className="text-white" />}
                                    <input 
                                        type="checkbox" 
                                        className="sr-only" 
                                        checked={!!(style as any)[item.key]} 
                                        onChange={(e) => {
                                            // Excel Logic: Wrap Text and Shrink to Fit are mutually exclusive
                                            if (item.key === 'wrapText' && e.target.checked) onChange('shrinkToFit', false);
                                            if (item.key === 'shrinkToFit' && e.target.checked) onChange('wrapText', false);
                                            onChange(item.key as any, e.target.checked);
                                        }} 
                                    />
                                </div>
                                <span className="text-[13px] text-slate-700 whitespace-nowrap">{item.label}</span>
                            </label>
                        ))}
                    </div>
                </GroupBox>

                <GroupBox label="Right-to-left">
                    <div className="flex flex-col gap-2">
                        <span className="text-[12px] text-slate-500 font-medium">Text direction:</span>
                        <ModernSelect 
                            value={style.textDirection || 'context'}
                            options={TEXT_DIRECTION_OPTIONS}
                            onChange={(val) => onChange('textDirection', val)}
                        />
                    </div>
                </GroupBox>
            </div>

            <GroupBox label="Orientation" className="flex flex-col">
                <div className="flex-1 flex flex-col items-center justify-center gap-6 py-4">
                    {/* The "Clock" UI */}
                    <div className="relative w-40 h-40 rounded-full border border-slate-200 bg-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.03)] flex items-center justify-center group/orient">
                        {/* Tick Marks */}
                        {[...Array(12)].map((_, i) => (
                            <div key={i} className="absolute h-full w-[1px]" style={{ transform: `rotate(${i * 30}deg)` }}>
                                <div className={cn("w-full h-2 rounded-full", i % 3 === 0 ? "bg-slate-300" : "bg-slate-100")} />
                            </div>
                        ))}
                        
                        {/* Vertical Text Guide */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                            <div className="w-10 h-[80%] border-2 border-slate-400 rounded-md flex flex-col items-center justify-center gap-1 font-mono text-[8px] font-bold">
                                <span>T</span><span>E</span><span>X</span><span>T</span>
                            </div>
                        </div>

                        {/* Hand Shadow */}
                        <div 
                            className="absolute h-[2px] w-[45%] bg-slate-100 origin-left top-1/2 left-1/2 pointer-events-none blur-[1px]"
                            style={{ transform: `rotate(${(style.textRotation || 0) * -1}deg)` }}
                        />

                        {/* Interactive Hand */}
                        <div 
                            className="absolute h-[3px] w-[45%] bg-primary-500 origin-left top-1/2 left-1/2 transition-transform duration-300 ease-out shadow-glow rounded-full z-20"
                            style={{ transform: `rotate(${(style.textRotation || 0) * -1}deg)` }}
                        >
                             <div className="absolute -right-2 -top-1.5 w-4 h-4 bg-primary-600 border-2 border-white rounded-full shadow-lg ring-2 ring-primary-500/20 cursor-grab active:cursor-grabbing" />
                        </div>

                        {/* Rotation Axis */}
                        <div className="w-2.5 h-2.5 bg-slate-400 rounded-full z-30 border-2 border-white shadow-sm" />

                        {/* Degree Badge */}
                        <div className="absolute -top-3 right-0 bg-white border border-slate-200 px-2 py-1 rounded-lg text-[14px] font-bold text-primary-700 shadow-sm animate-in zoom-in-75 duration-300">
                            {style.textRotation || 0}°
                        </div>

                        {/* Degrees Legend */}
                        <div className="absolute left-1/2 top-2 -translate-x-1/2 text-[9px] font-bold text-slate-300 tracking-widest">90°</div>
                        <div className="absolute left-1/2 bottom-2 -translate-x-1/2 text-[9px] font-bold text-slate-300 tracking-widest">-90°</div>
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-300 tracking-widest">0°</div>
                    </div>

                    <div className="flex flex-col items-center gap-4 w-full">
                        <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-100 w-full justify-between shadow-inner">
                            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider ml-2">Degrees</span>
                            <div className="flex items-center">
                                <input 
                                    type="number" 
                                    className="w-16 h-8 bg-white border border-slate-200 rounded-lg text-center text-[14px] font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary-100 transition-all shadow-sm"
                                    value={style.textRotation || 0}
                                    onChange={(e) => onChange('textRotation', Math.max(-90, Math.min(90, parseInt(e.target.value) || 0)))}
                                    min={-90} max={90}
                                />
                                <div className="flex flex-col ml-1">
                                    <button 
                                        onClick={() => onChange('textRotation', Math.min(90, (style.textRotation || 0) + 1))}
                                        className="p-0.5 hover:text-primary-600 transition-colors"
                                    >
                                        <ChevronDown size={14} className="rotate-180" />
                                    </button>
                                    <button 
                                        onClick={() => onChange('textRotation', Math.max(-90, (style.textRotation || 0) - 1))}
                                        className="p-0.5 hover:text-primary-600 transition-colors"
                                    >
                                        <ChevronDown size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <input 
                            type="range" min="-90" max="90" 
                            value={style.textRotation || 0}
                            onChange={(e) => onChange('textRotation', parseInt(e.target.value))}
                            className="w-full accent-primary-600 cursor-pointer hover:accent-primary-700 transition-all"
                        />
                    </div>
                </div>
            </GroupBox>
        </div>
    );
};

const FontTab = ({ style, onChange, isMobile }: { style: CellStyle, onChange: any, isMobile: boolean }) => (
    <div className="flex flex-col gap-6 h-full">
        <div className={cn("grid gap-4", isMobile ? "grid-cols-1" : "grid-cols-[1fr_140px_80px]")}>
            <div className="flex flex-col gap-2">
                <span className="text-[11px] text-slate-400 font-bold uppercase px-1">Font</span>
                <ScrollableList 
                    items={['Inter', 'Calibri', 'Arial', 'Times New Roman', 'JetBrains Mono', 'Segoe UI', 'Verdana']}
                    selected={style.fontFamily || 'Inter'}
                    onSelect={(val) => onChange('fontFamily', val)}
                    className="h-36"
                />
            </div>
            <div className="flex flex-col gap-2">
                <span className="text-[11px] text-slate-400 font-bold uppercase px-1">Style</span>
                <ScrollableList 
                    items={['Regular', 'Italic', 'Bold', 'Bold Italic']}
                    selected={style.bold && style.italic ? 'Bold Italic' : style.bold ? 'Bold' : style.italic ? 'Italic' : 'Regular'}
                    onSelect={(s) => { onChange('bold', s.includes('Bold')); onChange('italic', s.includes('Italic')); }}
                    className="h-36"
                />
            </div>
            <div className="flex flex-col gap-2">
                <span className="text-[11px] text-slate-400 font-bold uppercase px-1">Size</span>
                <ScrollableList 
                    items={[8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 36, 48, 72]}
                    selected={style.fontSize || 11}
                    onSelect={(val) => onChange('fontSize', val)}
                    className="h-36"
                />
            </div>
        </div>
        <GroupBox label="Appearance">
            <div className="flex flex-wrap items-center gap-8 py-1">
                <div className="flex flex-col gap-2">
                    <span className="text-[12px] text-slate-500 font-medium">Text Color:</span>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg border border-slate-200 shadow-sm" style={{ backgroundColor: style.color || '#000' }} />
                        <ModernSelect 
                            value={style.color || '#000000'}
                            options={COLORS.map(c => ({ value: c, label: c }))}
                            onChange={(val) => onChange('color', val)}
                            className="w-40"
                        />
                    </div>
                </div>
                <div className="flex flex-col gap-3">
                    {['underline', 'strikethrough'].map(key => (
                        <label key={key} className="flex items-center gap-3 cursor-pointer group">
                            <div className="w-5 h-5 rounded border border-slate-300 flex items-center justify-center bg-white group-hover:border-primary-400 transition-all">
                                <input type="checkbox" className="w-3.5 h-3.5 accent-primary-600" checked={!!(style as any)[key]} onChange={(e) => onChange(key as any, e.target.checked)} />
                            </div>
                            <span className="text-[13px] text-slate-700 capitalize">{key}</span>
                        </label>
                    ))}
                </div>
            </div>
        </GroupBox>
    </div>
);

const FillTab = ({ style, onChange, isMobile }: { style: CellStyle, onChange: any, isMobile: boolean }) => (
    <div className="flex flex-col gap-6 h-full">
        <GroupBox label="Background Color">
            <div className="grid grid-cols-6 md:grid-cols-10 gap-2 p-2">
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
        <div className="flex items-center gap-4 px-2">
            <button 
                onClick={() => onChange('bg', 'transparent')} 
                className="px-6 py-2 rounded-xl bg-slate-100 text-[12px] font-bold text-slate-600 hover:bg-slate-200 transition-all active:scale-95 border border-slate-200"
            >
                No Color
            </button>
            <div className="text-[11px] text-slate-400 italic">Select a color to apply as a fill background to your selection.</div>
        </div>
    </div>
);

const ProtectionTab = ({ style, onChange, isMobile }: { style: CellStyle, onChange: any, isMobile: boolean }) => (
    <div className="flex flex-col gap-6 h-full py-4">
        <div className="grid gap-6">
            <label className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer group hover:bg-white hover:shadow-elevation transition-all">
                <div className="w-6 h-6 rounded border border-slate-300 flex items-center justify-center bg-white mt-1 group-hover:border-primary-500">
                    <input 
                        type="checkbox" 
                        className="w-4 h-4 accent-primary-600"
                        checked={style.protection?.locked !== false} 
                        onChange={(e) => onChange('protection', { ...(style.protection || {}), locked: e.target.checked })} 
                    />
                </div>
                <div className="flex flex-col">
                    <span className="text-[15px] font-bold text-slate-800 flex items-center gap-2">
                        <Lock size={16} className="text-primary-600" />
                        Locked
                    </span>
                    <span className="text-[13px] text-slate-500 mt-1">Prevents cells from being edited when the sheet is protected.</span>
                </div>
            </label>
            <label className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer group hover:bg-white hover:shadow-elevation transition-all">
                <div className="w-6 h-6 rounded border border-slate-300 flex items-center justify-center bg-white mt-1 group-hover:border-primary-500">
                    <input 
                        type="checkbox" 
                        className="w-4 h-4 accent-primary-600"
                        checked={!!style.protection?.hidden} 
                        onChange={(e) => onChange('protection', { ...(style.protection || {}), hidden: e.target.checked })} 
                    />
                </div>
                <div className="flex flex-col">
                    <span className="text-[15px] font-bold text-slate-800">Hidden</span>
                    <span className="text-[13px] text-slate-500 mt-1">Hides formulas from the formula bar when the sheet is protected.</span>
                </div>
            </label>
        </div>
        <div className="mt-auto bg-amber-50 rounded-2xl p-5 border border-amber-100 flex gap-4 items-start">
            <Info size={20} className="text-amber-500 mt-1 flex-shrink-0" />
            <p className="text-[12px] text-amber-700 leading-relaxed font-medium">
                Note: Protection features (Locking/Hiding) will only take effect after you protect the worksheet using the "Protect Sheet" button in the Review tab.
            </p>
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
                x: Math.max(0, (window.innerWidth - 640) / 2), 
                y: Math.max(0, (window.innerHeight - 620) / 2) 
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
    ? "fixed bottom-0 left-0 right-0 h-[85vh] w-full rounded-t-3xl shadow-2xl z-[2001] bg-white border-t border-slate-200 animate-in slide-in-from-bottom-full duration-500 flex flex-col" 
    : "fixed w-[640px] h-[640px] rounded-3xl shadow-2xl z-[2001] bg-white border border-slate-200 overflow-hidden flex flex-col";

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm pointer-events-auto">
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    initial={isMobile ? { y: '100%' } : { scale: 0.95, opacity: 0 }}
                    animate={isMobile ? { y: 0 } : { scale: 1, opacity: 1, x: position.x, y: position.y }}
                    exit={isMobile ? { y: '100%' } : { scale: 0.95, opacity: 0 }}
                    className={cn(floatingClass, !isMobile && "fixed m-0")}
                    style={!isMobile ? { left: 0, top: 0, position: 'fixed' } : {}}
                >
                    {/* Floating Title Bar */}
                    <div 
                        ref={dragRef}
                        className={cn(
                            "h-14 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-6 select-none flex-shrink-0",
                            !isMobile && "cursor-move"
                        )}
                        onMouseDown={(e) => {
                            if (!isMobile && (e.target === dragRef.current || (e.target as HTMLElement).tagName === 'SPAN')) {
                                setIsDragging(true);
                            }
                        }}
                    >
                        <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600">
                                <Lock size={16} />
                             </div>
                             <span className="text-[15px] font-bold text-slate-800">Format Cells</span>
                        </div>
                        <button onClick={onClose} className="text-slate-400 hover:text-rose-500 p-2 rounded-full hover:bg-rose-50 transition-all active:scale-90">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Modern Tabs Navigation */}
                    <div className="flex bg-slate-50/50 border-b border-slate-100 px-4 py-2 gap-2 overflow-x-auto no-scrollbar scroll-smooth flex-shrink-0">
                        {TABS.map(tab => {
                            const active = activeTab === tab;
                            return (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={cn(
                                        "px-5 py-2.5 text-[13px] font-bold rounded-xl transition-all whitespace-nowrap",
                                        active 
                                            ? "bg-white text-primary-700 shadow-sm border border-slate-200 scale-105" 
                                            : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
                                    )}
                                >
                                    {tab}
                                </button>
                            );
                        })}
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 bg-white p-6 md:p-8 overflow-y-auto scrollbar-thin">
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

                    {/* Action Bar */}
                    <div className="h-20 border-t border-slate-100 bg-slate-50/80 backdrop-blur-md flex items-center justify-end px-8 gap-4 flex-shrink-0">
                        <button 
                            onClick={onClose} 
                            className="px-6 py-2.5 rounded-xl text-[13px] font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-all active:scale-95"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleApply} 
                            className="px-10 py-2.5 bg-primary-600 rounded-xl text-[13px] font-bold text-white hover:bg-primary-700 hover:shadow-glow shadow-md active:scale-95 transition-all"
                        >
                            Apply Formatting
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
};

const BorderTab = ({ style, onChange, isMobile }: { style: CellStyle, onChange: any, isMobile: boolean }) => (
    <div className="flex flex-col gap-6 h-full justify-center items-center text-center px-6">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
             <Info size={40} />
        </div>
        <div>
            <h3 className="text-[17px] font-bold text-slate-800">Advanced Borders Coming Soon</h3>
            <p className="text-[13px] text-slate-500 mt-2 leading-relaxed">
                We're currently refining the advanced border system to match Excel's high standards. For now, use the grid border settings in the Home tab.
            </p>
        </div>
        <button className="px-6 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-slate-800 transition-all">
            Understood
        </button>
    </div>
);

export default FormatCellsDialog;
