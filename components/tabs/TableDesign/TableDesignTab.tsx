
import React, { memo, lazy, Suspense, useState } from 'react';
import { motion } from 'framer-motion';
import { TabProps, RibbonGroup, RibbonButton, DraggableScrollContainer, SmartDropdown } from '../shared';
import { GroupSkeleton } from '../../Skeletons';
import { Settings, Table as TableIcon, Filter, X, RefreshCw, FileUp, Globe, Link2, Sliders, ChevronDown, Plus, LayoutTemplate } from 'lucide-react';
import TableStyleOptionsGroup from './TableStyleOptions/TableStyleOptionsGroup';
import { TABLE_STYLES, StylePreviewItem, TableStylePreset } from '../Home/Styles/FormatAsTable';
import { cn } from '../../../utils';

const TableDesignTab: React.FC<TabProps> = (props) => {
  const { activeTable, onTableOptionChange } = props;
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  if (!activeTable) return null;

  const renderCategory = (cat: string) => {
      const styles = TABLE_STYLES.filter(s => s.category === cat);
      if (styles.length === 0) return null;
      return (
          <div className="flex flex-col mb-5">
              <div className="px-5 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white sticky top-0 z-10 flex items-center gap-2 border-b border-slate-50 mb-3">
                  <div className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      cat === 'Light' ? "bg-slate-300" : cat === 'Medium' ? "bg-slate-400" : "bg-slate-600"
                  )} />
                  {cat}
              </div>
              <div className="grid grid-cols-5 gap-3 px-5">
                  {styles.map((s, i) => (
                      <StylePreviewItem 
                        key={i} 
                        style={s} 
                        onClick={() => {
                            if (onTableOptionChange) onTableOptionChange(activeTable.id, 'style', s);
                            setIsGalleryOpen(false);
                        }} 
                        selected={activeTable.style.name === s.name}
                      />
                  ))}
              </div>
          </div>
      );
  };

  return (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex h-full min-w-max gap-1"
    >
        {/* Group 1: Properties */}
        <RibbonGroup label="Properties">
            <div className="flex flex-col h-full justify-between py-1 px-1 gap-1">
                <div className="flex flex-col gap-0.5">
                    <label className="text-[10px] font-semibold text-slate-600 leading-none">Table Name:</label>
                    <input 
                        type="text" 
                        value={activeTable.name} 
                        onChange={(e) => onTableOptionChange && onTableOptionChange(activeTable.id, 'name', e.target.value)}
                        className="border border-slate-300 rounded-[2px] px-1.5 py-0.5 text-[11px] w-28 font-medium text-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                    />
                </div>
                <RibbonButton 
                    variant="small" 
                    icon={<Settings size={14} className="text-slate-600" />} 
                    label="Resize Table" 
                    onClick={() => {}} 
                    className="px-0 py-0 h-auto"
                />
            </div>
        </RibbonGroup>

        {/* Group 2: Tools */}
        <RibbonGroup label="Tools">
             <div className="flex items-center gap-1 h-full">
                 <RibbonButton variant="large" icon={<TableIcon size={20} className="text-blue-600" />} label="Summarize with" subLabel="PivotTable" onClick={() => {}} />
                 <div className="flex flex-col gap-0 justify-center">
                     <RibbonButton variant="small" icon={<div className="relative"><X size={14} className="text-red-500 absolute -bottom-1 -right-1 bg-white rounded-full"/><TableIcon size={14} className="text-slate-500"/></div>} label="Remove Duplicates" onClick={() => {}} />
                     <RibbonButton variant="small" icon={<div className="font-bold text-[9px] text-slate-600 border border-slate-400 rounded-[1px] px-0.5">Range</div>} label="Convert to Range" onClick={() => {}} />
                 </div>
                 <RibbonButton variant="large" icon={<Filter size={20} className="text-blue-500" />} label="Insert" subLabel="Slicer" onClick={() => {}} />
             </div>
        </RibbonGroup>

        {/* Group 3: External Table Data */}
        <RibbonGroup label="External Table Data">
            <div className="flex items-center gap-1 h-full">
                <RibbonButton variant="large" icon={<FileUp size={20} className="text-emerald-600" />} label="Export" hasDropdown onClick={() => {}} />
                <RibbonButton variant="large" icon={<RefreshCw size={20} className="text-green-600" />} label="Refresh" hasDropdown onClick={() => {}} />
                <div className="flex flex-col gap-0 justify-center">
                    <RibbonButton variant="small" icon={<Sliders size={14} className="text-slate-400" />} label="Properties" disabled onClick={() => {}} />
                    <RibbonButton variant="small" icon={<Globe size={14} className="text-slate-400" />} label="Open in Browser" disabled onClick={() => {}} />
                    <RibbonButton variant="small" icon={<Link2 size={14} className="text-slate-400" />} label="Unlink" disabled onClick={() => {}} />
                </div>
            </div>
        </RibbonGroup>

        {/* Group 4: Table Style Options */}
        <Suspense fallback={<GroupSkeleton width={200} />}>
            <TableStyleOptionsGroup 
                table={activeTable} 
                onChange={(key, val) => onTableOptionChange && onTableOptionChange(activeTable.id, key, val)} 
            />
        </Suspense>

        {/* Group 5: Table Styles */}
        <RibbonGroup label="Table Styles">
             <div className="flex items-center gap-0 h-full">
                 <DraggableScrollContainer className="w-[240px] px-1 h-full flex items-center">
                     <div className="flex gap-1 h-full items-center py-1">
                         {TABLE_STYLES.map((style, idx) => (
                             <StylePreviewItem 
                                key={idx}
                                style={style}
                                onClick={() => onTableOptionChange && onTableOptionChange(activeTable.id, 'style', style)}
                                selected={activeTable.style.name === style.name}
                             />
                         ))}
                     </div>
                 </DraggableScrollContainer>
                 
                 {/* Scroll/Dropdown Buttons */}
                 <div className="flex flex-col h-full border-l border-slate-200 bg-white z-10">
                     <button className="flex-1 px-1 hover:bg-slate-100 flex items-center justify-center text-slate-500">
                         <ChevronDown size={10} className="rotate-180" />
                     </button>
                     <button className="flex-1 px-1 hover:bg-slate-100 flex items-center justify-center text-slate-500">
                         <ChevronDown size={10} />
                     </button>
                     <SmartDropdown
                        open={isGalleryOpen}
                        onToggle={() => setIsGalleryOpen(!isGalleryOpen)}
                        contentWidth="w-[420px]"
                        triggerClassName="flex-1 flex"
                        trigger={
                             <button className="w-full h-full px-1 hover:bg-slate-100 flex items-center justify-center text-slate-500 border-t border-slate-200 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]">
                                 <div className="relative">
                                     <ChevronDown size={10} />
                                     <div className="absolute -top-1 left-0 w-full h-[1px] bg-current"></div>
                                 </div>
                             </button>
                        }
                     >
                        <div className="flex flex-col bg-white max-h-[70vh] overflow-y-auto scrollbar-thin rounded-lg shadow-2xl border border-slate-200">
                            <div className="pt-2 pb-4">
                                {renderCategory('Light')}
                                {renderCategory('Medium')}
                                {renderCategory('Dark')}
                            </div>
                            
                            <div className="border-t border-slate-100 p-2 bg-slate-50 sticky bottom-0 z-20 flex flex-col gap-1">
                                <button className="w-full text-left px-4 py-2 text-[11px] font-bold text-slate-700 hover:bg-white hover:text-emerald-700 hover:shadow-sm border border-transparent hover:border-slate-200 rounded-lg transition-all flex items-center gap-3 group">
                                    <div className="w-5 h-5 flex items-center justify-center rounded-md bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                                        <Plus size={14} />
                                    </div>
                                    New Table Style...
                                </button>
                                <button className="w-full text-left px-4 py-2 text-[11px] font-bold text-slate-700 hover:bg-white hover:text-blue-700 hover:shadow-sm border border-transparent hover:border-slate-200 rounded-lg transition-all flex items-center gap-3 group">
                                    <div className="w-5 h-5 flex items-center justify-center rounded-md bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
                                        <LayoutTemplate size={14} />
                                    </div>
                                    New PivotTable Style...
                                </button>
                            </div>
                        </div>
                     </SmartDropdown>
                 </div>
             </div>
        </RibbonGroup>
    </motion.div>
  );
};

export default memo(TableDesignTab);
