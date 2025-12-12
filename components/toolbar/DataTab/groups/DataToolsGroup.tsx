import React from 'react';
import { Columns, CheckSquare, X, ShieldCheck, Merge, Link2 } from 'lucide-react';
import { RibbonGroup, RibbonButton, TabProps } from '../../shared';

const DataToolsGroup: React.FC<TabProps> = () => {
  return (
    <RibbonGroup label="Data Tools">
         <div className="flex items-center gap-1 h-full">
             <RibbonButton variant="large" icon={<Columns size={20} className="text-blue-500" />} label="Text to" subLabel="Columns" onClick={() => {}} />
             <div className="flex flex-col gap-0 justify-center">
                 <RibbonButton variant="small" icon={<CheckSquare size={14} className="text-violet-500" />} label="Flash Fill" onClick={() => {}} />
                 <RibbonButton variant="small" icon={<X size={14} className="text-red-500" />} label="Remove Duplicates" onClick={() => {}} />
                 <RibbonButton variant="small" icon={<ShieldCheck size={14} className="text-green-600" />} label="Data Validation" hasDropdown onClick={() => {}} />
             </div>
             <div className="flex flex-col gap-0 justify-center">
                  <RibbonButton variant="small" icon={<Merge size={14} className="text-blue-500" />} label="Consolidate" onClick={() => {}} />
                  <RibbonButton variant="small" icon={<Link2 size={14} className="text-slate-400" />} label="Relationships" disabled onClick={() => {}} />
             </div>
         </div>
    </RibbonGroup>
  );
};

export default DataToolsGroup;