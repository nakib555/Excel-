import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { 
  ScrollText, List, FileCode, Workflow 
} from 'lucide-react';
import { RibbonGroup, RibbonButton, DraggableScrollContainer, TabProps } from './shared';

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
                 <RibbonButton variant="large" icon={<Workflow size={20} className="text-slate-400" />} label="Flow" subLabel="Templates" disabled onClick={() => {}} />
             </div>
        </RibbonGroup>
    </motion.div>
  );
};

export default memo(AutomateTab);