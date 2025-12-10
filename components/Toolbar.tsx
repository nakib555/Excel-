
import React, { useState, useRef } from 'react';
import { 
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, 
  Download, Trash2, Undo, Redo, 
  ChevronDown, Palette, FileSpreadsheet, 
  Clipboard, Scissors, Copy, Paintbrush,
  AlignVerticalJustifyStart, AlignVerticalJustifyCenter, AlignVerticalJustifyEnd,
  WrapText, Merge, 
  DollarSign, Percent, Hash, MoveLeft, MoveRight,
  Table, LayoutList, 
  Plus, X, Eraser, 
  Sigma, ArrowUpDown, Search,
  Grid3X3, Type,
  PaintBucket,
  MousePointer2,
  ListFilter,
  Layout,
  Printer,
  Sparkles,
  Image as ImageIcon,
  ImagePlus,
  Loader2
} from 'lucide-react';
import { CellStyle } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface ToolbarProps {
  currentStyle: CellStyle;
  onToggleStyle: (key: keyof CellStyle, value?: any) => void;
  onExport: () => void;
  onClear: () => void;
  onResetLayout: () => void;
  onGenerateImage: (prompt: string) => Promise<void>;
}

// --- Components ---

const DraggableScrollContainer = ({ children, className = "" }: { children?: React.ReactNode, className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const onMouseDown = (e: React.MouseEvent) => {
    if (!ref.current) return;
    setIsDown(true);
    setIsDragging(false);
    setStartX(e.pageX - ref.current.offsetLeft);
    setScrollLeft(ref.current.scrollLeft);
  };

  const onMouseLeave = () => {
    setIsDown(false);
    setIsDragging(false);
  };

  const onMouseUp = () => {
    setIsDown(false);
    // Short timeout to allow click event to be captured/prevented if needed
    setTimeout(() => setIsDragging(false), 50);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDown || !ref.current) return;
    e.preventDefault();
    const x = e.pageX - ref.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Scroll speed multiplier
    
    // Only register as a drag if moved more than 5px
    if (Math.abs(walk) > 5 && !isDragging) {
        setIsDragging(true);
    }
    ref.current.scrollLeft = scrollLeft - walk;
  };

  const onWheel = (e: React.WheelEvent) => {
    if (ref.current && e.deltaY !== 0) {
      ref.current.scrollLeft += e.deltaY;
    }
  };

  const onClickCapture = (e: React.MouseEvent) => {
      // Prevent click events (e.g. changing tabs) if we are dragging
      if (isDragging) {
          e.preventDefault();
          e.stopPropagation();
      }
  };

  return (
    <div
      ref={ref}
      className={`overflow-x-auto no-scrollbar cursor-grab active:cursor-grabbing ${className}`}
      onMouseDown={onMouseDown}
      onMouseLeave={onMouseLeave}
      onMouseUp={onMouseUp}
      onMouseMove={onMouseMove}
      onWheel={onWheel}
      onClickCapture={onClickCapture}
    >
      {children}
    </div>
  );
};

const RibbonGroup: React.FC<{ label: string; children: React.ReactNode; className?: string }> = ({ label, children, className = "" }) => (
  <div className={`flex flex-col h-full px-1.5 md:px-2 border-r border-slate-200 last:border-r-0 flex-shrink-0 ${className}`}>
    <div className="flex-1 flex gap-0.5 md:gap-1 items-center justify-center content-center">
       {children}
    </div>
    <div className="h-4 md:h-5 flex items-center justify-center text-[9px] md:text-[10px] text-slate-400 font-medium pt-0.5 md:pt-0 whitespace-nowrap">{label}</div>
  </div>
);

interface RibbonButtonProps {
  icon: React.ReactNode;
  label?: string;
  subLabel?: string;
  onClick: () => void;
  active?: boolean;
  variant?: 'large' | 'small' | 'icon-only';
  hasDropdown?: boolean;
  className?: string;
  title?: string;
  disabled?: boolean;
}

