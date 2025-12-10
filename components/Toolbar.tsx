import React, { useState, useRef, useEffect } from 'react';
import { 
  // Common & Home
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, 
  Download, Undo, Redo, ChevronDown, Palette, FileSpreadsheet, 
  Clipboard, Scissors, Copy, Paintbrush,
  AlignVerticalJustifyStart, AlignVerticalJustifyCenter, AlignVerticalJustifyEnd,
  WrapText, Merge, DollarSign, Percent, MoveLeft, MoveRight,
  Table, LayoutList, Plus, X, Eraser, Sigma, ArrowUpDown, Search,
  Grid3X3, Type, PaintBucket, Layout, Printer,
  
  // Insert
  Table2, TableProperties, FormInput, Image as ImageIcon, CheckSquare, 
  BarChart, BarChart3, LineChart, PieChart, ScatterChart, 
  Map, BarChart4, Activity, BarChart2, Filter, History, 
  Link2, MessageSquare, BoxSelect, TrendingUp,
  
  // Draw
  MousePointer2, MousePointerClick, PenTool, Highlighter, PlusCircle, 
  Shapes, Pi, PlayCircle, RotateCcw,
  
  // Formulas
  Calculator, BookOpen, Binary, Calendar, Tag, ArrowRightFromLine, 
  ArrowLeftFromLine, Eye, Settings, FileDigit, Divide, FunctionSquare,
  Variable, Triangle,
  
  // Review
  SpellCheck, Book, FileBarChart, Gauge, Accessibility, Languages, 
  MessageSquarePlus, MessageSquareX, ChevronLeft, ChevronRight, Lock, 
  EyeOff, UserCheck, ShieldAlert, FileSearch, Mic,
  
  // Automate
  ScrollText, Play, List, Workflow, Bot, FileJson, FileCode,
  
  // Page Layout
  File, Maximize, Layers, ArrowUp, ArrowDown, 
  Move, Minimize2, Sliders, Smartphone, Image, Grid,
  BringToFront, SendToBack, Group, RotateCw, Sparkles,
  
  // Data
  Database, RefreshCw, Landmark, Coins, Columns, ShieldCheck, 
  Ungroup, FileUp, FileDown, Globe, ListFilter,
  ArrowDownUp, FileAxis3d, Split, Merge as MergeIcon,
  
  // View
  ZoomIn, Maximize2, Code, Monitor, Columns2, 
  PanelLeftClose, AppWindow, Eye as ViewEye,
  
  // File
  FileText, Save
} from 'lucide-react';
import { CellStyle } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface ToolbarProps {
  currentStyle: CellStyle;
  onToggleStyle: (key: keyof CellStyle, value?: any) => void;
  onExport: () => void;
  onClear: () => void;
  onResetLayout: () => void;
}

// --- Components ---

const DraggableScrollContainer = ({ children, className = "" }: { children?: React.ReactNode, className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (e.deltaY === 0) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };

    el.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      el.removeEventListener('wheel', onWheel);
    };
  }, []);

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
    setTimeout(() => setIsDragging(false), 50);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDown || !ref.current) return;
    e.preventDefault();
    const x = e.pageX - ref.current.offsetLeft;
    const walk = (x - startX) * 1.5; 
    if (Math.abs(walk) > 5 && !isDragging) {
        setIsDragging(true);
    }
    ref.current.scrollLeft = scrollLeft - walk;
  };

  const onClickCapture = (e: React.MouseEvent) => {
      if (isDragging) {
          e.preventDefault();
          e.stopPropagation();
      }
  };

  return (
    <div
      ref={ref}
      className={`overflow-x-auto overflow-y-hidden no-scrollbar cursor-grab active:cursor-grabbing ${className}`}
      onMouseDown={onMouseDown}
      onMouseLeave={onMouseLeave}
      onMouseUp={onMouseUp}
      onMouseMove={onMouseMove}
      onClickCapture={onClickCapture}
    >
      {children}
    </div>
  );
};

const RibbonGroup: React.FC<{ label: string; children: React.ReactNode; className?: string }> = ({ label, children, className = "" }) => (
  <div className={`flex flex-col h-full px-2 md:px-3 border-r border-slate-200 last:border-r-0 flex-shrink-0 items-center ${className}`}>
    <div className="flex-1 flex gap-1 items-center justify-center content-center">
       {children}
    </div>
    <div className="h-5 flex items-center justify-center text-[10px] md:text-[11px] text-slate-400 font-medium whitespace-nowrap pb-1">{label}</div>
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
  const baseClass = `flex items-center justify-center rounded-[4px] transition-all duration-150 select-none ${
    active 
      ? 'bg-primary-50 text-primary-700 shadow-sm ring-1 ring-primary-200' 
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200'
  } ${disabled ? 'opacity-40 cursor-default pointer-events-none' : 'cursor-pointer'} ${className}`;

  if (variant === 'large') {
    return (
      <button onClick={onClick} title={title} disabled={disabled} className={`${baseClass} flex-col px-1.5 py-1 h-full min-w-[48px] md:min-w-[56px] gap-1`}>
        <div className="p-1.5">{icon}</div>
        <div className="text-[10px] md:text-[11px] font-medium leading-tight text-center flex flex-col items-center">
            {label}
            {subLabel && <span>{subLabel}</span>}
            {hasDropdown && <ChevronDown size={10} className="mt-0.5 opacity-50 stroke-[3]" />}
        </div>
      </button>
    );
  }

  if (variant === 'small') {
    return (
      <button onClick={onClick} title={title} disabled={disabled} className={`${baseClass} flex-row px-2 py-1 w-full justify-start gap-2 text-left`}>
        <div className="transform scale-90 flex-shrink-0">{icon}</div>
        {label && <span className="text-[11px] font-medium whitespace-nowrap">{label}</span>}
        {hasDropdown && <ChevronDown size={10} className="ml-auto opacity-50 stroke-[3]" />}
      </button>
    );
  }

  // Icon only
  return (
    <button onClick={onClick} title={title} disabled={disabled} className={`${baseClass} p-1 w-7 h-7 md:w-8 md:h-8 relative`}>
      {icon}
      {hasDropdown && <ChevronDown size={8} className="absolute bottom-0.5 right-0.5 opacity-60 stroke-[3]" />}
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
                        <div className="h-1 w-5 mt-0.5 rounded-sm shadow-sm" style={{ backgroundColor: color, border: color === 'transparent' ? '1px solid #e2e8f0' : 'none' }} />
                    </div>
                }
            />
             <div className="fixed mt-1 p-3 bg-white shadow-elevation rounded-lg border border-slate-200 hidden group-hover:grid grid-cols-5 gap-1.5 z-[100] w-40 left-auto animate-in fade-in zoom-in-95 duration-100">
                {colors.map(c => (
                    <button
                        key={c}
                        className="w-6 h-6 rounded border border-slate-200 hover:scale-110 hover:border-slate-400 hover:shadow-sm transition-all relative overflow-hidden"
                        style={{ backgroundColor: c === 'transparent' ? 'white' : c }}
                        onClick={() => onChange(c)}
                        title={c}
                    >
                         {c === 'transparent' && (
                             <div className="absolute inset-0 flex items-center justify-center">
                                 <div className="w-full h-[1px] bg-red-500 rotate-45 transform" />
                             </div>
                         )}
                    </button>
                ))}
            </div>
        </div>
    )
}

