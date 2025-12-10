import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { 
  Database, FileText, Globe, Table, RefreshCw, List, Settings, Link2, 
  Landmark, Coins, ArrowDown, ArrowDownUp, Filter, Eraser, Sliders, Columns, 
  CheckSquare, X, ShieldCheck, Merge 
} from 'lucide-react';
import { RibbonGroup, RibbonButton, TabProps } from './shared';

const DataTab: React.FC<TabProps> = () => {
  return (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex h-full min-w-max gap-1"
    >
        <RibbonGroup label="Get & Transform Data">
            <div className="flex items-center gap-1 h-full">
                <RibbonButton variant="large" icon={<Database size={20} />} label="Get" subLabel="Data" hasDropdown onClick={() => {}} />
                <RibbonButton variant="large" icon={<FileText size={20} />} label="From Text/" subLabel="CSV" onClick={() => {}} />
                <RibbonButton variant="large" icon={<Globe size={20} />} label="From" subLabel="Web" onClick={() => {}} />
                <RibbonButton variant="large" icon={<Table size={20} />} label="From Table/" subLabel="Range" onClick={() => {}} />
            </div>
        </RibbonGroup>

        <RibbonGroup label="Queries & Connections">
             <div className="flex items-center gap-1 h-full">
                 <RibbonButton variant="large" icon={<RefreshCw size={20} className="text-green-600" />} label="Refresh" subLabel="All" hasDropdown onClick={() => {}} />
                 <div className="flex flex-col gap-0 justify-center">
                     <RibbonButton variant="small" icon={<List size={14} />} label="Queries & Connections" onClick={() => {}} />
                     <RibbonButton variant="small" icon={<Settings size={14} />} label="Properties" disabled onClick={() => {}} />
                     <RibbonButton variant="small" icon={<Link2 size={14} />} label="Edit Links" disabled onClick={() => {}} />
                 </div>
             </div>
        </RibbonGroup>

        <RibbonGroup label="Data Types">
             <div className="flex items-center gap-1 h-full">
                 <RibbonButton variant="large" icon={<Landmark size={20} />} label="Stocks" onClick={() => {}} />
                 <RibbonButton variant="large" icon={<Coins size={20} />} label="Currencies" onClick={() => {}} />
             </div>
        </RibbonGroup>

        <RibbonGroup label="Sort & Filter">
            <div className="flex items-center gap-1 h-full">
                 <div className="flex flex-col gap-0 justify-center items-center px-1">
                     <RibbonButton variant="small" icon={<div className="flex flex-col text-[8px] font-bold leading-none"><span>A</span><span>Z</span><ArrowDown size={8}/></div>} label="" onClick={() => {}} title="Sort A to Z" />
                     <RibbonButton variant="small" icon={<div className="flex flex-col text-[8px] font-bold leading-none"><span>Z</span><span>A</span><ArrowDown size={8}/></div>} label="" onClick={() => {}} title="Sort Z to A" />
                 </div>
                 <RibbonButton variant="large" icon={<ArrowDownUp size={20} />} label="Sort" onClick={() => {}} />
                 <RibbonButton variant="large" icon={<Filter size={20} />} label="Filter" onClick={() => {}} />
                 <div className="flex flex-col gap-0 justify-center">
                     <RibbonButton variant="small" icon={<Eraser size={14} />} label="Clear" disabled onClick={() => {}} />
                     <RibbonButton variant="small" icon={<RefreshCw size={14} />} label="Reapply" disabled onClick={() => {}} />
                     <RibbonButton variant="small" icon={<Sliders size={14} />} label="Advanced" onClick={() => {}} />
                 </div>
            </div>
        </RibbonGroup>

         <RibbonGroup label="Data Tools">
             <div className="flex items-center gap-1 h-full">
                 <RibbonButton variant="large" icon={<Columns size={20} />} label="Text to" subLabel="Columns" onClick={() => {}} />
                 <div className="flex flex-col gap-0 justify-center">
                     <RibbonButton variant="small" icon={<CheckSquare size={14} />} label="Flash Fill" onClick={() => {}} />
                     <RibbonButton variant="small" icon={<X size={14} className="text-red-500" />} label="Remove Duplicates" onClick={() => {}} />
                     <RibbonButton variant="small" icon={<ShieldCheck size={14} />} label="Data Validation" hasDropdown onClick={() => {}} />
                 </div>
                 <div className="flex flex-col gap-0 justify-center">
                      <RibbonButton variant="small" icon={<Merge size={14} />} label="Consolidate" onClick={() => {}} />
                      <RibbonButton variant="small" icon={<Link2 size={14} />} label="Relationships" disabled onClick={() => {}} />
                 </div>
             </div>
        </RibbonGroup>
    </motion.div>
  );
};

export default memo(DataTab);