const RibbonButton: React.FC<RibbonButtonProps> = ({ 
  icon, label, subLabel, onClick, active, variant = 'small', hasDropdown, className = "", title, disabled 
}) => {
  const baseClass = `flex items-center justify-center rounded-[3px] transition-all duration-100 ${
    active ? 'bg-primary-50 text-primary-700 ring-1 ring-primary-200' : 'text-slate-600 hover:bg-slate-100'
  } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`;

  if (variant === 'large') {
    return (
      <button onClick={onClick} title={title} disabled={disabled} className={`${baseClass} flex-col px-1 py-1 h-full min-w-[40px] md:min-w-[48px] gap-1`}>
        <div className="p-1">{icon}</div>
        <div className="text-[10px] md:text-[11px] font-medium leading-none text-center flex flex-col items-center">
            {label}
            {hasDropdown && <ChevronDown size={10} className="mt-0.5 opacity-50" />}
        </div>
      </button>
    );
  }

  if (variant === 'small') {
    return (
      <button onClick={onClick} title={title} disabled={disabled} className={`${baseClass} flex-row px-1 py-0.5 w-full justify-start gap-1`}>
        <div className="transform scale-90">{icon}</div>
        {label && <span className="text-[10px] md:text-[11px] whitespace-nowrap">{label}</span>}
        {hasDropdown && <ChevronDown size={10} className="ml-auto opacity-50" />}
      </button>
    );
  }

  return (
    <button onClick={onClick} title={title} disabled={disabled} className={`${baseClass} p-1 md:p-1.5 w-6 h-6 md:w-8 md:h-8`}>
      {icon}
      {hasDropdown && <ChevronDown size={8} className="absolute bottom-0.5 right-0.5 opacity-50" />}
    </button>
  );
};

const ColorPicker: React.FC<{ 
    icon: React.ReactNode; 
    color: string; 
    onChange: (c: string) => void;
    colors: string[];
    title: string;
}> = ({ icon, color, onChange, colors, title }) => {
    return (
        <div className="relative group">
            <RibbonButton 
                variant="icon-only"
                onClick={() => {}}
                title={title}
                hasDropdown
                icon={
                    <div className="relative flex flex-col items-center justify-center h-full w-full">
                        {icon}
                        <div className="h-1 w-4 mt-0.5 rounded-[1px]" style={{ backgroundColor: color }} />
                    </div>
                }
            />
             <div className="fixed mt-1 p-2 bg-white shadow-xl rounded-lg border border-slate-200 hidden group-hover:grid grid-cols-5 gap-1 z-50 w-32 left-auto">
                {colors.map(c => (
                    <button
                        key={c}
                        className="w-5 h-5 rounded-[2px] border border-slate-100 hover:scale-110 hover:border-slate-300 transition-all shadow-sm"
                        style={{ backgroundColor: c === 'transparent' ? 'white' : c }}
                        onClick={() => onChange(c)}
                        title={c}
                    >
                         {c === 'transparent' && <span className="text-[8px] flex items-center justify-center text-red-500 font-bold">/</span>}
                    </button>
                ))}
            </div>
        </div>
    )
}


const Separator = () => <div className="h-full w-px bg-slate-200 mx-0.5 md:mx-1 flex-shrink-0" />;

const TABS = ['Home', 'Insert', 'Draw', 'Page Layout', 'Formulas', 'Data', 'Review', 'View'];

