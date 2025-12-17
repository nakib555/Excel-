
import React, { useState, useEffect, useRef } from 'react';
import { X, Lock, EyeOff, Minus, Check, ChevronDown, MoveRight, Merge as MergeIcon, Plus } from 'lucide-react';
import { CellStyle } from '../../types';
import { cn } from '../../utils';

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
    { label: '1234.10', color: 'red', value: 'red' },
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
        <div className={cn("border border-slate-200 bg-white overflow-y-auto flex flex-col h-full shadow-sm select-none rounded-sm", className)}>
            {items.map(item => {
                const isSelected = selected === item;
                return (
                    <div 
                        key={item} 
                        ref={isSelected ? selectedRef : null}
                        className={cn(
                            "px-3 py-1 text-[13px] cursor-pointer whitespace-nowrap transition-colors",
                            isSelected ? "bg-[#0067b8] text-white" : "text-slate-800 hover:bg-slate-100"
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
                className="w-full h-7 bg-white border border-slate-400 rounded-sm px-2 text-[12px] text-slate-800 flex items-center justify-between hover:border-slate-500 focus:ring-1 focus:ring-blue-400 transition-all shadow-sm"
            >
                <span className="truncate">{selectedLabel}</span>
                <ChevronDown size={12} className="text-slate-500" />
            </button>
            {isOpen && (
                <div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-300 rounded-sm shadow-xl z-[1100] max-h-60 overflow-auto py-1 animate-in fade-in zoom-in-95 duration-75">
                    {options.map(option => (
                        <div
                            key={option.value}
                            onClick={() => { onChange(option.value); setIsOpen(false); }}
                            className={cn(
                                "px-3 py-1.5 text-[12px] cursor-pointer hover:bg-slate-100 text-slate-800",
                                option.value === value && "bg-blue-50 font-medium"
                            )}
                        >
                            <span>{option.label}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const GroupBox = ({ label, children, className }: { label: string, children?: React.ReactNode, className?: string }) => (
    <div className={cn("border border-slate-300 rounded-sm p-4 relative pt-5 mt-2", className)}>
        <span className="absolute -top-2.5 left-2 bg-white px-1 text-[12px] font-medium text-slate-700">{label}</span>
        {children}
    </div>
);

const NumberTab = ({ style, onChange, isMobile }: { style: CellStyle, onChange: any, isMobile: boolean }) => {
    const activeCat = style.format || 'general';
    const getCategory = () => {
        if (!style.format || style.format === 'general') return 'General';
        const map: any = { 
            'number': 'Number', 'currency': 'Currency', 'accounting': 'Accounting', 
            'shortDate': 'Date', 'longDate': 'Date', 'time': 'Time', 
            'percent': 'Percentage', 'fraction': 'Fraction', 'scientific': 'Scientific', 
            'text': 'Text' 
        };
        return map[style.format] || 'Custom';
    };

    const [selectedCat, setSelectedCat] = useState(getCategory());
    const [selectedNegative, setSelectedNegative] = useState('black');
    const [selectedType, setSelectedType] = useState<string>('');

    const handleCatChange = (cat: string) => {
        setSelectedCat(cat);
        const map: any = {
            'General': 'general', 'Number': 'number', 'Currency': 'currency', 'Accounting': 'accounting',
            'Date': 'shortDate', 'Time': 'time', 'Percentage': 'percent', 'Fraction': 'fraction',
            'Scientific': 'scientific', 'Text': 'text'
        };
        if (map[cat]) onChange('format', map[cat]);
        
        if (cat === 'Date') setSelectedType(DATE_TYPES[0]);
        if (cat === 'Time') setSelectedType(TIME_TYPES[0]);
        if (cat === 'Fraction') setSelectedType(FRACTION_TYPES[0]);
        if (cat === 'Special') setSelectedType(SPECIAL_TYPES[0]);
        if (cat === 'Custom') setSelectedType(CUSTOM_TYPES[0]);
    };

    return (
        <div className={cn("flex h-full", isMobile ? "flex-col gap-4" : "gap-4")}>
            <div className={cn("flex flex-col gap-1", isMobile ? "w-full" : "w-[150px]")}>
                <span className="text-[12px] text-slate-700 font-medium">Category:</span>
                <ScrollableList 
                    items={CATEGORIES}
                    selected={selectedCat}
                    onSelect={handleCatChange}
                    className="flex-1"
                />
            </div>
            
            <div className="flex-1 flex flex-col gap-2 pt-5">
                <div className="flex flex-col gap-1">
                    <span className="text-[12px] text-slate-700">Sample</span>
                    <div className="h-8 bg-white border border-slate-300 rounded-sm flex items-center px-2 text-[13px] text-slate-800">
                        {style.format === 'currency' ? `${style.currencySymbol || '$'}1,234.56` : '1234.56'}
                    </div>
                </div>

                <div className="flex-1 flex flex-col pt-2">
                    {selectedCat === 'General' && (
                        <div className="text-[12px] text-slate-600 leading-relaxed">
                            General format cells have no specific number format.
                        </div>
                    )}

                    {(selectedCat === 'Number' || selectedCat === 'Currency') && (
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                                <span className="text-[12px] text-slate-700 w-28">Decimal places:</span>
                                <input 
                                    type="number" 
                                    className="w-16 h-7 border border-slate-300 rounded-sm px-2 text-[12px] outline-none" 
                                    value={style.decimalPlaces ?? 2}
                                    onChange={(e) => onChange('decimalPlaces', parseInt(e.target.value))}
                                    min={0}
                                />
                            </div>
                            
                            {selectedCat === 'Currency' && (
                                <div className="flex items-center gap-2">
                                    <span className="text-[12px] text-slate-700 w-28">Symbol:</span>
                                    <ModernSelect 
                                        value={style.currencySymbol || 'USD'}
                                        options={CURRENCY_SYMBOL_OPTIONS}
                                        onChange={(val) => onChange('currencySymbol', val)}
                                        className="w-48"
                                    />
                                </div>
                            )}

                            <div className="flex flex-col gap-1 mt-2">
                                <span className="text-[12px] text-slate-700">Negative numbers:</span>
                                <ScrollableList 
                                    items={NEGATIVE_NUMBERS.map(n => n.label)}
                                    selected={selectedNegative}
                                    onSelect={setSelectedNegative}
                                    className="h-24"
                                />
                            </div>
                        </div>
                    )}

                    {(selectedCat === 'Date' || selectedCat === 'Time') && (
                        <div className="flex flex-col gap-2 flex-1">
                            <span className="text-[12px] text-slate-700">Type:</span>
                            <ScrollableList 
                                items={selectedCat === 'Date' ? DATE_TYPES : TIME_TYPES}
                                selected={selectedType}
                                onSelect={setSelectedType}
                                className="flex-1"
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const AlignmentTab = ({ style, onChange, isMobile }: { style: CellStyle, onChange: any, isMobile: boolean }) => {
    return (
        <div className={cn("grid h-full text-slate-800", isMobile ? "grid-cols-1 gap-4" : "grid-cols-[1fr_200px] gap-6")}>
            <div className="flex flex-col gap-1">
                <GroupBox label="Text alignment">
                    <div className="flex flex-col gap-3 py-1">
                        <div className="flex flex-col gap-1">
                            <span className="text-[12px]">Horizontal:</span>
                            <ModernSelect 
                                value={style.align || 'general'}
                                options={HORIZONTAL_ALIGN_OPTIONS}
                                onChange={(val) => onChange('align', val)}
                                className="w-full"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-[12px] w-14">Indent:</span>
                            <input 
                                type="number" 
                                className="w-16 h-7 bg-white border border-slate-400 rounded-sm px-2 text-[12px] outline-none"
                                value={style.indent || 0}
                                onChange={(e) => onChange('indent', parseInt(e.target.value) || 0)}
                                min={0}
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <span className="text-[12px]">Vertical:</span>
                            <ModernSelect 
                                value={style.verticalAlign || 'bottom'}
                                options={VERTICAL_ALIGN_OPTIONS}
                                onChange={(val) => onChange('verticalAlign', val)}
                                className="w-full"
                            />
                        </div>
                    </div>
                </GroupBox>

                <GroupBox label="Text control">
                    <div className="flex flex-col gap-2 py-1">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="w-3.5 h-3.5" checked={!!style.wrapText} onChange={(e) => onChange('wrapText', e.target.checked)} />
                            <span className="text-[12px]">Wrap text</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="w-3.5 h-3.5" checked={!!style.shrinkToFit} onChange={(e) => onChange('shrinkToFit', e.target.checked)} />
                            <span className="text-[12px]">Shrink to fit</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="w-3.5 h-3.5" checked={!!style.mergeCells} onChange={(e) => onChange('mergeCells', e.target.checked)} />
                            <span className="text-[12px]">Merge cells</span>
                        </label>
                    </div>
                </GroupBox>

                <GroupBox label="Right-to-left">
                    <div className="flex flex-col gap-1 py-1">
                        <span className="text-[12px]">Text direction:</span>
                        <ModernSelect 
                            value={style.textDirection || 'context'}
                            options={TEXT_DIRECTION_OPTIONS}
                            onChange={(val) => onChange('textDirection', val)}
                            className="w-full"
                        />
                    </div>
                </GroupBox>
            </div>

            <div className="flex flex-col gap-1">
                <GroupBox label="Orientation" className="h-full">
                    <div className="flex flex-col items-center justify-start gap-4 py-2 h-full">
                        <div className="relative w-28 h-28 border border-slate-300 bg-white shadow-inner flex items-center justify-center">
                            {/* The Clock Background Quadrant */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-10">
                                <div className="w-full h-[1px] bg-slate-400" />
                                <div className="h-full w-[1px] bg-slate-400" />
                            </div>
                            
                            {/* Vertical "Text" Box */}
                            <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center justify-center border border-slate-300 px-1 py-4 bg-slate-50 text-[10px] uppercase font-bold tracking-tighter text-slate-400 z-0">
                                <span>T</span><span>e</span><span>x</span><span>t</span>
                            </div>

                            {/* Clock Hand / Needle */}
                            <div 
                                className="absolute h-full w-full pointer-events-none z-10 transition-transform duration-200"
                                style={{ transform: `rotate(${(style.textRotation || 0) * -1}deg)` }}
                            >
                                <div className="absolute top-1/2 left-1/2 w-12 h-[2px] bg-blue-600 origin-left" />
                                <div className="absolute top-1/2 left-[calc(50%+44px)] w-2.5 h-2.5 bg-blue-600 rounded-full -translate-y-1/2" />
                            </div>

                            {/* Invisible Interactive Arc (Simplified) */}
                            <div 
                                className="absolute inset-0 cursor-crosshair z-20"
                                onMouseDown={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const centerX = rect.left + rect.width / 2;
                                    const centerY = rect.top + rect.height / 2;
                                    const angle = Math.atan2(centerY - e.clientY, e.clientX - centerX) * (180 / Math.PI);
                                    onChange('textRotation', Math.round(Math.max(-90, Math.min(90, angle))));
                                }}
                            />
                        </div>
                        
                        <div className="flex flex-col items-center gap-1 w-full mt-2">
                             <div className="flex items-center gap-2">
                                <input 
                                    type="number" 
                                    className="w-14 h-7 border border-slate-400 rounded-sm px-1 text-center text-[12px] font-bold text-blue-700 bg-blue-50" 
                                    value={style.textRotation || 0}
                                    onChange={(e) => onChange('textRotation', parseInt(e.target.value) || 0)}
                                    min={-90}
                                    max={90}
                                />
                                <span className="text-[12px] font-medium text-slate-700">Degrees</span>
                             </div>
                        </div>
                    </div>
                </GroupBox>
            </div>
        </div>
    );
};

const FontTab = ({ style, onChange, isMobile }: { style: CellStyle, onChange: any, isMobile: boolean }) => {
    const fontStyles = ['Regular', 'Italic', 'Bold', 'Bold Italic'];
    const currentStyleStr = style.bold && style.italic ? 'Bold Italic' : style.bold ? 'Bold' : style.italic ? 'Italic' : 'Regular';

    const handleStyleChange = (s: string) => {
        onChange('bold', s.includes('Bold'));
        onChange('italic', s.includes('Italic'));
    };

    return (
        <div className={cn("flex flex-col gap-4", isMobile ? "h-auto" : "h-full")}>
            <div className={cn("grid gap-3", isMobile ? "grid-cols-1" : "grid-cols-[1fr_120px_60px]")}>
                <div className="flex flex-col gap-1">
                    <span className="text-[12px] font-medium">Font:</span>
                    <ScrollableList 
                        items={['Aptos Display', 'Aptos Narrow', 'Arial', 'Calibri', 'Times New Roman', 'Verdana']}
                        selected={style.fontFamily || 'Aptos Narrow'}
                        onSelect={(val) => onChange('fontFamily', val)}
                        className="h-32"
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-[12px] font-medium">Font style:</span>
                    <ScrollableList 
                        items={fontStyles}
                        selected={currentStyleStr}
                        onSelect={handleStyleChange}
                        className="h-32"
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-[12px] font-medium">Size:</span>
                    <ScrollableList 
                        items={[8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 36, 48, 72]}
                        selected={style.fontSize || 11}
                        onSelect={(val) => onChange('fontSize', val)}
                        className="h-32"
                    />
                </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <GroupBox label="Effects">
                        <div className="flex flex-col gap-1 py-1">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="w-3.5 h-3.5" checked={!!style.strikethrough} onChange={(e) => onChange('strikethrough', e.target.checked)} />
                                <span className="text-[12px]">Strikethrough</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="w-3.5 h-3.5" checked={!!style.underline} onChange={(e) => onChange('underline', e.target.checked)} />
                                <span className="text-[12px]">Underline</span>
                            </label>
                        </div>
                    </GroupBox>
                </div>
                <div className="w-full md:w-48 flex flex-col gap-1">
                    <span className="text-[12px] font-medium mb-1">Color:</span>
                    <ModernSelect 
                        value={style.color || '#000000'}
                        options={COLORS.map(c => ({ value: c, label: c }))}
                        onChange={(val) => onChange('color', val)}
                    />
                </div>
            </div>
        </div>
    );
};

const BorderTab = ({ style, onChange, isMobile }: { style: CellStyle, onChange: any, isMobile: boolean }) => {
    return (
        <div className="text-[12px] text-slate-500 italic flex items-center justify-center h-full">
            Border settings simplified for this version.
        </div>
    );
};

const FillTab = ({ style, onChange, isMobile }: { style: CellStyle, onChange: any, isMobile: boolean }) => {
    return (
        <div className="flex flex-col gap-4 h-full">
            <span className="text-[12px] font-medium">Background Color:</span>
            <div className="grid grid-cols-5 md:grid-cols-10 gap-1.5 p-3 border border-slate-300 rounded-sm bg-slate-50">
                {COLORS.map(c => (
                    <button
                        key={c}
                        className={cn(
                            "w-6 h-6 rounded-sm border border-slate-400 hover:border-slate-600 transition-all",
                            style.bg === c && "ring-2 ring-blue-500 ring-offset-1"
                        )}
                        style={{ backgroundColor: c }}
                        onClick={() => onChange('bg', c)}
                    />
                ))}
            </div>
            <div className="flex justify-between items-center px-1">
                <button onClick={() => onChange('bg', 'transparent')} className="text-[12px] text-blue-600 hover:underline">No Color</button>
                <button className="text-[12px] text-slate-800 border border-slate-300 px-3 py-1 rounded-sm hover:bg-slate-100">More Colors...</button>
            </div>
        </div>
    );
};

const ProtectionTab = ({ style, onChange, isMobile }: { style: CellStyle, onChange: any, isMobile: boolean }) => {
    return (
        <div className="flex flex-col gap-4 h-full py-2">
            <label className="flex items-center gap-2 cursor-pointer">
                <input 
                    type="checkbox" 
                    className="w-4 h-4"
                    checked={style.protection?.locked !== false} 
                    onChange={(e) => onChange('protection', { ...(style.protection || {}), locked: e.target.checked })} 
                />
                <span className="text-[13px] text-slate-800">Locked</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
                <input 
                    type="checkbox" 
                    className="w-4 h-4"
                    checked={!!style.protection?.hidden} 
                    onChange={(e) => onChange('protection', { ...(style.protection || {}), hidden: e.target.checked })} 
                />
                <span className="text-[13px] text-slate-800">Hidden</span>
            </label>
            <div className="text-[12px] text-slate-500 leading-relaxed mt-2 border-t border-slate-200 pt-4">
                Locking cells or hiding formulas has no effect until you protect the worksheet (Review tab, Protect Sheet button).
            </div>
        </div>
    );
};

const FormatCellsDialog: React.FC<FormatCellsDialogProps> = ({ isOpen, onClose, initialStyle, onApply }) => {
  const [activeTab, setActiveTab] = useState('Alignment');
  const [style, setStyle] = useState<CellStyle>(initialStyle);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dragRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => { setIsMobile(window.innerWidth < 768); };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
      if (isOpen) {
          setStyle(JSON.parse(JSON.stringify(initialStyle)));
          if (!isMobile) {
            setPosition({ 
                x: Math.max(0, (window.innerWidth - 480) / 2), 
                y: Math.max(0, (window.innerHeight - 520) / 2) 
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

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center pointer-events-none bg-black/10">
        <div 
            className={cn(
                "bg-[#fdfdfd] flex flex-col pointer-events-auto border border-slate-300 shadow-2xl font-sans",
                isMobile ? "w-full h-full" : "rounded-sm w-[480px] h-[520px]"
            )}
            style={!isMobile ? { transform: `translate(${position.x}px, ${position.y}px)`, position: 'absolute' } : {}}
        >
            <div 
                ref={dragRef}
                className="h-8 bg-white border-b border-slate-200 flex items-center justify-between px-3 select-none"
                onMouseDown={(e) => {
                    if (!isMobile && (e.target === dragRef.current || (e.target as HTMLElement).tagName === 'SPAN')) {
                        setIsDragging(true);
                    }
                }}
            >
                <span className="text-[12px] text-slate-700">Format Cells</span>
                <button onClick={onClose} className="text-slate-500 hover:bg-red-500 hover:text-white p-1 rounded-sm transition-colors">
                    <X size={14} />
                </button>
            </div>

            <div className="flex bg-[#f3f3f3] border-b border-slate-300 px-3 pt-1 gap-1">
                {TABS.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                            "px-4 py-1 text-[12px] relative top-[1px] transition-all font-normal",
                            activeTab === tab 
                                ? "bg-white border-t border-l border-r border-slate-300 text-slate-900 font-medium z-10 h-7" 
                                : "bg-transparent text-slate-600 hover:bg-slate-200 h-6 mt-1"
                        )}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="flex-1 bg-white p-5 overflow-y-auto">
                {activeTab === 'Number' && <NumberTab style={style} onChange={updateStyle} isMobile={isMobile} />}
                {activeTab === 'Alignment' && <AlignmentTab style={style} onChange={updateStyle} isMobile={isMobile} />}
                {activeTab === 'Font' && <FontTab style={style} onChange={updateStyle} isMobile={isMobile} />}
                {activeTab === 'Border' && <BorderTab style={style} onChange={updateStyle} isMobile={isMobile} />}
                {activeTab === 'Fill' && <FillTab style={style} onChange={updateStyle} isMobile={isMobile} />}
                {activeTab === 'Protection' && <ProtectionTab style={style} onChange={updateStyle} isMobile={isMobile} />}
            </div>

            <div className="h-12 border-t border-slate-200 bg-[#f3f3f3] flex items-center justify-end px-4 gap-2">
                <button onClick={handleApply} className="px-6 py-1 bg-white border border-slate-400 rounded-sm text-[12px] text-slate-800 hover:bg-blue-50 hover:border-blue-500 shadow-sm transition-all min-w-[75px]">OK</button>
                <button onClick={onClose} className="px-6 py-1 bg-white border border-slate-400 rounded-sm text-[12px] text-slate-800 hover:bg-slate-50 transition-all min-w-[75px]">Cancel</button>
            </div>
        </div>
    </div>
  );
};

export default FormatCellsDialog;
