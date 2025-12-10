import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { 
  Clipboard, Scissors, Copy, Paintbrush, ChevronDown, Bold, Italic, Underline, 
  Grid3X3, PaintBucket, Type, AlignVerticalJustifyStart, AlignVerticalJustifyCenter, 
  AlignVerticalJustifyEnd, AlignLeft, AlignCenter, AlignRight, MoveLeft, MoveRight, 
  WrapText, Merge, DollarSign, Percent, LayoutList, Table, Palette, Plus, X, 
  Layout, Sigma, ArrowUpDown, Search, Eraser 
} from 'lucide-react';
import { RibbonGroup, RibbonButton, ColorPicker, Separator, TabProps } from './shared';

const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 36, 48, 72];

const HomeTab: React.FC<TabProps> = ({ currentStyle, onToggleStyle, onClear }) => {
  const currentFontSize = currentStyle.fontSize || 13;

  return (
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
  );
};

export default memo(HomeTab);
