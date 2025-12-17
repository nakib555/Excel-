// Corrected the malformed import statement
import React, { useState, useEffect, useRef } from 'react';
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

const FONTS = ['Aptos', 'Aptos Display', 'Aptos Narrow', 'Abadi', 'Abadi ExtraLight', 'ADLaM Display', 'Agency FB', 'Aharoni', 'Arial', 'Calibri', 'Inter', 'JetBrains Mono', 'Segoe UI', 'Times New Roman', 'Verdana'];
const FONT_STYLES = ['Regular', 'Italic', 'Bold', 'Bold Italic'];
const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 26, 28, 36, 48, 72];

const UNDERLINE_OPTIONS = [
    { value: 'none', label: 'None' },
    { value: 'single', label: 'Single' },
    { value: 'double', label: 'Double' },
    { value: 'singleAccounting', label: 'Single Accounting' },
    { value: 'doubleAccounting', label: 'Double Accounting' },
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
        <div className={cn("border border-slate-200 bg-white overflow-y-auto flex flex-col h-full shadow-inner select-none rounded-sm scrollbar-thin", className)}>
            {items.map(item => {
                const isSelected = String(selected).toLowerCase() === String(item).toLowerCase();
                return (
                    <div 
                        key={item} 
                        ref={isSelected ? selectedRef : null}
                        className={cn(
                            "px-3 py-1 text-[12px] cursor-pointer whitespace-nowrap transition-colors",
                            isSelected ? "bg-[#0067b8] text-white" : "text-slate-900 hover:bg-[#e5f1fb]"
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
    disabled = false
}: { 
    value: string, 
    options: { value: string, label: string }[], 
    onChange: (val: string) => void, 
    className?: string,
    disabled?: boolean
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
                disabled={disabled}
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-full h-8 bg-white border border-slate-300 rounded-sm px-2 text-[12px] text-slate-800 flex items-center justify-between hover:border-blue-400 transition-all focus:ring-1 focus:ring-blue-500 outline-none",
                    disabled && "opacity-50 cursor-not-allowed bg-slate-50"
                )}
            >
                <span className="truncate">{selectedLabel}</span>
                <ChevronDown size={14} className={cn("text-slate-400 transition-transform", isOpen && "rotate-180")} />
            </button>
            {isOpen && (
                <div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-200 shadow-xl z-[1100] max-h-48 overflow-auto py-0.5 animate-in fade-in duration-100 ring-1 ring-black/5">
                    {options.map(option => (
                        <div
                            key={option.value}
                            onClick={() => { onChange(option.value); setIsOpen(false); }}
                            className={cn(
                                "px-3 py-1.5 text-[12px] cursor-pointer hover:bg-[#e5f1fb] text-slate-700 transition-colors flex items-center justify-between",
                                option.value === value && "bg-[#0067b8] text-white hover:bg-[#0067b8]"
                            )}
                        >
                            <span>{option.label}</span>
                            {option.value === value && <Check size={12} className="text-white" />}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const GroupBox = ({ label, children, className }: { label: string, children?: React.ReactNode, className?: string }) => (
    <div className={cn("border border-slate-300 rounded-sm p-4 relative pt-4 bg-white", className)}>
        <span className="absolute -top-2.5 left-3 bg-white px-1 text-[11px] text-slate-600 font-medium">{label}</span>
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
                <span className="text-[12px] text-slate-700">Category:</span>
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
                    className={cn("flex-1", isMobile ? "min-h-[140px]" : "min-h-[300px]")}
                />
            </div>
            
            <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-1">
                <div className="flex flex-col gap-2">
                    <span className="text-[12px] text-slate-700">Sample</span>
                    <div className="h-14 bg-slate-50 border border-slate-300 flex items-center px-4 text-sm text-slate-900 font-mono">
                        {style.format === 'currency' ? `${style.currencySymbol || '$'}1,234.56` : '1234.56'}
                    </div>
                </div>
            </div>
        </div>
    );
};

const AlignmentTab = ({ style, onChange, isMobile }: { style: CellStyle, onChange: any, isMobile: boolean }) => {
    const indentEnabled = style.align === 'left' || style.align === 'right' || style.align === 'distributed';
    
    return (
        <div className={cn("grid h-full", isMobile ? "grid-cols-1 gap-4" : "grid-cols-[1fr_180px] gap-6")}>
            <div className="flex flex-col gap-4">
                <GroupBox label="Text alignment">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-[12px] text-slate-700 w-20">Horizontal:</span>
                            <ModernSelect 
                                className="flex-1"
                                value={style.align || 'general'}
                                options={HORIZONTAL_ALIGN_OPTIONS}
                                onChange={(val) => onChange('align', val)}
                            />
                        </div>
                        {indentEnabled && (
                            <div className="flex items-center justify-end gap-2">
                                <span className="text-[12px] text-slate-700">Indent:</span>
                                <input 
                                    type="number" 
                                    className="w-16 h-8 bg-white border border-slate-300 rounded-sm px-2 text-[12px] outline-none focus:ring-1 focus:ring-blue-500"
                                    value={style.indent || 0}
                                    onChange={(e) => onChange('indent', Math.max(0, parseInt(e.target.value) || 0))}
                                    min={0}
                                />
                            </div>
                        )}
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-[12px] text-slate-700 w-20">Vertical:</span>
                            <ModernSelect 
                                className="flex-1"
                                value={style.verticalAlign || 'bottom'}
                                options={VERTICAL_ALIGN_OPTIONS}
                                onChange={(val) => onChange('verticalAlign', val)}
                            />
                        </div>
                    </div>
                </GroupBox>

                <GroupBox label="Text control">
                    <div className="flex flex-col gap-2">
                        {[
                            { key: 'wrapText', label: 'Wrap text' },
                            { key: 'shrinkToFit', label: 'Shrink to fit' },
                            { key: 'mergeCells', label: 'Merge cells' }
                        ].map(item => (
                            <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="w-4 h-4 accent-blue-600"
                                    checked={!!(style as any)[item.key]} 
                                    onChange={(e) => {
                                        if (item.key === 'wrapText' && e.target.checked) onChange('shrinkToFit', false);
                                        if (item.key === 'shrinkToFit' && e.target.checked) onChange('wrapText', false);
                                        onChange(item.key as any, e.target.checked);
                                    }} 
                                />
                                <span className="text-[12px] text-slate-800">{item.label}</span>
                            </label>
                        ))}
                    </div>
                </GroupBox>

                {!isMobile && (
                    <GroupBox label="Right-to-left">
                        <div className="flex items-center gap-4">
                            <span className="text-[12px] text-slate-700">Text direction:</span>
                            <ModernSelect 
                                className="flex-1"
                                value={style.textDirection || 'context'}
                                options={TEXT_DIRECTION_OPTIONS}
                                onChange={(val) => onChange('textDirection', val)}
                            />
                        </div>
                    </GroupBox>
                )}
            </div>

            <div className="flex flex-col gap-4">
                <GroupBox label="Orientation" className="flex-1 flex flex-col items-center justify-center gap-4">
                    <div className="w-24 h-24 rounded-full border border-slate-300 flex items-center justify-center bg-slate-50 relative overflow-hidden">
                        <div 
                            className="absolute h-[1px] w-full bg-slate-300 top-1/2"
                            style={{ transform: `rotate(${(style.textRotation || 0) * -1}deg)` }}
                        />
                        <span className="text-[10px] font-bold text-slate-400 rotate-90 absolute right-1">Text</span>
                    </div>
                    <div className="flex items-center gap-2">
                         <input 
                            type="number" 
                            className="w-14 h-8 border border-slate-300 rounded-sm text-center text-[12px] outline-none"
                            value={style.textRotation || 0}
                            onChange={(e) => onChange('textRotation', Math.max(-90, Math.min(90, parseInt(e.target.value) || 0)))}
                         />
                         <span className="text-[12px] text-slate-600">Degrees</span>
                    </div>
                </GroupBox>
            </div>
        </div>
    );
};

const FontTab = ({ style, onChange, isMobile }: { style: CellStyle, onChange: any, isMobile: boolean }) => {
    const currentFontStyle = style.bold && style.italic ? 'Bold Italic' : style.bold ? 'Bold' : style.italic ? 'Italic' : 'Regular';
    
    return (
        <div className="flex flex-col h-full gap-4">
            <div className={cn("grid gap-4 flex-1 min-h-0", isMobile ? "grid-cols-1" : "grid-cols-[1fr_130px_70px]")}>
                <div className="flex flex-col gap-1 h-full min-h-0">
                    <span className="text-[12px] text-slate-700">Font:</span>
                    <input 
                        type="text" 
                        value={style.fontFamily || 'Aptos'} 
                        onChange={(e) => onChange('fontFamily', e.target.value)}
                        className="w-full h-8 px-2 text-[12px] border border-slate-300 rounded-sm mb-1 outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <ScrollableList 
                        items={FONTS}
                        selected={style.fontFamily || 'Aptos'}
                        onSelect={(val) => onChange('fontFamily', val)}
                        className="flex-1"
                    />
                </div>
                <div className="flex flex-col gap-1 h-full min-h-0">
                    <span className="text-[12px] text-slate-700">Font style:</span>
                    <input 
                        type="text" 
                        readOnly 
                        value={currentFontStyle} 
                        className="w-full h-8 px-2 text-[12px] border border-slate-300 rounded-sm mb-1 bg-slate-50 outline-none"
                    />
                    <ScrollableList 
                        items={FONT_STYLES}
                        selected={currentFontStyle}
                        onSelect={(s) => { onChange('bold', s.includes('Bold')); onChange('italic', s.includes('Italic')); }}
                        className="flex-1"
                    />
                </div>
                <div className="flex flex-col gap-1 h-full min-h-0">
                    <span className="text-[12px] text-slate-700">Size:</span>
                    <input 
                        type="text" 
                        value={style.fontSize || 11} 
                        onChange={(e) => onChange('fontSize', parseInt(e.target.value) || 11)}
                        className="w-full h-8 px-2 text-[12px] border border-slate-300 rounded-sm mb-1 outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <ScrollableList 
                        items={FONT_SIZES}
                        selected={style.fontSize || 11}
                        onSelect={(val) => onChange('fontSize', val)}
                        className="flex-1"
                    />
                </div>
            </div>

            <div className={cn("grid gap-6 mt-2", isMobile ? "grid-cols-1" : "grid-cols-2")}>
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-4">
                        <div className="flex-1 flex flex-col gap-1">
                            <span className="text-[12px] text-slate-700">Underline:</span>
                            <ModernSelect 
                                value={style.underline ? 'single' : 'none'}
                                options={UNDERLINE_OPTIONS}
                                onChange={(val) => onChange('underline', val !== 'none')}
                            />
                        </div>
                        <div className="flex-1 flex flex-col gap-1">
                            <span className="text-[12px] text-slate-700">Color:</span>
                            <ModernSelect 
                                value={style.color || '#000000'}
                                options={COLORS.map(c => ({ value: c, label: c === '#000000' ? 'Automatic' : c }))}
                                onChange={(val) => onChange('color', val)}
                            />
                        </div>
                    </div>
                    
                    <GroupBox label="Effects">
                        <div className="grid grid-cols-1 gap-1">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="w-3.5 h-3.5 accent-blue-600" 
                                    checked={!!style.strikethrough} 
                                    onChange={(e) => onChange('strikethrough', e.target.checked)} 
                                />
                                <span className="text-[12px] text-slate-800">Strikethrough</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="w-3.5 h-3.5 accent-blue-600" />
                                <span className="text-[12px] text-slate-800">Superscript</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="w-3.5 h-3.5 accent-blue-600" />
                                <span className="text-[12px] text-slate-800">Subscript</span>
                            </label>
                        </div>
                    </GroupBox>
                </div>

                <div className="flex flex-col gap-1 h-full">
                     <span className="text-[12px] text-slate-700">Preview</span>
                     <div className="flex-1 min-h-[60px] border border-slate-300 rounded-sm flex items-center justify-center bg-white overflow-hidden p-2">
                        <span style={{ 
                            fontFamily: style.fontFamily || 'Aptos',
                            fontSize: `${(style.fontSize || 11) * 1.5}px`,
                            fontWeight: style.bold ? 'bold' : 'normal',
                            fontStyle: style.italic ? 'italic' : 'normal',
                            textDecoration: style.underline ? 'underline' : style.strikethrough ? 'line-through' : 'none',
                            color: style.color || '#000'
                        }}>
                            AaBbCcYyZz
                        </span>
                     </div>
                     <p className="text-[10px] text-slate-500 mt-1">This is a TrueType font. The same font will be used on both your printer and your screen.</p>
                </div>
            </div>
        </div>
    );
};

const FillTab = ({ style, onChange, isMobile }: { style: CellStyle, onChange: any, isMobile: boolean }) => (
    <div className="flex flex-col gap-4 h-full">
        <GroupBox label="Background Color">
            <div className={cn("grid gap-1 p-1", isMobile ? "grid-cols-5" : "grid-cols-10")}>
                {COLORS.map(c => (
                    <button
                        key={c}
                        className={cn(
                            "w-7 h-7 rounded-sm border border-slate-200 transition-all shadow-sm",
                            style.bg === c && "ring-1 ring-blue-500 ring-offset-1 scale-110"
                        )}
                        style={{ backgroundColor: c }}
                        onClick={() => onChange('bg', c)}
                        title={c}
                    />
                ))}
            </div>
            <div className="mt-4 flex gap-4">
                 <div className="flex-1 flex flex-col gap-1">
                    <span className="text-[12px] text-slate-700">Pattern Color:</span>
                    <ModernSelect value="Automatic" options={[{value: 'Automatic', label: 'Automatic'}]} onChange={() => {}} />
                 </div>
                 <div className="flex-1 flex flex-col gap-1">
                    <span className="text-[12px] text-slate-700">Pattern Style:</span>
                    <ModernSelect value="None" options={[{value: 'None', label: 'None'}]} onChange={() => {}} />
                 </div>
            </div>
        </GroupBox>
        <div className="mt-auto">
             <span className="text-[12px] text-slate-700">Sample</span>
             <div className="h-10 border border-slate-300 mt-1 flex items-center justify-center" style={{ backgroundColor: style.bg }}>
                 <span className="text-[12px]" style={{ color: style.color }}>Sample Text</span>
             </div>
        </div>
    </div>
);

const ProtectionTab = ({ style, onChange }: { style: CellStyle, onChange: any, isMobile: boolean }) => (
    <div className="flex flex-col gap-4 h-full py-2">
        <div className="flex flex-col gap-4">
            <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                    type="checkbox" 
                    className="w-4 h-4 accent-blue-600"
                    checked={style.protection?.locked !== false} 
                    onChange={(e) => onChange('protection', { ...(style.protection || {}), locked: e.target.checked })} 
                />
                <span className="text-[13px] text-slate-800 font-medium">Locked</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                    type="checkbox" 
                    className="w-4 h-4 accent-blue-600"
                    checked={!!style.protection?.hidden} 
                    onChange={(e) => onChange('protection', { ...(style.protection || {}), hidden: e.target.checked })} 
                />
                <span className="text-[13px] text-slate-800 font-medium">Hidden</span>
            </label>
        </div>
        <div className="mt-4 p-4 border border-slate-200 rounded-sm bg-slate-50">
             <p className="text-[12px] text-slate-600 leading-relaxed">
                Locking cells or hiding formulas has no effect until you protect the worksheet (Review tab, Protect Group, Protect Sheet button).
             </p>
        </div>
    </div>
);

const FormatCellsDialog: React.FC<FormatCellsDialogProps> = ({ isOpen, onClose, initialStyle, onApply }) => {
  const [activeTab, setActiveTab] = useState('Font');
  const [style, setStyle] = useState<CellStyle>(initialStyle);
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
          setActiveTab('Font'); 
      }
  }, [isOpen, initialStyle]);

  const updateStyle = (key: keyof CellStyle, value: any) => {
      setStyle(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
      onApply(style);
      onClose();
  };

  if (!isOpen) return null;

  const floatingClass = isMobile 
    ? "fixed inset-x-2 bottom-4 top-12 rounded-lg shadow-2xl z-[2001] bg-[#f0f0f0] flex flex-col overflow-hidden border border-slate-400" 
    : "fixed w-[560px] h-[580px] rounded-sm shadow-2xl z-[2001] bg-[#f0f0f0] border border-slate-400 overflow-hidden flex flex-col";

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/10 pointer-events-auto">
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className={floatingClass}
                >
                    {/* Classic Header */}
                    <div className="h-8 flex items-center justify-between px-3 select-none flex-shrink-0 bg-white border-b border-slate-200">
                        <span className="text-[12px] text-slate-800">Format Cells</span>
                        <button onClick={onClose} className="p-1 hover:bg-red-500 hover:text-white text-slate-500 transition-colors">
                            <X size={14} />
                        </button>
                    </div>

                    {/* Classic Tabs Navigation */}
                    <div className="px-3 pt-2 flex-shrink-0 bg-[#f0f0f0]">
                        <div className="flex gap-[2px] overflow-x-auto no-scrollbar border-b border-slate-300">
                            {TABS.map(tab => {
                                const active = activeTab === tab;
                                return (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={cn(
                                            "px-4 py-1.5 text-[12px] border-t border-x transition-colors relative z-10 -mb-[1px]",
                                            active 
                                                ? "bg-white border-slate-300 border-b-white font-medium text-slate-900" 
                                                : "bg-[#e1e1e1] border-transparent text-slate-600 hover:bg-[#e8e8e8]"
                                        )}
                                    >
                                        {tab}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Main Content Area - White background inside the tab content */}
                    <div className="flex-1 bg-white mx-3 mb-2 border-x border-b border-slate-300 p-4 overflow-y-auto scrollbar-thin">
                        {activeTab === 'Number' && <NumberTab style={style} onChange={updateStyle} isMobile={isMobile} />}
                        {activeTab === 'Alignment' && <AlignmentTab style={style} onChange={updateStyle} isMobile={isMobile} />}
                        {activeTab === 'Font' && <FontTab style={style} onChange={updateStyle} isMobile={isMobile} />}
                        {activeTab === 'Border' && <BorderTab style={style} onChange={updateStyle} isMobile={isMobile} />}
                        {activeTab === 'Fill' && <FillTab style={style} onChange={updateStyle} isMobile={isMobile} />}
                        {activeTab === 'Protection' && <ProtectionTab style={style} onChange={updateStyle} isMobile={isMobile} />}
                    </div>

                    {/* Footer */}
                    <div className="h-12 bg-[#f0f0f0] flex items-center justify-end px-3 gap-2 flex-shrink-0">
                        <button 
                            onClick={handleApply} 
                            className="w-24 h-7 bg-white border border-slate-400 rounded-[2px] text-[12px] text-slate-800 hover:bg-slate-50 hover:border-slate-500 active:bg-slate-100 transition-colors shadow-sm"
                        >
                            OK
                        </button>
                        <button 
                            onClick={onClose} 
                            className="w-24 h-7 bg-white border border-slate-400 rounded-[2px] text-[12px] text-slate-800 hover:bg-slate-50 hover:border-slate-500 active:bg-slate-100 transition-colors shadow-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
};

const BorderTab = ({ isMobile }: { style: CellStyle, onChange: any, isMobile: boolean }) => (
    <div className="flex flex-col gap-4 h-full justify-center items-center text-center px-4">
        <div className="w-16 h-16 bg-slate-50 rounded-lg flex items-center justify-center text-slate-300 border-2 border-dashed border-slate-200">
             <Info size={isMobile ? 32 : 40} strokeWidth={1.5} />
        </div>
        <div>
            <h3 className="text-[14px] font-bold text-slate-800">Style Borders</h3>
            <p className="text-[12px] text-slate-500 mt-2 leading-relaxed">
                Advanced border customizer is in development.<br/>Use Home tab for rapid borders.
            </p>
        </div>
    </div>
);

export default FormatCellsDialog;