const Separator = () => <div className="h-3/4 w-[1px] bg-slate-200 mx-1 flex-shrink-0 my-auto" />;

const TABS = ['File', 'Home', 'Insert', 'Draw', 'Page Layout', 'Formulas', 'Data', 'Review', 'View', 'Automate'];

const Toolbar: React.FC<ToolbarProps> = ({ currentStyle, onToggleStyle, onExport, onClear }) => {
  const [activeTab, setActiveTab] = useState('Home');

  const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 36, 48, 72];
  const currentFontSize = currentStyle.fontSize || 13;

  return (
    <div className="flex flex-col bg-white border-b border-slate-200 z-40 select-none shadow-soft transition-all">
      
      {/* 1. Window / Quick Access Bar */}
      <div className="flex items-center justify-between px-3 md:px-4 h-10 bg-primary-700 text-white shadow-md z-10">
         <div className="flex items-center gap-4">
             <div className="flex items-center gap-2.5">
               <div className="p-1 bg-white/10 rounded">
                 <FileSpreadsheet size={18} className="text-white" />
               </div>
               <span className="text-sm font-semibold tracking-wide hidden sm:block">Book1</span>
            </div>
            <div className="h-5 w-[1px] bg-white/20 mx-1 hidden sm:block"></div>
            <div className="flex items-center gap-1">
                <button title="Undo" className="p-1.5 hover:bg-primary-600 rounded text-white/90 transition-colors"><Undo size={16} /></button>
                <button title="Redo" className="p-1.5 hover:bg-primary-600 rounded text-white/90 transition-colors"><Redo size={16} /></button>
                <div className="w-[1px] h-4 bg-white/20 mx-1"></div>
                <button onClick={onExport} title="Save/Export" className="p-1.5 hover:bg-primary-600 rounded text-white/90 flex items-center gap-1.5 transition-colors">
                     <Download size={16} />
                     <span className="text-xs font-medium hidden md:block">Save</span>
                </button>
            </div>
         </div>
         
         <div className="flex items-center gap-2">
            <div className="relative group">
                <Search size={14} className="absolute left-2.5 top-2 text-primary-200 group-focus-within:text-white transition-colors" />
                <input 
                    type="text" 
                    placeholder="Search" 
                    className="h-8 w-32 md:w-56 bg-primary-800/60 border border-primary-600/30 rounded-md text-xs text-white placeholder-primary-300 pl-8 pr-3 focus:outline-none focus:bg-primary-800 focus:border-primary-400 focus:ring-1 focus:ring-primary-400/50 transition-all"
                />
            </div>
             <div className="w-8 h-8 rounded-full bg-primary-600 border border-primary-500 flex items-center justify-center text-xs font-bold text-white shadow-sm ml-2 cursor-pointer hover:bg-primary-500">
                JD
             </div>
         </div>
      </div>

      {/* 2. Tab Navigation */}
      <div className="border-b border-slate-200 bg-white">
        <DraggableScrollContainer className="flex items-center px-2 md:px-4">
            {TABS.map(tab => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`
                        relative px-3 md:px-4 py-2.5 text-[13px] font-medium transition-colors whitespace-nowrap flex-shrink-0 select-none
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
                            className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary-600 rounded-t-sm z-10" 
                        />
                    )}
                </button>
            ))}
        </DraggableScrollContainer>
      </div>

      {/* 3. The Ribbon */}
      <div className="bg-slate-50/80 border-b border-slate-200">
      <DraggableScrollContainer className="h-[140px] flex items-start px-2 md:px-4 py-2 w-full">
          <AnimatePresence mode='wait'>
            
            {/* --- HOME TAB --- */}
            {activeTab === 'Home' && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex h-full min-w-max gap-1"
                >
                    <RibbonGroup label="Clipboard">
                        <RibbonButton 
                            variant="large" 
                            icon={<Clipboard size={20} className="stroke-[1.75]" />} 
                            label="Paste" 
                            onClick={() => {}}
                            title="Paste (Ctrl+V)"
                            hasDropdown
                        />
                        <div className="flex flex-col gap-0 justify-center">
                             <RibbonButton variant="small" icon={<Scissors size={14} />} label="Cut" onClick={() => {}} />
                             <RibbonButton variant="small" icon={<Copy size={14} />} label="Copy" onClick={() => {}} />
                             <RibbonButton variant="small" icon={<Paintbrush size={14} />} label="Format" onClick={() => {}} />
                        </div>
                    </RibbonGroup>

                    <RibbonGroup label="Font" className="px-3">
                        <div className="flex flex-col gap-2 justify-center h-full py-1">
                            <div className="flex items-center gap-1.5">
                                <div className="w-28 md:w-36 h-7 bg-white border border-slate-300 hover:border-slate-400 rounded flex items-center justify-between px-2 text-xs text-slate-700 shadow-sm cursor-pointer transition-colors">
                                    <span className="truncate">Inter</span>
                                    <ChevronDown size={12} className="opacity-50 flex-shrink-0" />
                                </div>
                                <div className="w-12 h-7 bg-white border border-slate-300 hover:border-slate-400 rounded flex items-center justify-center text-xs text-slate-700 shadow-sm cursor-pointer group relative transition-colors">
                                    <span>{currentFontSize}</span>
                                    <div className="absolute top-full left-0 w-12 bg-white border border-slate-200 shadow-lg hidden group-hover:block z-50 max-h-48 overflow-y-auto rounded-md mt-1">
                                        {FONT_SIZES.map(s => (
                                            <div 
                                                key={s} 
                                                onClick={() => onToggleStyle('fontSize', s)}
                                                className="px-2 py-1.5 hover:bg-primary-50 cursor-pointer text-center"
                                            >
                                                {s}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-center ml-0.5 bg-slate-200/50 rounded p-0.5 border border-slate-200">
                                    <RibbonButton variant="icon-only" icon={<span className="font-serif text-sm relative top-[1px]">A<span className="align-super text-[8px] absolute top-0 -right-1">▲</span></span>} onClick={() => onToggleStyle('fontSize', currentFontSize + 1)} title="Increase Font Size" className="w-6 h-6" />
                                    <RibbonButton variant="icon-only" icon={<span className="font-serif text-xs relative top-[1px]">A<span className="align-super text-[8px] absolute top-0 -right-1">▼</span></span>} onClick={() => onToggleStyle('fontSize', Math.max(1, currentFontSize - 1))} title="Decrease Font Size" className="w-6 h-6" />
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-1">
                                <RibbonButton variant="icon-only" icon={<Bold size={16} />} active={currentStyle.bold} onClick={() => onToggleStyle('bold', !currentStyle.bold)} title="Bold" />
                                <RibbonButton variant="icon-only" icon={<Italic size={16} />} active={currentStyle.italic} onClick={() => onToggleStyle('italic', !currentStyle.italic)} title="Italic" />
                                <RibbonButton variant="icon-only" icon={<Underline size={16} />} active={currentStyle.underline} onClick={() => onToggleStyle('underline', !currentStyle.underline)} title="Underline" />
                                <Separator />
                                <RibbonButton variant="icon-only" icon={<Grid3X3 size={16} className="opacity-70" />} onClick={() => {}} hasDropdown title="Borders" />
                                <ColorPicker 
                                    icon={<PaintBucket size={16} />} 
                                    color={currentStyle.bg || 'transparent'} 
                                    onChange={(c) => onToggleStyle('bg', c)} 
                                    colors={['transparent', '#fee2e2', '#d1fae5', '#dbeafe', '#fef3c7', '#f3f4f6', '#10b981', '#ef4444']}
                                    title="Fill Color"
                                />
                                <ColorPicker 
                                    icon={<Type size={16} />} 
                                    color={currentStyle.color || '#000'} 
                                    onChange={(c) => onToggleStyle('color', c)} 
                                    colors={['#0f172a', '#dc2626', '#10b981', '#2563eb', '#d97706', '#9333ea', '#ffffff']}
                                    title="Font Color"
                                />
                            </div>
                        </div>
                    </RibbonGroup>

                    <RibbonGroup label="Alignment">
                        <div className="flex gap-2 h-full py-1">
                             <div className="flex flex-col justify-between h-full py-0.5 gap-1">
                                 <div className="flex gap-0.5">
                                    <RibbonButton variant="icon-only" icon={<AlignVerticalJustifyStart size={16} className="rotate-180" />} onClick={() => {}} title="Top Align" />
                                    <RibbonButton variant="icon-only" icon={<AlignVerticalJustifyCenter size={16} />} onClick={() => {}} title="Middle Align" />
                                    <RibbonButton variant="icon-only" icon={<AlignVerticalJustifyEnd size={16} className="rotate-180" />} onClick={() => {}} title="Bottom Align" />
                                    <Separator />
                                    <RibbonButton variant="icon-only" icon={<span className="font-serif italic font-bold -rotate-45 block text-xs">ab</span>} onClick={() => {}} title="Orientation" />
                                 </div>
                                 <div className="flex gap-0.5">
                                    <RibbonButton variant="icon-only" icon={<AlignLeft size={16} />} active={currentStyle.align === 'left'} onClick={() => onToggleStyle('align', 'left')} title="Align Left" />
                                    <RibbonButton variant="icon-only" icon={<AlignCenter size={16} />} active={currentStyle.align === 'center'} onClick={() => onToggleStyle('align', 'center')} title="Center" />
                                    <RibbonButton variant="icon-only" icon={<AlignRight size={16} />} active={currentStyle.align === 'right'} onClick={() => onToggleStyle('align', 'right')} title="Align Right" />
                                    <Separator />
                                    <RibbonButton variant="icon-only" icon={<div className="flex -space-x-1 items-center"><MoveLeft size={10} /><div className="w-[1px] h-3 bg-slate-400"></div></div>} onClick={() => {}} title="Decrease Indent" />
                                    <RibbonButton variant="icon-only" icon={<div className="flex -space-x-1 items-center"><div className="w-[1px] h-3 bg-slate-400"></div><MoveRight size={10} /></div>} onClick={() => {}} title="Increase Indent" />
                                 </div>
                             </div>

                             <div className="flex flex-col gap-1 justify-center min-w-[100px]">
                                 <button className="flex items-center gap-2 px-2 py-1 hover:bg-slate-100 rounded text-[11px] font-medium text-slate-700 w-full text-left transition-colors">
                                     <WrapText size={14} className="text-slate-500" />
                                     <span>Wrap Text</span>
                                 </button>
                                 <button className="flex items-center gap-2 px-2 py-1 hover:bg-slate-100 rounded text-[11px] font-medium text-slate-700 w-full text-left transition-colors">
                                     <Merge size={14} className="text-slate-500" />
                                     <span>Merge & Center</span>
                                     <ChevronDown size={10} className="ml-auto opacity-50 stroke-[3]" />
                                 </button>
                             </div>
                        </div>
                    </RibbonGroup>

                    <RibbonGroup label="Number">
                         <div className="flex flex-col gap-2 justify-center h-full py-1">
                             <div className="w-32 md:w-36 h-7 bg-white border border-slate-300 rounded flex items-center justify-between px-2 text-xs text-slate-700 shadow-sm cursor-pointer hover:border-slate-400">
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

                    <RibbonGroup label="Styles">
                        <div className="flex gap-1 h-full items-center">
                            <RibbonButton variant="large" icon={<LayoutList size={22} className="text-blue-600" />} label="Conditional" subLabel="Formatting" onClick={() => {}} hasDropdown />
                            <RibbonButton variant="large" icon={<Table size={22} className="text-emerald-600" />} label="Format as" subLabel="Table" onClick={() => {}} hasDropdown />
                            <RibbonButton variant="large" icon={<Palette size={22} className="text-purple-600" />} label="Cell" subLabel="Styles" onClick={() => {}} hasDropdown />
                        </div>
                    </RibbonGroup>

                    <RibbonGroup label="Cells">
                         <div className="flex flex-col gap-0 justify-center">
                             <RibbonButton variant="small" icon={<Plus size={14} className="text-green-600" />} label="Insert" onClick={() => {}} hasDropdown />
                             <RibbonButton variant="small" icon={<X size={14} className="text-red-600" />} label="Delete" onClick={() => {}} hasDropdown />
                             <RibbonButton variant="small" icon={<Layout size={14} />} label="Format" onClick={() => {}} hasDropdown />
                         </div>
                    </RibbonGroup>

                    <RibbonGroup label="Editing" className="border-r-0">
                         <div className="flex gap-2 h-full items-center px-1">
                             <div className="flex flex-col gap-0 h-full justify-center">
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
                    className="flex h-full min-w-max gap-1"
                >
                    <RibbonGroup label="Tables">
                        <RibbonButton variant="large" icon={<Table2 size={22} />} label="PivotTable" hasDropdown onClick={() => {}} />
                        <RibbonButton variant="large" icon={<TableProperties size={22} className="text-blue-600" />} label="Recommended" subLabel="Pivots" onClick={() => {}} />
                        <RibbonButton variant="large" icon={<Table size={22} />} label="Table" onClick={() => {}} />
                        <RibbonButton variant="large" icon={<FormInput size={22} className="text-teal-600" />} label="Forms" hasDropdown onClick={() => {}} />
                    </RibbonGroup>

                    <RibbonGroup label="Illustrations">
                         <div className="flex gap-1 h-full items-center">
                             <RibbonButton variant="large" icon={<ImageIcon size={22} className="text-purple-600" />} label="Illustrations" hasDropdown onClick={() => {}} />
                             <RibbonButton variant="large" icon={<CheckSquare size={22} />} label="Checkbox" onClick={() => {}} />
                         </div>
                    </RibbonGroup>

                    <RibbonGroup label="Charts">
                        <div className="flex gap-2 h-full items-center">
                             <RibbonButton variant="large" icon={<BarChart size={22} />} label="Recommended" subLabel="Charts" onClick={() => {}} />
                             
                             <div className="flex flex-col gap-0 h-full justify-center">
                                 <div className="flex gap-0.5">
                                     <RibbonButton variant="icon-only" icon={<BarChart3 size={15} />} hasDropdown onClick={() => {}} title="Column" />
                                     <RibbonButton variant="icon-only" icon={<LineChart size={15} />} hasDropdown onClick={() => {}} title="Line" />
                                     <RibbonButton variant="icon-only" icon={<PieChart size={15} />} hasDropdown onClick={() => {}} title="Pie" />
                                 </div>
                                 <div className="flex gap-0.5">
                                     <RibbonButton variant="icon-only" icon={<ScatterChart size={15} />} hasDropdown onClick={() => {}} title="Scatter" />
                                     <RibbonButton variant="icon-only" icon={<Map size={15} />} hasDropdown onClick={() => {}} title="Maps" />
                                     <RibbonButton variant="icon-only" icon={<BarChart4 size={15} />} hasDropdown onClick={() => {}} title="PivotChart" />
                                 </div>
                             </div>
                        </div>
                    </RibbonGroup>

                    <RibbonGroup label="Sparklines">
                         <div className="flex flex-col gap-0 h-full justify-center">
                             <RibbonButton variant="small" icon={<Activity size={14} />} label="Line" onClick={() => {}} />
                             <RibbonButton variant="small" icon={<BarChart2 size={14} />} label="Column" onClick={() => {}} />
                             <RibbonButton variant="small" icon={<TrendingUp size={14} />} label="Win/Loss" onClick={() => {}} />
                         </div>
                    </RibbonGroup>
                    
                    <RibbonGroup label="Filters">
                         <div className="flex flex-col gap-0 h-full justify-center">
                             <RibbonButton variant="small" icon={<Filter size={14} />} label="Slicer" onClick={() => {}} />
                             <RibbonButton variant="small" icon={<History size={14} />} label="Timeline" onClick={() => {}} />
                         </div>
                    </RibbonGroup>

                    <RibbonGroup label="Links & Comments">
                        <div className="flex gap-1 h-full items-center">
                           <RibbonButton variant="large" icon={<Link2 size={22} />} label="Link" hasDropdown onClick={() => {}} />
                           <RibbonButton variant="large" icon={<MessageSquare size={22} />} label="Comment" onClick={() => {}} />
                        </div>
                    </RibbonGroup>

                    <RibbonGroup label="Text & Symbols" className="border-r-0">
                        <div className="flex gap-1 h-full items-center">
                           <RibbonButton variant="large" icon={<BoxSelect size={22} />} label="Text" hasDropdown onClick={() => {}} />
                           <RibbonButton variant="large" icon={<Sigma size={22} />} label="Symbols" hasDropdown onClick={() => {}} />
                        </div>
                    </RibbonGroup>
                </motion.div>
            )}

            {/* --- DRAW TAB --- */}
            {activeTab === 'Draw' && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex h-full min-w-max gap-1"
                >
                     <RibbonGroup label="Undo">
                        <div className="flex flex-col gap-0 h-full justify-center">
                            <RibbonButton variant="icon-only" icon={<Undo size={16} />} onClick={() => {}} />
                            <RibbonButton variant="icon-only" icon={<RotateCcw size={16} className="rotate-180 scale-x-[-1]" />} onClick={() => {}} />
                        </div>
                    </RibbonGroup>

                    <RibbonGroup label="Drawing Tools">
                        <div className="flex items-center gap-1 h-full">
                            <RibbonButton variant="large" icon={<MousePointer2 size={24} />} label="Select" onClick={() => {}} />
                            <RibbonButton variant="large" icon={<BoxSelect size={24} className="stroke-dashed" />} label="Lasso" onClick={() => {}} />
                            <Separator />
                            <RibbonButton variant="large" icon={<Eraser size={24} />} label="Eraser" hasDropdown onClick={() => {}} />
                            <div className="flex gap-1 items-center px-1">
                                <RibbonButton variant="large" icon={<PenTool size={24} color="#000" fill="#000" />} label="Black" hasDropdown onClick={() => {}} />
                                <RibbonButton variant="large" icon={<PenTool size={24} color="#ef4444" fill="#ef4444" />} label="Red" hasDropdown onClick={() => {}} />
                                <RibbonButton variant="large" icon={<PenTool size={24} className="text-purple-500" />} label="Galaxy" hasDropdown onClick={() => {}} />
                                <RibbonButton variant="large" icon={<Highlighter size={24} className="text-yellow-400" />} label="Highlight" hasDropdown onClick={() => {}} />
                                <RibbonButton variant="large" icon={<PenTool size={24} color="#059669" fill="#059669" />} label="Green" hasDropdown onClick={() => {}} />
                            </div>
                            <RibbonButton variant="large" icon={<PlusCircle size={22} className="text-green-600" />} label="Add" hasDropdown onClick={() => {}} />
                        </div>
                    </RibbonGroup>

                    <RibbonGroup label="Convert">
                        <div className="flex items-center gap-1 h-full">
                            <RibbonButton variant="large" icon={<Shapes size={22} className="text-blue-500" />} label="Ink to" subLabel="Shape" onClick={() => {}} />
                            <RibbonButton variant="large" icon={<Pi size={22} className="text-blue-500" />} label="Ink to" subLabel="Math" onClick={() => {}} />
                        </div>
                    </RibbonGroup>

                    <RibbonGroup label="Replay">
                        <RibbonButton variant="large" icon={<PlayCircle size={22} className="text-green-600" />} label="Ink" subLabel="Replay" onClick={() => {}} />
                    </RibbonGroup>
                </motion.div>
            )}

            {/* --- PAGE LAYOUT TAB --- */}
            {activeTab === 'Page Layout' && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex h-full min-w-max gap-1"
                >
                    <RibbonGroup label="Themes">
                        <div className="flex items-center gap-2 h-full">
                            <RibbonButton variant="large" icon={<Layout size={24} className="text-indigo-600" />} label="Themes" hasDropdown onClick={() => {}} />
                            <div className="flex flex-col gap-0 justify-center">
                                <RibbonButton variant="small" icon={<Palette size={14} />} label="Colors" hasDropdown onClick={() => {}} />
                                <RibbonButton variant="small" icon={<Type size={14} />} label="Fonts" hasDropdown onClick={() => {}} />
                                <RibbonButton variant="small" icon={<Sparkles size={14} />} label="Effects" hasDropdown onClick={() => {}} />
                            </div>
                        </div>
                    </RibbonGroup>

                    <RibbonGroup label="Page Setup">
                         <div className="flex items-center gap-1 h-full">
                             <RibbonButton variant="large" icon={<Maximize size={22} />} label="Margins" hasDropdown onClick={() => {}} />
                             <RibbonButton variant="large" icon={<Smartphone size={22} className="rotate-90" />} label="Orientation" hasDropdown onClick={() => {}} />
                             <RibbonButton variant="large" icon={<File size={22} />} label="Size" hasDropdown onClick={() => {}} />
                             <RibbonButton variant="large" icon={<Printer size={22} />} label="Print" subLabel="Area" hasDropdown onClick={() => {}} />
                             <div className="flex flex-col gap-0 justify-center pl-1">
                                 <RibbonButton variant="small" icon={<Scissors size={14} />} label="Breaks" onClick={() => {}} />
                                 <RibbonButton variant="small" icon={<Image size={14} />} label="Background" onClick={() => {}} />
                                 <RibbonButton variant="small" icon={<Columns size={14} />} label="Print Titles" onClick={() => {}} />
                             </div>
                         </div>
                    </RibbonGroup>

                    <RibbonGroup label="Scale to Fit">
                        <div className="flex flex-col gap-1 justify-center h-full px-1">
                            <div className="flex items-center gap-2 text-[10px] text-slate-600">
                                <span className="w-10">Width:</span>
                                <div className="border border-slate-300 rounded px-1 w-20 bg-white">Automatic</div>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-600">
                                <span className="w-10">Height:</span>
                                <div className="border border-slate-300 rounded px-1 w-20 bg-white">Automatic</div>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-600">
                                <span className="w-10">Scale:</span>
                                <div className="border border-slate-300 rounded px-1 w-16 bg-white">100%</div>
                            </div>
                        </div>
                    </RibbonGroup>

                    <RibbonGroup label="Sheet Options">
                        <div className="flex gap-4 px-2 h-full items-center">
                            <div className="flex flex-col gap-1">
                                <span className="text-[11px] font-semibold text-slate-700">Gridlines</span>
                                <label className="flex items-center gap-1 text-[10px]"><input type="checkbox" checked /> View</label>
                                <label className="flex items-center gap-1 text-[10px]"><input type="checkbox" /> Print</label>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[11px] font-semibold text-slate-700">Headings</span>
                                <label className="flex items-center gap-1 text-[10px]"><input type="checkbox" checked /> View</label>
                                <label className="flex items-center gap-1 text-[10px]"><input type="checkbox" /> Print</label>
                            </div>
                        </div>
                    </RibbonGroup>

                     <RibbonGroup label="Arrange">
                         <div className="flex items-center gap-1 h-full">
                             <div className="flex flex-col gap-0 justify-center">
                                 <RibbonButton variant="small" icon={<BringToFront size={14} />} label="Bring Forward" hasDropdown onClick={() => {}} />
                                 <RibbonButton variant="small" icon={<SendToBack size={14} />} label="Send Backward" hasDropdown onClick={() => {}} />
                             </div>
                             <RibbonButton variant="large" icon={<Layers size={22} />} label="Selection" subLabel="Pane" onClick={() => {}} />
                             <div className="flex flex-col gap-0 justify-center">
                                 <RibbonButton variant="small" icon={<AlignLeft size={14} />} label="Align" hasDropdown onClick={() => {}} />
                                 <RibbonButton variant="small" icon={<Group size={14} />} label="Group" hasDropdown onClick={() => {}} />
                                 <RibbonButton variant="small" icon={<RotateCw size={14} />} label="Rotate" hasDropdown onClick={() => {}} />
                             </div>
                         </div>
                    </RibbonGroup>
                </motion.div>
            )}

            {/* --- FORMULAS TAB --- */}
            {activeTab === 'Formulas' && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex h-full min-w-max gap-1"
                >
                    <RibbonGroup label="Function Library">
                         <div className="flex items-center gap-1 h-full">
                             <RibbonButton variant="large" icon={<FunctionSquare size={26} />} label="Insert" subLabel="Function" onClick={() => {}} />
                             <RibbonButton variant="large" icon={<Sigma size={26} />} label="AutoSum" hasDropdown onClick={() => {}} />
                             <div className="flex gap-0.5 h-full items-center">
                                 <RibbonButton variant="large" icon={<BookOpen size={20} className="text-orange-500" />} label="Recently" subLabel="Used" hasDropdown onClick={() => {}} />
                                 <RibbonButton variant="large" icon={<Coins size={20} className="text-green-600" />} label="Financial" hasDropdown onClick={() => {}} />
                                 <RibbonButton variant="large" icon={<Binary size={20} className="text-purple-600" />} label="Logical" hasDropdown onClick={() => {}} />
                                 <RibbonButton variant="large" icon={<Type size={20} className="text-slate-600" />} label="Text" hasDropdown onClick={() => {}} />
                                 <RibbonButton variant="large" icon={<Calendar size={20} className="text-red-500" />} label="Date &" subLabel="Time" hasDropdown onClick={() => {}} />
                                 <RibbonButton variant="large" icon={<Search size={20} className="text-blue-500" />} label="Lookup &" subLabel="Ref" hasDropdown onClick={() => {}} />
                                 <RibbonButton variant="large" icon={<Triangle size={20} className="text-indigo-500" />} label="Math &" subLabel="Trig" hasDropdown onClick={() => {}} />
                             </div>
                         </div>
                    </RibbonGroup>

                    <RibbonGroup label="Defined Names">
                         <div className="flex items-center gap-1 h-full">
                             <RibbonButton variant="large" icon={<Tag size={22} />} label="Name" subLabel="Manager" onClick={() => {}} />
                             <div className="flex flex-col gap-0 justify-center">
                                 <RibbonButton variant="small" icon={<Tag size={14} />} label="Define Name" hasDropdown onClick={() => {}} />
                                 <RibbonButton variant="small" icon={<FileCode size={14} />} label="Use in Formula" hasDropdown onClick={() => {}} />
                                 <RibbonButton variant="small" icon={<Grid3X3 size={14} />} label="Create from Selection" onClick={() => {}} />
                             </div>
                         </div>
                    </RibbonGroup>

                    <RibbonGroup label="Formula Auditing">
                         <div className="flex items-center gap-1 h-full">
                             <div className="flex flex-col gap-0 justify-center">
                                 <RibbonButton variant="small" icon={<ArrowRightFromLine size={14} />} label="Trace Precedents" onClick={() => {}} />
                                 <RibbonButton variant="small" icon={<ArrowLeftFromLine size={14} />} label="Trace Dependents" onClick={() => {}} />
                                 <RibbonButton variant="small" icon={<X size={14} className="text-red-500" />} label="Remove Arrows" hasDropdown onClick={() => {}} />
                             </div>
                             <div className="flex flex-col gap-0 justify-center">
                                 <RibbonButton variant="small" icon={<FunctionSquare size={14} />} label="Show Formulas" onClick={() => {}} />
                                 <RibbonButton variant="small" icon={<ShieldAlert size={14} className="text-amber-500" />} label="Error Checking" hasDropdown onClick={() => {}} />
                                 <RibbonButton variant="small" icon={<Calculator size={14} />} label="Evaluate Formula" onClick={() => {}} />
                             </div>
                             <RibbonButton variant="large" icon={<Eye size={22} />} label="Watch" subLabel="Window" onClick={() => {}} />
                         </div>
                    </RibbonGroup>

                     <RibbonGroup label="Calculation">
                         <div className="flex items-center gap-1 h-full">
                            <RibbonButton variant="large" icon={<Calculator size={22} />} label="Calculation" subLabel="Options" hasDropdown onClick={() => {}} />
                            <div className="flex flex-col gap-0 justify-center">
                                 <RibbonButton variant="small" icon={<Calculator size={14} />} label="Calculate Now" onClick={() => {}} />
                                 <RibbonButton variant="small" icon={<FileSpreadsheet size={14} />} label="Calculate Sheet" onClick={() => {}} />
                             </div>
                         </div>
                     </RibbonGroup>
                </motion.div>
            )}

            {/* --- DATA TAB --- */}
            {activeTab === 'Data' && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex h-full min-w-max gap-1"
                >
                    <RibbonGroup label="Get & Transform Data">
                        <div className="flex items-center gap-1 h-full">
                            <RibbonButton variant="large" icon={<Database size={24} />} label="Get" subLabel="Data" hasDropdown onClick={() => {}} />
                            <RibbonButton variant="large" icon={<FileText size={22} />} label="From Text/" subLabel="CSV" onClick={() => {}} />
                            <RibbonButton variant="large" icon={<Globe size={22} />} label="From" subLabel="Web" onClick={() => {}} />
                            <RibbonButton variant="large" icon={<Table size={22} />} label="From Table/" subLabel="Range" onClick={() => {}} />
                        </div>
                    </RibbonGroup>

                    <RibbonGroup label="Queries & Connections">
                         <div className="flex items-center gap-1 h-full">
                             <RibbonButton variant="large" icon={<RefreshCw size={22} className="text-green-600" />} label="Refresh" subLabel="All" hasDropdown onClick={() => {}} />
                             <div className="flex flex-col gap-0 justify-center">
                                 <RibbonButton variant="small" icon={<List size={14} />} label="Queries & Connections" onClick={() => {}} />
                                 <RibbonButton variant="small" icon={<Settings size={14} />} label="Properties" disabled onClick={() => {}} />
                                 <RibbonButton variant="small" icon={<Link2 size={14} />} label="Edit Links" disabled onClick={() => {}} />
                             </div>
                         </div>
                    </RibbonGroup>

                    <RibbonGroup label="Data Types">
                         <div className="flex items-center gap-1 h-full">
                             <RibbonButton variant="large" icon={<Landmark size={22} />} label="Stocks" onClick={() => {}} />
                             <RibbonButton variant="large" icon={<Coins size={22} />} label="Currencies" onClick={() => {}} />
                         </div>
                    </RibbonGroup>

                    <RibbonGroup label="Sort & Filter">
                        <div className="flex items-center gap-1 h-full">
                             <div className="flex flex-col gap-0 justify-center items-center px-1">
                                 <RibbonButton variant="small" icon={<div className="flex flex-col text-[8px] font-bold leading-none"><span>A</span><span>Z</span><ArrowDown size={8}/></div>} label="" onClick={() => {}} title="Sort A to Z" />
                                 <RibbonButton variant="small" icon={<div className="flex flex-col text-[8px] font-bold leading-none"><span>Z</span><span>A</span><ArrowDown size={8}/></div>} label="" onClick={() => {}} title="Sort Z to A" />
                             </div>
                             <RibbonButton variant="large" icon={<ArrowDownUp size={24} />} label="Sort" onClick={() => {}} />
                             <RibbonButton variant="large" icon={<Filter size={24} />} label="Filter" onClick={() => {}} />
                             <div className="flex flex-col gap-0 justify-center">
                                 <RibbonButton variant="small" icon={<Eraser size={14} />} label="Clear" disabled onClick={() => {}} />
                                 <RibbonButton variant="small" icon={<RefreshCw size={14} />} label="Reapply" disabled onClick={() => {}} />
                                 <RibbonButton variant="small" icon={<Sliders size={14} />} label="Advanced" onClick={() => {}} />
                             </div>
                        </div>
                    </RibbonGroup>

                     <RibbonGroup label="Data Tools">
                         <div className="flex items-center gap-1 h-full">
                             <RibbonButton variant="large" icon={<Columns size={22} />} label="Text to" subLabel="Columns" onClick={() => {}} />
                             <div className="flex flex-col gap-0 justify-center">
                                 <RibbonButton variant="small" icon={<CheckSquare size={14} />} label="Flash Fill" onClick={() => {}} />
                                 <RibbonButton variant="small" icon={<X size={14} className="text-red-500" />} label="Remove Duplicates" onClick={() => {}} />
                                 <RibbonButton variant="small" icon={<ShieldCheck size={14} />} label="Data Validation" hasDropdown onClick={() => {}} />
                             </div>
                             <div className="flex flex-col gap-0 justify-center">
                                  <RibbonButton variant="small" icon={<MergeIcon size={14} />} label="Consolidate" onClick={() => {}} />
                                  <RibbonButton variant="small" icon={<Link2 size={14} />} label="Relationships" disabled onClick={() => {}} />
                             </div>
                         </div>
                    </RibbonGroup>
                </motion.div>
            )}

            {/* --- REVIEW TAB --- */}
            {activeTab === 'Review' && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex h-full min-w-max gap-1"
                >
                    <RibbonGroup label="Proofing">
                         <div className="flex items-center gap-1 h-full">
                             <RibbonButton variant="large" icon={<SpellCheck size={24} />} label="Spelling" onClick={() => {}} />
                             <RibbonButton variant="large" icon={<Book size={24} />} label="Thesaurus" onClick={() => {}} />
                             <RibbonButton variant="large" icon={<FileBarChart size={24} />} label="Workbook" subLabel="Statistics" onClick={() => {}} />
                         </div>
                    </RibbonGroup>

                    <RibbonGroup label="Performance">
                         <RibbonButton variant="large" icon={<Gauge size={24} className="text-blue-500" />} label="Check" subLabel="Performance" onClick={() => {}} />
                    </RibbonGroup>

                    <RibbonGroup label="Accessibility">
                         <RibbonButton variant="large" icon={<Accessibility size={24} />} label="Check" subLabel="Accessibility" hasDropdown onClick={() => {}} />
                    </RibbonGroup>

                    <RibbonGroup label="Language">
                         <RibbonButton variant="large" icon={<Languages size={24} />} label="Translate" onClick={() => {}} />
                    </RibbonGroup>
                    
                     <RibbonGroup label="Comments">
                         <div className="flex items-center gap-1 h-full">
                             <RibbonButton variant="large" icon={<MessageSquarePlus size={24} />} label="New" subLabel="Comment" onClick={() => {}} />
                             <div className="flex flex-col gap-0 justify-center">
                                 <RibbonButton variant="small" icon={<MessageSquareX size={14} />} label="Delete" disabled onClick={() => {}} />
                                 <RibbonButton variant="small" icon={<ChevronLeft size={14} />} label="Previous Comment" disabled onClick={() => {}} />
                                 <RibbonButton variant="small" icon={<ChevronRight size={14} />} label="Next Comment" disabled onClick={() => {}} />
                             </div>
                             <RibbonButton variant="large" icon={<MessageSquare size={24} />} label="Show" subLabel="Comments" onClick={() => {}} />
                         </div>
                    </RibbonGroup>

                    <RibbonGroup label="Protect">
                        <div className="flex items-center gap-1 h-full">
                            <RibbonButton variant="large" icon={<Lock size={22} className="text-amber-500" />} label="Protect" subLabel="Sheet" onClick={() => {}} />
                            <RibbonButton variant="large" icon={<Lock size={22} className="text-amber-500" />} label="Protect" subLabel="Workbook" onClick={() => {}} />
                            <RibbonButton variant="large" icon={<UserCheck size={22} />} label="Allow Edit" subLabel="Ranges" onClick={() => {}} />
                            <RibbonButton variant="large" icon={<UserCheck size={22} />} label="Unshare" subLabel="Workbook" disabled onClick={() => {}} />
                        </div>
                    </RibbonGroup>
                    
                     <RibbonGroup label="Ink">
                         <RibbonButton variant="large" icon={<PenTool size={22} />} label="Hide" subLabel="Ink" hasDropdown onClick={() => {}} />
                    </RibbonGroup>
                </motion.div>
            )}
            
            {/* --- VIEW TAB --- */}
            {activeTab === 'View' && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex h-full min-w-max gap-1"
                >
                     <RibbonGroup label="Sheet View">
                         <div className="flex items-center gap-1 h-full">
                             <div className="flex flex-col gap-0 justify-center">
                                 <div className="bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] rounded text-slate-500 w-24 flex justify-between items-center">Default <ChevronDown size={8}/></div>
                                 <div className="flex gap-1 mt-1">
                                      <RibbonButton variant="icon-only" icon={<Save size={14} />} disabled onClick={() => {}} />
                                      <RibbonButton variant="icon-only" icon={<EyeOff size={14} />} disabled onClick={() => {}} />
                                 </div>
                             </div>
                         </div>
                    </RibbonGroup>

                    <RibbonGroup label="Workbook Views">
                        <div className="flex items-center gap-1 h-full">
                             <RibbonButton variant="large" icon={<Grid size={24} />} label="Normal" onClick={() => {}} />
                             <RibbonButton variant="large" icon={<Layout size={24} />} label="Page Break" subLabel="Preview" onClick={() => {}} />
                             <RibbonButton variant="large" icon={<FileSpreadsheet size={24} />} label="Page Layout" onClick={() => {}} />
                             <RibbonButton variant="large" icon={<Settings size={24} />} label="Custom" subLabel="Views" onClick={() => {}} />
                        </div>
                    </RibbonGroup>

                    <RibbonGroup label="Show">
                         <div className="flex gap-4 px-2 h-full items-center">
                            <RibbonButton variant="large" icon={<PanelLeftClose size={24} />} label="Navigation" onClick={() => {}} />
                            <div className="flex flex-col gap-1">
                                <label className="flex items-center gap-1 text-[10px]"><input type="checkbox" disabled /> Ruler</label>
                                <label className="flex items-center gap-1 text-[10px]"><input type="checkbox" checked /> Gridlines</label>
                                <label className="flex items-center gap-1 text-[10px]"><input type="checkbox" checked /> Formula Bar</label>
                            </div>
                             <div className="flex flex-col gap-1">
                                <label className="flex items-center gap-1 text-[10px]"><input type="checkbox" checked /> Headings</label>
                                <label className="flex items-center gap-1 text-[10px]"><input type="checkbox" checked /> Data Type Icons</label>
                                <div className="flex items-center gap-1 text-[10px] text-green-700 font-medium"><Plus size={10} /> Focus Cell</div>
                            </div>
                        </div>
                    </RibbonGroup>

                    <RibbonGroup label="Zoom">
                         <div className="flex items-center gap-1 h-full">
                             <RibbonButton variant="large" icon={<Search size={24} />} label="Zoom" onClick={() => {}} />
                             <RibbonButton variant="large" icon={<FileText size={24} />} label="100%" onClick={() => {}} />
                             <RibbonButton variant="large" icon={<ZoomIn size={24} />} label="Zoom to" subLabel="Selection" onClick={() => {}} />
                         </div>
                    </RibbonGroup>

                    <RibbonGroup label="Window">
                         <div className="flex items-center gap-1 h-full">
                             <RibbonButton variant="large" icon={<AppWindow size={24} />} label="New Window" onClick={() => {}} />
                             <RibbonButton variant="large" icon={<LayoutList size={24} />} label="Arrange All" onClick={() => {}} />
                             <RibbonButton variant="large" icon={<Columns2 size={24} />} label="Freeze" subLabel="Panes" hasDropdown onClick={() => {}} />
                              <div className="flex flex-col gap-0 justify-center">
                                 <div className="flex gap-0.5">
                                    <RibbonButton variant="small" icon={<Split size={14} />} label="Split" onClick={() => {}} />
                                    <RibbonButton variant="small" icon={<EyeOff size={14} />} label="Hide" onClick={() => {}} />
                                    <RibbonButton variant="small" icon={<ViewEye size={14} />} label="Unhide" onClick={() => {}} />
                                 </div>
                                  <div className="flex gap-0.5">
                                    <RibbonButton variant="small" icon={<Monitor size={14} />} label="Switch Windows" hasDropdown onClick={() => {}} />
                                 </div>
                             </div>
                         </div>
                    </RibbonGroup>
                </motion.div>
            )}

            {/* --- AUTOMATE TAB --- */}
            {activeTab === 'Automate' && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex h-full min-w-max gap-1"
                >
                    <RibbonGroup label="Office Scripts">
                         <div className="flex items-center gap-1 h-full">
                             <RibbonButton variant="large" icon={<ScrollText size={24} />} label="New" subLabel="Script" hasDropdown onClick={() => {}} />
                             <RibbonButton variant="large" icon={<List size={24} />} label="View" subLabel="Scripts" hasDropdown onClick={() => {}} />
                         </div>
                    </RibbonGroup>
                    
                    <RibbonGroup label="Office Scripts Gallery">
                        <DraggableScrollContainer className="flex flex-row h-full items-center gap-2 p-1 overflow-x-auto min-w-[200px]">
                             <button className="flex items-center gap-2 px-2 py-1 bg-white border border-slate-200 rounded-sm text-[10px] w-48 hover:bg-slate-50 flex-shrink-0">
                                 <FileCode size={14} className="text-orange-500" /> Unhide All Rows and Columns
                             </button>
                             <button className="flex items-center gap-2 px-2 py-1 bg-white border border-slate-200 rounded-sm text-[10px] w-48 hover:bg-slate-50 flex-shrink-0">
                                 <FileCode size={14} className="text-orange-500" /> Remove Hyperlinks from Sheet
                             </button>
                             <button className="flex items-center gap-2 px-2 py-1 bg-white border border-slate-200 rounded-sm text-[10px] w-48 hover:bg-slate-50 flex-shrink-0">
                                 <FileCode size={14} className="text-orange-500" /> Freeze Selection
                             </button>
                             <button className="flex items-center gap-2 px-2 py-1 bg-white border border-slate-200 rounded-sm text-[10px] w-48 hover:bg-slate-50 flex-shrink-0">
                                 <FileCode size={14} className="text-orange-500" /> Count Empty Rows
                             </button>
                             <button className="flex items-center gap-2 px-2 py-1 bg-white border border-slate-200 rounded-sm text-[10px] w-48 hover:bg-slate-50 flex-shrink-0">
                                 <FileCode size={14} className="text-orange-500" /> Make a Subtable from Selection
                             </button>
                              <button className="flex items-center gap-2 px-2 py-1 bg-white border border-slate-200 rounded-sm text-[10px] w-48 hover:bg-slate-50 flex-shrink-0">
                                 <FileCode size={14} className="text-orange-500" /> Return Table Data as JSON
                             </button>
                        </DraggableScrollContainer>
                    </RibbonGroup>

                    <RibbonGroup label="Power Automate">
                         <div className="flex items-center gap-1 h-full">
                             <RibbonButton variant="large" icon={<Workflow size={24} className="text-slate-400" />} label="Flow" subLabel="Templates" disabled onClick={() => {}} />
                         </div>
                    </RibbonGroup>
                </motion.div>
            )}

            {/* Placeholder for File tab */}
            {activeTab === 'File' && (
                 <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center w-full h-full text-slate-400 gap-3"
                >
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                        <FileSpreadsheet size={24} className="opacity-50" />
                    </div>
                    <div className="text-sm">
                        <span className="font-semibold text-slate-600">Backstage View</span> is not implemented in this demo.
                    </div>
                </motion.div>
            )}
          </AnimatePresence>
      </DraggableScrollContainer>
      </div>
    </div>
  );
};

export default Toolbar;