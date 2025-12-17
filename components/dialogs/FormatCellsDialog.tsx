
import React, { useState, useEffect, useRef } from 'react';
import { X, Lock, EyeOff, Minus, Check, ChevronDown } from 'lucide-react';
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
    '3/14/12',
    '3/14/2012',
    '03/14/12',
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
    'Zip Code',
    'Zip Code + 4',
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

const LOCALE_OPTIONS = [
    { value: 'en-US', label: 'English (United States)' },
    { value: 'en-GB', label: 'English (United Kingdom)' },
    { value: 'ja-JP', label: 'Japanese' },
    { value: 'fr-FR', label: 'French' },
];

const CURRENCY_SYMBOL_OPTIONS = [
    { value: 'USD', label: '$ English (United States)' },
    { value: 'None', label: 'None' },
    { value: 'GBP', label: '£ English (United Kingdom)' },
    { value: 'EUR', label: '€ Euro' },
    { value: 'CNY', label: '¥ Chinese' },
];

// Helper Component for Lists (Font, Size, etc.)
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
    }, []);

    return (
        <div className={cn("border border-slate-200 bg-white overflow-y-auto flex flex-col h-full shadow-sm select-none rounded-md", className)}>
            {items.map(item => {
                const isSelected = selected === item;
                return (
                    <div 
                        key={item} 
                        ref={isSelected ? selectedRef : null}
                        className={cn(
                            "px-3 py-1.5 text-[13px] cursor-pointer whitespace-nowrap border-l-2 border-transparent transition-colors",
                            isSelected ? "bg-blue-50 text-blue-700 border-l-blue-500 font-medium" : "text-slate-700 hover:bg-slate-50"
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

// Modern Custom Select Component
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
                className="w-full h-9 bg-white border border-slate-300 rounded-md px-3 text-sm text-slate-700 flex items-center justify-between hover:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
            >
                <span className="truncate">{selectedLabel}</span>
                <ChevronDown size={14} className="text-slate-400" />
            </button>
            {isOpen && (
                <div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-xl z-50 max-h-60 overflow-auto py-1 animate-in fade-in zoom-in-95 duration-100">
                    {options.map(option => (
                        <div
                            key={option.value}
                            onClick={() => { onChange(option.value); setIsOpen(false); }}
                            className={cn(
                                "px-3 py-2 text-sm cursor-pointer hover:bg-slate-50 text-slate-700 flex items-center gap-2",
                                option.value === value && "bg-blue-50 text-blue-700 font-medium"
                            )}
                        >
                            {option.value === value && <Check size={12} className="text-blue-600" />}
                            <span className={option.value !== value ? "pl-5" : ""}>{option.label}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const FormatCellsDialog: React.FC<FormatCellsDialogProps> = ({ isOpen, onClose, initialStyle, onApply }) => {
  const [activeTab, setActiveTab] = useState('Number');
  const [style, setStyle] = useState<CellStyle>(initialStyle);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dragRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      if (isOpen) {
          setStyle(JSON.parse(JSON.stringify(initialStyle))); // Deep copy
          setPosition({ 
              x: Math.max(0, (window.innerWidth - 700) / 2), 
              y: Math.max(0, (window.innerHeight - 580) / 2) 
          });
      }
  }, [isOpen, initialStyle]);

  useEffect(() => {
      const handleMouseMove = (e: MouseEvent) => {
          if (!isDragging) return;
          setPosition(prev => ({
              x: prev.x + e.movementX,
              y: prev.y + e.movementY
          }));
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
  }, [isDragging]);

  const updateStyle = (key: keyof CellStyle, value: any) => {
      setStyle(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
      onApply(style);
      onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-start justify-start pointer-events-none">
        <div 
            className="bg-white rounded-lg shadow-2xl border border-slate-200 w-full max-w-2xl md:w-[700px] h-[580px] flex flex-col pointer-events-auto overflow-hidden animate-in zoom-in-95 duration-100 ring-1 ring-black/5 font-sans"
            style={{ 
                transform: `translate(${position.x}px, ${position.y}px)`,
                position: 'absolute'
            }}
        >
            {/* Header */}
            <div 
                ref={dragRef}
                className="h-10 bg-slate-50 border-b border-slate-200 flex items-center justify-between px-4 select-none cursor-default"
                onMouseDown={(e) => {
                    if (e.target === dragRef.current || (e.target as HTMLElement).tagName === 'SPAN') {
                        setIsDragging(true);
                    }
                }}
            >
                <span className="text-sm font-semibold text-slate-800">Format Cells</span>
                <button 
                    onClick={onClose} 
                    className="text-slate-400 hover:text-red-600 hover:bg-slate-200 p-1 rounded-md transition-colors"
                >
                    <X size={18} />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex bg-slate-50 border-b border-slate-200 px-4 pt-2 gap-1 overflow-x-auto no-scrollbar">
                {TABS.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                            "px-5 py-2 text-[13px] rounded-t-md border-t border-l border-r relative top-[1px] transition-all font-medium",
                            activeTab === tab 
                                ? "bg-white border-slate-200 border-b-white text-blue-600 z-10" 
                                : "bg-transparent border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100 border-b-slate-200"
                        )}
                    >
                        {tab}
                    </button>
                ))}
                <div className="flex-1 border-b border-slate-200"></div>
            </div>

            {/* Content Area */}
            <div className="flex-1 bg-white p-6 overflow-y-auto">
                {activeTab === 'Number' && <NumberTab style={style} onChange={updateStyle} />}
                {activeTab === 'Alignment' && <AlignmentTab style={style} onChange={updateStyle} />}
                {activeTab === 'Font' && <FontTab style={style} onChange={updateStyle} />}
                {activeTab === 'Border' && <BorderTab style={style} onChange={updateStyle} />}
                {activeTab === 'Fill' && <FillTab style={style} onChange={updateStyle} />}
                {activeTab === 'Protection' && <ProtectionTab style={style} onChange={updateStyle} />}
            </div>

            {/* Footer */}
            <div className="h-16 border-t border-slate-200 bg-slate-50 flex items-center justify-end px-6 gap-3">
                <button 
                    onClick={onClose}
                    className="px-5 py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-md text-sm text-slate-700 shadow-sm transition-colors font-medium min-w-[90px]"
                >
                    Cancel
                </button>
                <button 
                    onClick={handleApply}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 border border-transparent rounded-md text-sm text-white shadow-md transition-colors font-medium min-w-[90px]"
                >
                    OK
                </button>
            </div>
        </div>
    </div>
  );
};

// --- Sub-Components for Tabs ---

const GroupBox = ({ label, children, className }: { label: string, children?: React.ReactNode, className?: string }) => (
    <fieldset className={cn("border border-slate-200 rounded-lg p-4 relative mt-3", className)}>
        <legend className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-2 bg-white ml-2">{label}</legend>
        {children}
    </fieldset>
);

const NumberTab = ({ style, onChange }: { style: CellStyle, onChange: any }) => {
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
        
        // Reset type selection on cat change
        if (cat === 'Date') setSelectedType(DATE_TYPES[0]);
        if (cat === 'Time') setSelectedType(TIME_TYPES[0]);
        if (cat === 'Fraction') setSelectedType(FRACTION_TYPES[0]);
        if (cat === 'Special') setSelectedType(SPECIAL_TYPES[0]);
        if (cat === 'Custom') setSelectedType(CUSTOM_TYPES[0]);
    };

    const getSampleValue = () => {
        if (selectedCat === 'Date') return '3/14/2012';
        if (selectedCat === 'Time') return '1:30:55 PM';
        if (selectedCat === 'Text') return 'Sample Text';
        if (selectedCat === 'Currency') return `${style.currencySymbol || '$'}1,234.10`;
        if (selectedCat === 'Percentage') return '25.00%';
        return '1234.56';
    }

    return (
        <div className="flex h-full gap-6">
            <div className="w-[160px] flex flex-col gap-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-1">Category</span>
                <ScrollableList 
                    items={CATEGORIES}
                    selected={selectedCat}
                    onSelect={handleCatChange}
                    className="flex-1 shadow-inner border-slate-200"
                />
            </div>
            
            <div className="flex-1 flex flex-col gap-6 pt-1">
                {/* Sample Section */}
                <div className="flex flex-col gap-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Sample</span>
                    <div className="h-12 bg-white border border-slate-300 rounded-md flex items-center px-4 text-sm font-medium text-slate-900 shadow-sm ring-1 ring-slate-900/5">
                        {getSampleValue()}
                    </div>
                </div>

                {/* Dynamic Content */}
                <div className="flex-1 flex flex-col">
                    {selectedCat === 'General' && (
                        <div className="mt-4 p-4 bg-slate-50 rounded-md text-sm text-slate-600 leading-relaxed border border-slate-100">
                            General format cells have no specific number format.
                        </div>
                    )}

                    {(selectedCat === 'Number' || selectedCat === 'Currency') && (
                        <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-right-2 duration-300">
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-slate-700 w-28">Decimal places:</span>
                                <input 
                                    type="number" 
                                    className="w-20 border border-slate-300 rounded-md px-3 py-1.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm transition-all" 
                                    value={style.decimalPlaces ?? 2}
                                    onChange={(e) => onChange('decimalPlaces', parseInt(e.target.value))}
                                    min={0}
                                    max={30}
                                />
                            </div>
                            
                            {selectedCat === 'Currency' && (
                                <div className="flex items-center gap-4">
                                    <span className="text-sm text-slate-700 w-28">Symbol:</span>
                                    <div className="w-56">
                                        <ModernSelect 
                                            value={style.currencySymbol || 'USD'}
                                            options={CURRENCY_SYMBOL_OPTIONS}
                                            onChange={(val) => onChange('currencySymbol', val)}
                                        />
                                    </div>
                                </div>
                            )}

                            {selectedCat === 'Number' && (
                                <label className="flex items-center gap-2 mt-1 cursor-pointer">
                                    <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                                    <span className="text-sm text-slate-700">Use 1000 Separator (,)</span>
                                </label>
                            )}

                            <div className="flex flex-col gap-2 mt-2">
                                <span className="text-sm text-slate-700">Negative numbers:</span>
                                <div className="border border-slate-200 h-32 overflow-y-auto bg-white rounded-md shadow-inner">
                                    {NEGATIVE_NUMBERS.map(opt => (
                                        <div 
                                            key={opt.value}
                                            onClick={() => setSelectedNegative(opt.value)}
                                            className={cn(
                                                "px-3 py-2 text-sm cursor-pointer transition-colors",
                                                selectedNegative === opt.value ? "bg-blue-50 ring-1 ring-inset ring-blue-500/20" : "hover:bg-slate-50"
                                            )}
                                            style={{ color: selectedNegative === opt.value ? (opt.color === 'red' ? '#dc2626' : '#1e293b') : (opt.color === 'red' ? '#dc2626' : '#1e293b') }}
                                        >
                                            {opt.label}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {selectedCat === 'Accounting' && (
                        <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-right-2 duration-300">
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-slate-700 w-28">Decimal places:</span>
                                <input 
                                    type="number" 
                                    className="w-20 border border-slate-300 rounded-md px-3 py-1.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm transition-all" 
                                    value={style.decimalPlaces ?? 2}
                                    onChange={(e) => onChange('decimalPlaces', parseInt(e.target.value))}
                                    min={0}
                                />
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-slate-700 w-28">Symbol:</span>
                                <div className="w-56">
                                    <ModernSelect 
                                        value={style.currencySymbol || 'USD'}
                                        options={CURRENCY_SYMBOL_OPTIONS}
                                        onChange={(val) => onChange('currencySymbol', val)}
                                    />
                                </div>
                            </div>
                            <div className="mt-4 p-4 bg-slate-50 rounded-md text-sm text-slate-600 leading-relaxed border border-slate-100">
                                Accounting formats line up the currency symbols and decimal points in a column.
                            </div>
                        </div>
                    )}

                    {(selectedCat === 'Date' || selectedCat === 'Time') && (
                        <div className="flex flex-col gap-5 h-full animate-in fade-in slide-in-from-right-2 duration-300">
                            <div className="flex flex-col gap-2 flex-1">
                                <span className="text-sm text-slate-700">Type:</span>
                                <ScrollableList 
                                    items={selectedCat === 'Date' ? DATE_TYPES : TIME_TYPES}
                                    selected={selectedType}
                                    onSelect={setSelectedType}
                                    className="flex-1 shadow-inner border-slate-200"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <span className="text-sm text-slate-700">Locale (location):</span>
                                <ModernSelect 
                                    value="en-US"
                                    options={LOCALE_OPTIONS}
                                    onChange={() => {}}
                                />
                            </div>
                        </div>
                    )}

                    {selectedCat === 'Percentage' && (
                        <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-right-2 duration-300">
                             <div className="flex items-center gap-4">
                                <span className="text-sm text-slate-700 w-28">Decimal places:</span>
                                <input 
                                    type="number" 
                                    className="w-20 border border-slate-300 rounded-md px-3 py-1.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm transition-all" 
                                    value={style.decimalPlaces ?? 2}
                                    onChange={(e) => onChange('decimalPlaces', parseInt(e.target.value))}
                                    min={0}
                                />
                            </div>
                            <div className="mt-4 p-4 bg-slate-50 rounded-md text-sm text-slate-600 leading-relaxed border border-slate-100">
                                Percentage formats multiply the cell value by 100 and display the result with a percent symbol.
                            </div>
                        </div>
                    )}

                    {selectedCat === 'Fraction' && (
                        <div className="flex flex-col gap-3 h-full animate-in fade-in slide-in-from-right-2 duration-300">
                            <span className="text-sm text-slate-700">Type:</span>
                            <ScrollableList 
                                items={FRACTION_TYPES}
                                selected={selectedType}
                                onSelect={setSelectedType}
                                className="h-48 shadow-inner border-slate-200"
                            />
                        </div>
                    )}

                    {selectedCat === 'Scientific' && (
                        <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-right-2 duration-300">
                             <div className="flex items-center gap-4">
                                <span className="text-sm text-slate-700 w-28">Decimal places:</span>
                                <input 
                                    type="number" 
                                    className="w-20 border border-slate-300 rounded-md px-3 py-1.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm transition-all" 
                                    value={style.decimalPlaces ?? 2}
                                    onChange={(e) => onChange('decimalPlaces', parseInt(e.target.value))}
                                    min={0}
                                />
                            </div>
                        </div>
                    )}

                    {selectedCat === 'Text' && (
                        <div className="mt-4 p-4 bg-slate-50 rounded-md text-sm text-slate-600 leading-relaxed border border-slate-100">
                            Text format cells are treated as text even when a number is in the cell. The cell is displayed exactly as entered.
                        </div>
                    )}

                    {selectedCat === 'Special' && (
                        <div className="flex flex-col gap-5 h-full animate-in fade-in slide-in-from-right-2 duration-300">
                            <div className="flex flex-col gap-2 flex-1">
                                <span className="text-sm text-slate-700">Type:</span>
                                <ScrollableList 
                                    items={SPECIAL_TYPES}
                                    selected={selectedType}
                                    onSelect={setSelectedType}
                                    className="h-32 shadow-inner border-slate-200"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <span className="text-sm text-slate-700">Locale (location):</span>
                                <ModernSelect 
                                    value="en-US"
                                    options={LOCALE_OPTIONS}
                                    onChange={() => {}}
                                />
                            </div>
                        </div>
                    )}

                    {selectedCat === 'Custom' && (
                        <div className="flex flex-col gap-4 h-full animate-in fade-in slide-in-from-right-2 duration-300">
                            <div className="flex flex-col gap-2">
                                <span className="text-sm text-slate-700">Type:</span>
                                <input 
                                    type="text" 
                                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" 
                                    value={selectedType}
                                    onChange={(e) => setSelectedType(e.target.value)}
                                    placeholder="General"
                                />
                            </div>
                            <ScrollableList 
                                items={CUSTOM_TYPES}
                                selected={selectedType}
                                onSelect={setSelectedType}
                                className="h-40 shadow-inner border-slate-200"
                            />
                            <div className="mt-auto p-3 bg-slate-50 rounded-md text-xs text-slate-500 border border-slate-100">
                                Type the number format code, using one of the existing codes as a starting point.
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const AlignmentTab = ({ style, onChange }: { style: CellStyle, onChange: any }) => {
    return (
        <div className="flex flex-col md:flex-row gap-4 h-full">
            <div className="flex-1 flex flex-col gap-2">
                <GroupBox label="Text alignment">
                    <div className="grid grid-cols-[80px_1fr] gap-y-3 gap-x-2 items-center">
                        <span className="text-xs text-slate-600 text-right">Horizontal:</span>
                        <select 
                            className="border border-slate-300 rounded-[2px] text-sm py-1 px-1 outline-none focus:border-blue-500"
                            value={style.align || 'left'}
                            onChange={(e) => onChange('align', e.target.value)}
                        >
                            <option value="left">Left (Indent)</option>
                            <option value="center">Center</option>
                            <option value="right">Right (Indent)</option>
                            <option value="justify">Justify</option>
                        </select>

                        <span className="text-xs text-slate-600 text-right">Vertical:</span>
                        <select 
                            className="border border-slate-300 rounded-[2px] text-sm py-1 px-1 outline-none focus:border-blue-500"
                            value={style.verticalAlign || 'bottom'}
                            onChange={(e) => onChange('verticalAlign', e.target.value)}
                        >
                            <option value="top">Top</option>
                            <option value="middle">Center</option>
                            <option value="bottom">Bottom</option>
                            <option value="distributed">Distributed</option>
                        </select>
                        
                        <span className="text-xs text-slate-600 text-right">Indent:</span>
                        <input 
                            type="number" 
                            className="w-16 border border-slate-300 rounded-[2px] px-2 py-0.5 text-sm outline-none focus:border-blue-500"
                            value={style.indent || 0}
                            onChange={(e) => onChange('indent', parseInt(e.target.value))} 
                            min={0}
                        />
                    </div>
                </GroupBox>

                <GroupBox label="Text control">
                    <div className="flex flex-col gap-2 pl-2">
                        <label className="flex items-center gap-2 text-sm text-slate-700 select-none cursor-pointer hover:bg-slate-100/50 rounded">
                            <input 
                                type="checkbox" 
                                className="rounded-sm border-slate-300 text-blue-600 focus:ring-blue-500"
                                checked={style.wrapText || false}
                                onChange={(e) => onChange('wrapText', e.target.checked)}
                            />
                            Wrap text
                        </label>
                        <label className="flex items-center gap-2 text-sm text-slate-700 select-none cursor-pointer hover:bg-slate-100/50 rounded">
                            <input 
                                type="checkbox"
                                className="rounded-sm border-slate-300 text-blue-600 focus:ring-blue-500"
                                checked={style.shrinkToFit || false}
                                onChange={(e) => onChange('shrinkToFit', e.target.checked)}
                            />
                            Shrink to fit
                        </label>
                    </div>
                </GroupBox>
            </div>

            {/* Orientation Dial */}
            <div className="w-40 flex flex-col">
                <GroupBox label="Orientation" className="h-full flex flex-col items-center">
                    <div className="relative w-24 h-24 mt-4 select-none">
                        {/* Dial background */}
                        <div className="absolute inset-0 rounded-full border border-slate-300 bg-white"></div>
                         {/* Axis */}
                        <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-slate-200"></div>
                        <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-slate-200"></div>
                        
                        {/* Semi-circle mask to make it look like Excel's half-dial */}
                        <div className="absolute top-0 bottom-0 left-0 w-1/2 bg-[#f0f0f0] border-r border-slate-300" style={{ display: 'none' }}></div> {/* hidden for full dial */}

                        {/* Interactive Points */}
                        <div 
                            className="absolute top-[-4px] left-1/2 -ml-1 w-2 h-2 rounded-full bg-slate-400 hover:bg-blue-500 cursor-pointer" 
                            title="90°" onClick={() => onChange('textRotation', 90)}
                        />
                        <div 
                            className="absolute bottom-[-4px] left-1/2 -ml-1 w-2 h-2 rounded-full bg-slate-400 hover:bg-blue-500 cursor-pointer" 
                            title="-90°" onClick={() => onChange('textRotation', -90)}
                        />
                        <div 
                            className="absolute top-1/2 right-[-4px] -mt-1 w-2 h-2 rounded-full bg-slate-400 hover:bg-blue-500 cursor-pointer" 
                            title="0°" onClick={() => onChange('textRotation', 0)}
                        />
                        <div 
                            className="absolute top-[15%] right-[15%] w-2 h-2 rounded-full bg-slate-300 hover:bg-blue-500 cursor-pointer" 
                            title="45°" onClick={() => onChange('textRotation', 45)}
                        />
                        <div 
                            className="absolute bottom-[15%] right-[15%] w-2 h-2 rounded-full bg-slate-300 hover:bg-blue-500 cursor-pointer" 
                            title="-45°" onClick={() => onChange('textRotation', -45)}
                        />

                        {/* Text Preview */}
                        <div 
                            className="absolute top-1/2 left-1/2 text-[10px] font-bold text-slate-900 pointer-events-none origin-left ml-1 flex items-center gap-1 transition-transform"
                            style={{ 
                                transform: `translate(-50%, -50%) rotate(${-(style.textRotation || 0)}deg)`,
                                width: '60px',
                                justifyContent: (style.textRotation === 90 || style.textRotation === -90) ? 'center' : 'flex-start'
                            }}
                        >
                            Text <span className="w-4 h-[1px] bg-red-500"></span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 mt-auto mb-2">
                        <input 
                            type="number" 
                            className="w-12 border border-slate-300 rounded-[2px] px-1 text-sm text-center outline-none focus:border-blue-500"
                            value={style.textRotation || 0}
                            onChange={(e) => onChange('textRotation', parseInt(e.target.value))}
                            min={-90}
                            max={90}
                        />
                        <span className="text-xs text-slate-600">Degrees</span>
                    </div>
                </GroupBox>
            </div>
        </div>
    );
};

const FontTab = ({ style, onChange }: { style: CellStyle, onChange: any }) => {
    return (
        <div className="flex flex-col gap-4 h-full">
            <div className="flex gap-4 h-[200px]">
                {/* Font Family */}
                <div className="flex-1 flex flex-col gap-1 h-full">
                    <span className="text-xs text-slate-600">Font:</span>
                    <input type="text" value={style.fontFamily || 'Inter'} readOnly className="border border-slate-300 border-b-0 px-2 py-1 text-sm bg-white" />
                    <ScrollableList 
                        items={['Inter', 'Arial', 'Calibri', 'Times New Roman', 'Verdana', 'Courier New', 'Georgia', 'Comic Sans MS', 'Trebuchet MS']}
                        selected={style.fontFamily || 'Inter'}
                        onSelect={(f) => onChange('fontFamily', f)}
                        className="flex-1"
                        itemStyle={(item) => ({ fontFamily: item as string })}
                    />
                </div>

                {/* Font Style */}
                <div className="w-32 flex flex-col gap-1 h-full">
                    <span className="text-xs text-slate-600">Font style:</span>
                    <input 
                        type="text" 
                        value={style.bold ? (style.italic ? 'Bold Italic' : 'Bold') : (style.italic ? 'Italic' : 'Regular')} 
                        readOnly 
                        className="border border-slate-300 border-b-0 px-2 py-1 text-sm bg-white" 
                    />
                    <div className="border border-slate-300 bg-white overflow-y-auto flex flex-col h-full shadow-inner">
                         <div className={`px-2 py-0.5 text-sm cursor-pointer ${!style.bold && !style.italic ? "bg-[#2563eb] text-white" : "hover:bg-slate-100"}`} onClick={() => { onChange('bold', false); onChange('italic', false); }}>Regular</div>
                         <div className={`px-2 py-0.5 text-sm italic cursor-pointer ${!style.bold && style.italic ? "bg-[#2563eb] text-white" : "hover:bg-slate-100"}`} onClick={() => { onChange('bold', false); onChange('italic', true); }}>Italic</div>
                         <div className={`px-2 py-0.5 text-sm font-bold cursor-pointer ${style.bold && !style.italic ? "bg-[#2563eb] text-white" : "hover:bg-slate-100"}`} onClick={() => { onChange('bold', true); onChange('italic', false); }}>Bold</div>
                         <div className={`px-2 py-0.5 text-sm font-bold italic cursor-pointer ${style.bold && style.italic ? "bg-[#2563eb] text-white" : "hover:bg-slate-100"}`} onClick={() => { onChange('bold', true); onChange('italic', true); }}>Bold Italic</div>
                    </div>
                </div>

                {/* Size */}
                <div className="w-20 flex flex-col gap-1 h-full">
                    <span className="text-xs text-slate-600">Size:</span>
                    <input type="number" value={style.fontSize || 13} readOnly className="border border-slate-300 border-b-0 px-2 py-1 text-sm bg-white w-full" />
                    <ScrollableList 
                        items={[8, 9, 10, 11, 12, 13, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72]}
                        selected={style.fontSize || 13}
                        onSelect={(s) => onChange('fontSize', s)}
                        className="flex-1"
                    />
                </div>
            </div>

            <div className="flex gap-4">
                 {/* Underline */}
                <div className="flex-1">
                    <span className="text-xs text-slate-600 block mb-1">Underline:</span>
                    <select 
                        className="w-full border border-slate-300 rounded-[2px] px-2 py-1 text-sm outline-none"
                        value={style.underline ? 'single' : 'none'}
                        onChange={(e) => onChange('underline', e.target.value === 'single')}
                    >
                        <option value="none">None</option>
                        <option value="single">Single</option>
                    </select>
                </div>
                {/* Color */}
                <div className="flex-1">
                    <span className="text-xs text-slate-600 block mb-1">Color:</span>
                    <div className="relative">
                        <button className="w-full border border-slate-300 rounded-[2px] px-2 py-1 text-left text-sm bg-white flex items-center justify-between">
                            <span>Automatic</span>
                            <div className="w-3 h-3 bg-black border border-slate-200" style={{ backgroundColor: style.color || '#000' }}></div>
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <GroupBox label="Effects">
                    <div className="flex flex-col gap-1 pl-1">
                        <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                            <input 
                                type="checkbox" 
                                className="rounded-sm border-slate-300 text-blue-600 focus:ring-blue-500"
                                checked={style.strikethrough || false} 
                                onChange={(e) => onChange('strikethrough', e.target.checked)}
                            />
                            Strikethrough
                        </label>
                         <label className="flex items-center gap-2 text-sm text-slate-400 cursor-not-allowed">
                            <input type="checkbox" disabled className="rounded-sm border-slate-300" />
                            Superscript
                        </label>
                        <label className="flex items-center gap-2 text-sm text-slate-400 cursor-not-allowed">
                            <input type="checkbox" disabled className="rounded-sm border-slate-300" />
                            Subscript
                        </label>
                    </div>
                </GroupBox>

                <GroupBox label="Preview">
                    <div className="h-[76px] flex items-center justify-center border border-slate-300 bg-white">
                        <span style={{
                            fontFamily: style.fontFamily,
                            fontSize: Math.min(24, Math.max(12, style.fontSize || 13)), // Clamp for preview
                            fontWeight: style.bold ? 'bold' : 'normal',
                            fontStyle: style.italic ? 'italic' : 'normal',
                            textDecoration: [
                                style.underline ? 'underline' : '',
                                style.strikethrough ? 'line-through' : ''
                            ].join(' ').trim(),
                            color: style.color
                        }}>
                            AaBbCcYyZz
                        </span>
                    </div>
                </GroupBox>
            </div>
        </div>
    );
};

const BorderTab = ({ style, onChange }: { style: CellStyle, onChange: any }) => {
    const toggleBorder = (side: 'top' | 'bottom' | 'left' | 'right' | 'outline' | 'none') => {
        const current = style.borders || {};
        const newBorders = { ...current };
        const defaultBorder = { style: 'thin', color: '#000' } as const;

        if (side === 'none') {
            onChange('borders', {});
            return;
        }
        if (side === 'outline') {
            newBorders.top = defaultBorder;
            newBorders.bottom = defaultBorder;
            newBorders.left = defaultBorder;
            newBorders.right = defaultBorder;
            onChange('borders', newBorders);
            return;
        }

        if (newBorders[side]) {
            delete newBorders[side];
        } else {
            newBorders[side] = defaultBorder;
        }
        onChange('borders', newBorders);
    };

    return (
        <div className="flex flex-col gap-4 h-full">
            <div className="flex gap-6 h-full">
                {/* Left Column: Line Style & Color */}
                <div className="w-[180px] flex flex-col gap-4">
                    <div className="flex flex-col gap-1 flex-1">
                        <span className="text-xs text-slate-600">Line Style:</span>
                        <div className="border border-slate-300 bg-white p-1 flex flex-col gap-1 h-[140px] overflow-y-auto">
                            <div className="flex items-center gap-2 px-2 py-1 hover:bg-slate-100 cursor-pointer border border-transparent hover:border-slate-200">
                                <span className="text-xs text-slate-400">None</span>
                            </div>
                            <div className="px-2 py-1 hover:bg-slate-100 cursor-pointer group"><div className="border-b border-black h-2"></div></div>
                            <div className="px-2 py-1 hover:bg-slate-100 cursor-pointer group"><div className="border-b-[2px] border-black h-2"></div></div>
                            <div className="px-2 py-1 hover:bg-slate-100 cursor-pointer group"><div className="border-b border-dashed border-black h-2"></div></div>
                            <div className="px-2 py-1 hover:bg-slate-100 cursor-pointer group"><div className="border-b border-dotted border-black h-2"></div></div>
                            <div className="px-2 py-1 hover:bg-slate-100 cursor-pointer group"><div className="border-b-[3px] border-double border-black h-2"></div></div>
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-1">
                        <span className="text-xs text-slate-600">Color:</span>
                        <button className="w-full border border-slate-300 rounded-[2px] px-2 py-1 text-left text-sm bg-white flex items-center justify-between">
                            <span>Automatic</span>
                            <div className="w-4 h-4 bg-black border border-slate-200"></div>
                        </button>
                    </div>
                </div>

                {/* Right Column: Presets & Diagram */}
                <div className="flex-1 flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <span className="text-xs text-slate-600">Presets:</span>
                        <div className="flex gap-2">
                             <button 
                                className="flex flex-col items-center justify-center w-16 h-14 border border-slate-300 hover:bg-blue-50 hover:border-blue-300 rounded transition-all bg-white shadow-sm"
                                onClick={() => toggleBorder('none')}
                            >
                                <div className="w-6 h-6 border border-slate-200 flex items-center justify-center text-slate-300"><Minus size={12} /></div>
                                <span className="text-[10px] text-slate-600 mt-1">None</span>
                            </button>
                            <button 
                                className="flex flex-col items-center justify-center w-16 h-14 border border-slate-300 hover:bg-blue-50 hover:border-blue-300 rounded transition-all bg-white shadow-sm"
                                onClick={() => toggleBorder('outline')}
                            >
                                <div className="w-6 h-6 border-2 border-slate-800"></div>
                                <span className="text-[10px] text-slate-600 mt-1">Outline</span>
                            </button>
                            <button 
                                className="flex flex-col items-center justify-center w-16 h-14 border border-slate-300 hover:bg-blue-50 hover:border-blue-300 rounded transition-all bg-white shadow-sm"
                                onClick={() => {}} // Not implemented fully for this demo
                            >
                                <div className="w-6 h-6 border border-slate-400 grid grid-cols-2 grid-rows-2">
                                    <div className="border-r border-b border-slate-800"></div>
                                    <div className="border-b border-slate-800"></div>
                                    <div className="border-r border-slate-800"></div>
                                    <div></div>
                                </div>
                                <span className="text-[10px] text-slate-600 mt-1">Inside</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <span className="text-xs text-slate-600">Border:</span>
                        {/* Interactive Border Diagram */}
                        <div className="w-[180px] h-[180px] relative">
                            {/* Grid Lines (Guides) */}
                            <div className="absolute top-4 bottom-4 left-4 right-4 border border-slate-200"></div>
                            <div className="absolute top-1/2 left-4 right-4 h-[1px] bg-slate-200"></div>
                            <div className="absolute left-1/2 top-4 bottom-4 w-[1px] bg-slate-200"></div>
                            
                            {/* Corner Controls */}
                            <div className="absolute top-0 left-0 text-[10px] w-4 h-4"></div>
                            
                            {/* Text preview */}
                            <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none">
                                <span className="text-slate-300 text-lg">Text</span>
                                <span className="text-slate-300 text-lg ml-8">Text</span>
                            </div>
                            <div className="absolute inset-0 flex flex-col items-center justify-center select-none pointer-events-none pt-8">
                                <span className="text-slate-300 text-lg">Text</span>
                                <span className="text-slate-300 text-lg ml-8">Text</span>
                            </div>

                            {/* Top Border */}
                            <div 
                                className={cn("absolute top-4 left-4 right-4 h-2 -mt-1 cursor-pointer flex items-center justify-center hover:bg-blue-50 z-10", style.borders?.top && "z-20")}
                                onClick={() => toggleBorder('top')}
                            >
                                <div className={cn("w-full bg-black transition-all", style.borders?.top ? "h-[2px]" : "h-[1px] bg-slate-300")}></div>
                                {/* Arrow indicators */}
                                <div className={cn("absolute -left-3 top-0 text-slate-400 opacity-0 hover:opacity-100", style.borders?.top && "text-blue-600 opacity-100")}>
                                   <div className="w-1 h-2 bg-current"></div>
                                </div>
                            </div>
                            
                            {/* Bottom Border */}
                            <div 
                                className={cn("absolute bottom-4 left-4 right-4 h-2 -mb-1 cursor-pointer flex items-center justify-center hover:bg-blue-50 z-10", style.borders?.bottom && "z-20")}
                                onClick={() => toggleBorder('bottom')}
                            >
                                <div className={cn("w-full bg-black transition-all", style.borders?.bottom ? "h-[2px]" : "h-[1px] bg-slate-300")}></div>
                            </div>

                            {/* Left Border */}
                            <div 
                                className={cn("absolute top-4 bottom-4 left-4 w-2 -ml-1 cursor-pointer flex items-center justify-center hover:bg-blue-50 z-10", style.borders?.left && "z-20")}
                                onClick={() => toggleBorder('left')}
                            >
                                <div className={cn("h-full bg-black transition-all", style.borders?.left ? "w-[2px]" : "w-[1px] bg-slate-300")}></div>
                            </div>

                            {/* Right Border */}
                            <div 
                                className={cn("absolute top-4 bottom-4 right-4 w-2 -mr-1 cursor-pointer flex items-center justify-center hover:bg-blue-50 z-10", style.borders?.right && "z-20")}
                                onClick={() => toggleBorder('right')}
                            >
                                <div className={cn("h-full bg-black transition-all", style.borders?.right ? "w-[2px]" : "w-[1px] bg-slate-300")}></div>
                            </div>
                        </div>
                         <div className="text-xs text-slate-500 mt-2 max-w-[240px]">
                            Click on diagram or use buttons to apply borders.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FillTab = ({ style, onChange }: { style: CellStyle, onChange: any }) => {
    return (
        <div className="flex flex-col gap-4">
            <GroupBox label="Background Color">
                <div className="flex flex-col gap-3">
                    <button 
                        className={cn("w-full text-left px-3 py-1.5 border rounded-[2px] text-sm mb-1 transition-colors", !style.bg || style.bg === 'transparent' ? "bg-[#e0efff] border-[#69a1e6] text-blue-900" : "bg-white border-slate-300 hover:bg-slate-50")}
                        onClick={() => onChange('bg', 'transparent')}
                    >
                        No Color
                    </button>
                    
                    <div className="grid grid-cols-10 gap-1">
                        {COLORS.map(c => (
                            <div 
                                key={c}
                                className={cn(
                                    "w-7 h-7 cursor-pointer border hover:border-orange-400 hover:scale-110 transition-transform shadow-sm",
                                    style.bg === c ? "border-white ring-2 ring-blue-500 z-10" : "border-slate-300"
                                )}
                                style={{ backgroundColor: c }}
                                onClick={() => onChange('bg', c)}
                                title={c}
                            />
                        ))}
                    </div>
                </div>
            </GroupBox>

            <div className="grid grid-cols-2 gap-4">
                <GroupBox label="Pattern">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-600 w-20">Pattern Style:</span>
                            <select className="flex-1 border border-slate-300 rounded-[2px] text-sm p-1 outline-none">
                                <option>Solid</option>
                                <option>75% Gray</option>
                                <option>50% Gray</option>
                                <option>25% Gray</option>
                            </select>
                        </div>
                         <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-600 w-20">Pattern Color:</span>
                            <button className="flex-1 border border-slate-300 rounded-[2px] text-sm p-1 text-left bg-white flex items-center justify-between">
                                <span>Automatic</span>
                                <div className="w-3 h-3 bg-black"></div>
                            </button>
                        </div>
                    </div>
                </GroupBox>

                <GroupBox label="Sample">
                    <div className="h-full flex items-center justify-center p-2">
                         <div 
                            className="w-full h-12 border border-slate-300 shadow-inner flex items-center justify-center text-slate-800"
                            style={{ backgroundColor: style.bg || 'white' }}
                        >
                            {style.bg ? '' : 'No Background'}
                        </div>
                    </div>
                </GroupBox>
            </div>
        </div>
    );
};

const ProtectionTab = ({ style, onChange }: { style: CellStyle, onChange: any }) => {
    return (
        <div className="flex flex-col gap-6 pt-2 px-1">
            <div className="flex items-start gap-3">
                <input 
                    type="checkbox" 
                    id="locked"
                    className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    checked={style.protection?.locked !== false} // Default true
                    onChange={(e) => onChange('protection', { ...style.protection, locked: e.target.checked })}
                />
                <div className="flex flex-col gap-1">
                    <label htmlFor="locked" className="text-sm font-semibold text-slate-800 cursor-pointer">Locked</label>
                    <span className="text-xs text-slate-600 leading-relaxed max-w-md">
                        Locking cells or hiding formulas has no effect until you protect the worksheet (Review tab, Protect Sheet button).
                    </span>
                </div>
            </div>

            <div className="flex items-start gap-3">
                <input 
                    type="checkbox" 
                    id="hidden"
                    className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    checked={style.protection?.hidden || false}
                    onChange={(e) => onChange('protection', { ...style.protection, hidden: e.target.checked })}
                />
                 <div className="flex flex-col gap-1">
                    <label htmlFor="hidden" className="text-sm font-semibold text-slate-800 cursor-pointer">Hidden</label>
                    <span className="text-xs text-slate-600 leading-relaxed max-w-md">
                        Hiding formulas prevents them from being visible in the formula bar, but the result is still displayed in the cell.
                    </span>
                </div>
            </div>
        </div>
    );
};

export default FormatCellsDialog;
