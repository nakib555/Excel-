import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { 
  ScrollText, List, FileCode, Workflow 
} from 'lucide-react';
import { RibbonGroup, RibbonButton, DraggableScrollContainer, TabProps } from '../shared';

const AutomateTab: React.FC<TabProps> = () => {
  return (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex h-full min-w-max gap-1"
    >
        <RibbonGroup label="Office Scripts">
             <div className="flex items-center gap-1 h-full">
                 <RibbonButton variant="large" icon={<ScrollText size={20} />} label="New" subLabel="Script" hasDropdown onClick={() => {}} />
                 <RibbonButton variant="large" icon={<List size={20} />} label="View" subLabel="Scripts" hasDropdown onClick={() => {}} />
             </div>
        </RibbonGroup>
        
        <RibbonGroup label="Office Scripts Gallery">
            <DraggableScrollContainer className="h-full">
                 <div className="grid grid-rows-3 grid-flow-col gap-x-2 gap-y-0.5 p-1 h-full content-center">
                     <button className="flex items-center gap-2 px-2 py-0.5 bg-transparent hover:bg-slate-100 border border-transparent hover:border-slate-200 rounded-sm text-[11px] w-56 text-left transition-colors whitespace-nowrap text-slate-700">
                         <FileCode size={14} className="text-emerald-600 flex-shrink-0" /> <span className="truncate">Unhide All Rows and Columns</span>
                     </button>
                     <button className="flex items-center gap-2 px-2 py-0.5 bg-transparent hover:bg-slate-100 border border-transparent hover:border-slate-200 rounded-sm text-[11px] w-56 text-left transition-colors whitespace-nowrap text-slate-700">
                         <FileCode size={14} className="text-emerald-600 flex-shrink-0" /> <span className="truncate">Remove Hyperlinks from Sheet</span>
                     </button>
                     <button className="flex items-center gap-2 px-2 py-0.5 bg-transparent hover:bg-slate-100 border border-transparent hover:border-slate-200 rounded-sm text-[11px] w-56 text-left transition-colors whitespace-nowrap text-slate-700">
                         <FileCode size={14} className="text-emerald-600 flex-shrink-0" /> <span className="truncate">Freeze Selection</span>
                     </button>
                     <button className="flex items-center gap-2 px-2 py-0.5 bg-transparent hover:bg-slate-100 border border-transparent hover:border-slate-200 rounded-sm text-[11px] w-56 text-left transition-colors whitespace-nowrap text-slate-700">
                         <FileCode size={14} className="text-emerald-600 flex-shrink-0" /> <span className="truncate">Count Empty Rows</span>
                     </button>
                     <button className="flex items-center gap-2 px-2 py-0.5 bg-transparent hover:bg-slate-100 border border-transparent hover:border-slate-200 rounded-sm text-[11px] w-56 text-left transition-colors whitespace-nowrap text-slate-700">
                         <FileCode size={14} className="text-emerald-600 flex-shrink-0" /> <span className="truncate">Make a Subtable from Selection</span>
                     </button>
                      <button className="flex items-center gap-2 px-2 py-0.5 bg-transparent hover:bg-slate-100 border border-transparent hover:border-slate-200 rounded-sm text-[11px] w-56 text-left transition-colors whitespace-nowrap text-slate-700">
                         <FileCode size={14} className="text-emerald-600 flex-shrink-0" /> <span className="truncate">Return Table Data as JSON</span>
                     </button>
                 </div>
            </DraggableScrollContainer>
        </RibbonGroup>

        <RibbonGroup label="Power Automate">
             <div className="flex items-center gap-1 h-full">
                 <RibbonButton variant="large" icon={<Workflow size={20} className="text-slate-400" />} label="Flow" subLabel="Templates" disabled onClick={() => {}} />
             </div>
        </RibbonGroup>
    </motion.div>
  );
};

export default memo(AutomateTab);