const Toolbar: React.FC<ToolbarProps> = ({ currentStyle, onToggleStyle, onExport, onClear, onGenerateImage }) => {
  const [activeTab, setActiveTab] = useState('Home');
  const [imagePrompt, setImagePrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Font sizes for the dropdown
  const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 36, 48, 72];
  const currentFontSize = currentStyle.fontSize || 13;

  const handleGenImage = async () => {
    if (!imagePrompt.trim()) return;
    setIsGenerating(true);
    await onGenerateImage(imagePrompt);
    setIsGenerating(false);
    setImagePrompt('');
  };

  return (
    <div className="flex flex-col bg-white border-b border-slate-300 shadow-sm z-40 select-none">
      
      {/* 1. Window / Quick Access Bar */}
      <div className="flex items-center justify-between px-2 md:px-4 h-9 bg-primary-700 text-white">
         <div className="flex items-center gap-4">
             <div className="flex items-center gap-2">
               <FileSpreadsheet size={16} className="text-white opacity-90" />
               <span className="text-xs font-semibold tracking-wide opacity-90 hidden sm:block">Book1 - Excel</span>
            </div>
            <div className="h-4 w-px bg-primary-600 mx-1 hidden sm:block"></div>
            <div className="flex items-center gap-1">
                <button title="Undo" className="p-1 hover:bg-primary-600 rounded text-white/90"><Undo size={14} /></button>
                <button title="Redo" className="p-1 hover:bg-primary-600 rounded text-white/90"><Redo size={14} /></button>
                <div className="w-px h-3 bg-white/20 mx-1"></div>
                <button onClick={onExport} title="Save/Export" className="p-1 hover:bg-primary-600 rounded text-white/90 flex items-center gap-1">
                     <Download size={14} />
                     <span className="text-[10px] font-medium hidden md:block">Save</span>
                </button>
            </div>
         </div>
         
         <div className="flex items-center gap-2">
            <div className="relative">
                <Search size={14} className="absolute left-2 top-1.5 text-primary-200" />
                <input 
                    type="text" 
                    placeholder="Search" 
                    className="h-6 w-32 md:w-48 bg-primary-800/50 border border-primary-600/50 rounded text-xs text-white placeholder-primary-300 pl-7 pr-2 focus:outline-none focus:bg-primary-800 focus:border-primary-400 transition-all"
                />
            </div>
         </div>
      </div>

      {/* 2. Tab Navigation */}
      <DraggableScrollContainer className="flex items-center px-2 md:px-4 bg-white border-b border-slate-200">
         {TABS.map(tab => (
            <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                    relative px-3 md:px-4 py-2 text-[11px] md:text-xs font-medium transition-colors whitespace-nowrap flex-shrink-0
                    ${activeTab === tab 
                        ? 'text-primary-700' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }
                `}
            >
                {tab}
                {activeTab === tab && (
                    <motion.div 
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary-600 rounded-t-sm" 
                    />
                )}
            </button>
         ))}
      </DraggableScrollContainer>

      {/* 3. The Ribbon */}
      <DraggableScrollContainer className="h-[100px] md:h-28 bg-slate-50/50 flex items-start px-2 md:px-4 py-1.5 w-full shadow-[inset_0_1px_4px_rgba(0,0,0,0.02)]">
          <AnimatePresence mode='wait'>
            {activeTab === 'Home' && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex h-full min-w-max"
                >
                    {/* --- Clipboard Group --- */}
                    <RibbonGroup label="Clipboard">
                        <RibbonButton 
                            variant="large" 
                            icon={<Clipboard size={22} className="stroke-[1.5]" />} 
                            label="Paste" 
                            onClick={() => {}}
                            title="Paste (Ctrl+V)"
                        />
                        <div className="flex flex-col gap-0.5 justify-start">
                             <RibbonButton 
                                variant="small" icon={<Scissors size={14} />} label="Cut" onClick={() => {}} 
                            />
                             <RibbonButton 
                                variant="small" icon={<Copy size={14} />} label="Copy" onClick={() => {}} 
                            />
                             <RibbonButton 
                                variant="small" icon={<Paintbrush size={14} />} label="Format" onClick={() => {}} 
                            />
                        </div>
                    </RibbonGroup>

                    {/* --- Font Group --- */}
                    <RibbonGroup label="Font" className="px-3">
                        <div className="flex flex-col gap-1.5 md:gap-2 justify-center h-full py-1">
                            {/* Top Row: Font Family & Size */}
                            <div className="flex items-center gap-1 md:gap-2">
                                <div className="w-24 md:w-32 h-6 bg-white border border-slate-300 rounded-[2px] flex items-center justify-between px-2 text-xs text-slate-700 shadow-sm cursor-pointer hover:border-primary-400">
                                    <span>Inter</span>
                                    <ChevronDown size={10} className="opacity-50" />
                                </div>
                                <div className="w-10 md:w-12 h-6 bg-white border border-slate-300 rounded-[2px] flex items-center justify-center text-xs text-slate-700 shadow-sm cursor-pointer hover:border-primary-400 group relative">
                                    <span>{currentFontSize}</span>
                                    <div className="absolute top-full left-0 w-12 bg-white border border-slate-200 shadow-lg hidden group-hover:block z-50 max-h-48 overflow-y-auto">
                                        {FONT_SIZES.map(s => (
                                            <div 
                                                key={s} 
                                                onClick={() => onToggleStyle('fontSize', s)}
                                                className="px-2 py-1 hover:bg-primary-50 cursor-pointer"
                                            >
                                                {s}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-center gap-0.5 ml-1">
                                    <RibbonButton variant="icon-only" icon={<span className="font-serif text-sm">A<span className="align-super text-[8px] pl-0.5">▲</span></span>} onClick={() => onToggleStyle('fontSize', currentFontSize + 1)} title="Increase Font Size" />
                                    <RibbonButton variant="icon-only" icon={<span className="font-serif text-xs">A<span className="align-super text-[8px] pl-0.5">▼</span></span>} onClick={() => onToggleStyle('fontSize', Math.max(1, currentFontSize - 1))} title="Decrease Font Size" />
                                </div>
                            </div>
                            
                            {/* Bottom Row: Styles & Colors */}
                            <div className="flex items-center gap-1">
                                <RibbonButton variant="icon-only" icon={<Bold size={15} />} active={currentStyle.bold} onClick={() => onToggleStyle('bold', !currentStyle.bold)} title="Bold" />
                                <RibbonButton variant="icon-only" icon={<Italic size={15} />} active={currentStyle.italic} onClick={() => onToggleStyle('italic', !currentStyle.italic)} title="Italic" />
                                <RibbonButton variant="icon-only" icon={<Underline size={15} />} active={currentStyle.underline} onClick={() => onToggleStyle('underline', !currentStyle.underline)} title="Underline" />
                                
                                <Separator />
                                
                                <RibbonButton variant="icon-only" icon={<Grid3X3 size={15} className="opacity-70" />} onClick={() => {}} hasDropdown title="Borders" />
                                <ColorPicker 
                                    icon={<PaintBucket size={15} />} 
                                    color={currentStyle.bg || 'transparent'} 
                                    onChange={(c) => onToggleStyle('bg', c)} 
                                    colors={['transparent', '#fee2e2', '#d1fae5', '#dbeafe', '#fef3c7', '#f3f4f6']}
                                    title="Fill Color"
                                />
                                <ColorPicker 
                                    icon={<Type size={15} />} 
                                    color={currentStyle.color || '#000'} 
                                    onChange={(c) => onToggleStyle('color', c)} 
                                    colors={['#0f172a', '#dc2626', '#10b981', '#2563eb', '#d97706', '#9333ea']}
                                    title="Font Color"
                                />
                            </div>
                        </div>
                    </RibbonGroup>

                    {/* --- Alignment Group --- */}
                    <RibbonGroup label="Alignment">
                        <div className="flex gap-2 h-full py-1">
                             {/* Column 1: Aligns */}
                             <div className="flex flex-col justify-between h-full py-0.5 gap-1">
                                 <div className="flex gap-0.5">
                                    <RibbonButton variant="icon-only" icon={<AlignVerticalJustifyStart size={15} className="rotate-180" />} onClick={() => {}} title="Top Align" />
                                    <RibbonButton variant="icon-only" icon={<AlignVerticalJustifyCenter size={15} />} onClick={() => {}} title="Middle Align" />
                                    <RibbonButton variant="icon-only" icon={<AlignVerticalJustifyEnd size={15} className="rotate-180" />} onClick={() => {}} title="Bottom Align" />
                                    <span className="w-2" />
                                    <RibbonButton variant="icon-only" icon={<span className="font-serif italic font-bold -rotate-45 block text-xs">ab</span>} onClick={() => {}} title="Orientation" />
                                 </div>
                                 <div className="flex gap-0.5">
                                    <RibbonButton variant="icon-only" icon={<AlignLeft size={15} />} active={currentStyle.align === 'left'} onClick={() => onToggleStyle('align', 'left')} title="Align Left" />
                                    <RibbonButton variant="icon-only" icon={<AlignCenter size={15} />} active={currentStyle.align === 'center'} onClick={() => onToggleStyle('align', 'center')} title="Center" />
                                    <RibbonButton variant="icon-only" icon={<AlignRight size={15} />} active={currentStyle.align === 'right'} onClick={() => onToggleStyle('align', 'right')} title="Align Right" />
                                    <span className="w-2" />
                                    <RibbonButton variant="icon-only" icon={<div className="flex -space-x-1"><MoveLeft size={12} /><div className="w-[1px] h-3 bg-slate-400"></div></div>} onClick={() => {}} title="Decrease Indent" />
                                    <RibbonButton variant="icon-only" icon={<div className="flex -space-x-1"><div className="w-[1px] h-3 bg-slate-400"></div><MoveRight size={12} /></div>} onClick={() => {}} title="Increase Indent" />
                                 </div>
                             </div>

                             {/* Column 2: Large actions */}
                             <div className="flex flex-col gap-1 justify-center">
                                 <button className="flex items-center gap-1 px-2 py-1 hover:bg-slate-100 rounded text-[11px] text-slate-700 w-full text-left">
                                     <WrapText size={14} className="text-slate-500" />
                                     <span>Wrap Text</span>
                                 </button>
                                 <button className="flex items-center gap-1 px-2 py-1 hover:bg-slate-100 rounded text-[11px] text-slate-700 w-full text-left">
                                     <Merge size={14} className="text-slate-500" />
                                     <span>Merge & Center</span>
                                     <ChevronDown size={10} className="ml-1 opacity-50" />
                                 </button>
                             </div>
                        </div>
                    </RibbonGroup>

                    {/* --- Number Group --- */}
                    <RibbonGroup label="Number">
                         <div className="flex flex-col gap-2 justify-center h-full py-1">
                             <div className="w-28 md:w-32 h-6 bg-white border border-slate-300 rounded-[2px] flex items-center justify-between px-2 text-xs text-slate-700 shadow-sm">
                                    <span>General</span>
                                    <ChevronDown size={10} className="opacity-50" />
                             </div>
                             <div className="flex items-center gap-1 justify-between px-1">
                                 <div className="flex gap-0.5">
                                    <RibbonButton variant="icon-only" icon={<DollarSign size={14} />} onClick={() => {}} title="Currency" />
                                    <RibbonButton variant="icon-only" icon={<Percent size={14} />} onClick={() => {}} title="Percent" />
                                    <RibbonButton variant="icon-only" icon={<span className="font-bold">,</span>} onClick={() => {}} title="Comma Style" />
                                 </div>
                                 <div className="flex gap-0.5">
                                    <RibbonButton variant="icon-only" icon={<div className="flex items-center text-[9px]"><span className="text-blue-500">.0</span><MoveLeft size={8} /></div>} onClick={() => {}} title="Increase Decimal" />
                                    <RibbonButton variant="icon-only" icon={<div className="flex items-center text-[9px]"><MoveRight size={8} /><span className="text-blue-500">.0</span></div>} onClick={() => {}} title="Decrease Decimal" />
                                 </div>
                             </div>
                         </div>
                    </RibbonGroup>

                    {/* --- Styles Group --- */}
                    <RibbonGroup label="Styles">
                        <div className="flex gap-1 h-full items-center">
                            <RibbonButton variant="large" icon={<LayoutList size={22} className="text-blue-600" />} label="Conditional" subLabel="Formatting" onClick={() => {}} hasDropdown />
                            <RibbonButton variant="large" icon={<Table size={22} className="text-emerald-600" />} label="Format as" subLabel="Table" onClick={() => {}} hasDropdown />
                            <RibbonButton variant="large" icon={<Palette size={22} className="text-purple-600" />} label="Cell" subLabel="Styles" onClick={() => {}} hasDropdown />
                        </div>
                    </RibbonGroup>

                    {/* --- Cells Group --- */}
                    <RibbonGroup label="Cells">
                         <div className="flex flex-col gap-0.5 h-full justify-center">
                             <RibbonButton variant="small" icon={<Plus size={14} className="text-green-600" />} label="Insert" onClick={() => {}} hasDropdown />
                             <RibbonButton variant="small" icon={<X size={14} className="text-red-600" />} label="Delete" onClick={() => {}} hasDropdown />
                             <RibbonButton variant="small" icon={<Layout size={14} />} label="Format" onClick={() => {}} hasDropdown />
                         </div>
                    </RibbonGroup>

                    {/* --- Editing Group --- */}
                    <RibbonGroup label="Editing" className="border-r-0">
                         <div className="flex gap-2 h-full items-center px-1">
                             <div className="flex flex-col gap-0.5 h-full justify-center">
                                 <RibbonButton variant="small" icon={<Sigma size={14} className="text-primary-600" />} label="AutoSum" onClick={() => {}} hasDropdown />
                                 <RibbonButton variant="small" icon={<ArrowUpDown size={14} />} label="Sort & Filter" onClick={() => {}} hasDropdown />
                                 <RibbonButton variant="small" icon={<Search size={14} />} label="Find & Select" onClick={() => {}} hasDropdown />
                             </div>
                             <div className="flex flex-col h-full justify-start pt-1">
                                  <RibbonButton 
                                    variant="large" 
                                    icon={<Eraser size={22} className="text-rose-500" />} 
                                    label="Clear" 
                                    onClick={onClear} 
                                    hasDropdown 
                                    title="Clear All"
                                />
                             </div>
                         </div>
                    </RibbonGroup>
                </motion.div>
            )}

            {/* --- INSERT TAB --- */}
            {activeTab === 'Insert' && (
              <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex h-full min-w-max"
              >
                  {/* --- Illustrations Group --- */}
                  <RibbonGroup label="Illustrations">
                      <RibbonButton 
                          variant="large" 
                          icon={<ImageIcon size={22} className="text-slate-500" />} 
                          label="Pictures" 
                          onClick={() => {}}
                          title="Insert Picture from File"
                          hasDropdown
                      />
                      <RibbonButton 
                          variant="large" 
                          icon={<Grid3X3 size={22} className="text-slate-500" />} 
                          label="Shapes" 
                          onClick={() => {}}
                          title="Insert Shapes"
                          hasDropdown
                      />
                  </RibbonGroup>

                  {/* --- AI Generation Group --- */}
                  <RibbonGroup label="Generative AI" className="px-3 min-w-[300px]">
                      <div className="flex items-center gap-3 h-full w-full">
                         <div className="flex flex-col gap-1 w-full max-w-[240px]">
                            <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1">
                              <Sparkles size={10} className="text-purple-500" />
                              Generate Image
                            </label>
                            <div className="flex items-center gap-1">
                                <input 
                                  type="text" 
                                  className="h-8 w-full text-xs border border-slate-300 rounded px-2 focus:ring-2 focus:ring-purple-100 focus:border-purple-400 outline-none"
                                  placeholder="Describe image to generate..."
                                  value={imagePrompt}
                                  onChange={(e) => setImagePrompt(e.target.value)}
                                  onKeyDown={(e) => e.key === 'Enter' && handleGenImage()}
                                />
                            </div>
                         </div>
                         <div className="h-full flex items-center pt-4">
                             <button
                                onClick={handleGenImage}
                                disabled={isGenerating || !imagePrompt}
                                className={`
                                  h-8 px-4 flex items-center gap-2 rounded bg-gradient-to-br from-purple-600 to-indigo-600 text-white text-xs font-semibold shadow-sm hover:shadow-md transition-all active:scale-95
                                  ${(isGenerating || !imagePrompt) ? 'opacity-50 cursor-not-allowed' : 'hover:from-purple-500 hover:to-indigo-500'}
                                `}
                             >
                                {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}
                                <span>Generate</span>
                             </button>
                         </div>
                      </div>
                  </RibbonGroup>

                  {/* --- Placeholder for Tables in Insert --- */}
                  <RibbonGroup label="Tables">
                       <RibbonButton 
                          variant="large" 
                          icon={<Table size={22} className="text-emerald-600" />} 
                          label="Table" 
                          onClick={() => {}}
                          title="Create Table"
                      />
                  </RibbonGroup>
              </motion.div>
            )}

            {/* Placeholder for other tabs */}
            {activeTab !== 'Home' && activeTab !== 'Insert' && (
                 <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center w-full h-full text-slate-400 gap-3"
                >
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                        <Printer size={24} className="opacity-50" />
                    </div>
                    <div className="text-sm">
                        <span className="font-semibold text-slate-600">{activeTab}</span> capabilities coming soon.
                    </div>
                </motion.div>
            )}
          </AnimatePresence>
      </DraggableScrollContainer>
    </div>
  );
};

export default Toolbar;
