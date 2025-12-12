import React from 'react';
import { ChevronDown, Save, EyeOff } from 'lucide-react';
import { RibbonGroup, RibbonButton, TabProps } from '../../shared';

const SheetViewGroup: React.FC<TabProps> = () => {
  return (
    <RibbonGroup label="Sheet View">
         <div className="flex items-center gap-1 h-full">
             <div className="flex flex-col gap-0 justify-center">
                 <div className="bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] rounded text-slate-500 w-24 flex justify-between items-center">Default <ChevronDown size={8}/></div>
                 <div className="flex gap-1 mt-1">
                      <RibbonButton variant="icon-only" icon={<Save size={14} className="text-slate-400" />} disabled onClick={() => {}} />
                      <RibbonButton variant="icon-only" icon={<EyeOff size={14} className="text-slate-400" />} disabled onClick={() => {}} />
                 </div>
             </div>
         </div>
    </RibbonGroup>
  );
};

export default SheetViewGroup;