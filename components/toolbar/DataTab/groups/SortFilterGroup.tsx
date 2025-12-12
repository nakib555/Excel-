import React from 'react';
import { ArrowDown, ArrowDownUp, Filter, Eraser, RefreshCw, Sliders } from 'lucide-react';
import { RibbonGroup, RibbonButton, TabProps } from '../../shared';

const SortFilterGroup: React.FC<TabProps> = () => {
  return (
    <RibbonGroup label="Sort & Filter">
        <div className="flex items-center gap-1 h-full">
             <div className="flex flex-col gap-0 justify-center items-center px-1">
                 <RibbonButton variant="small" icon={<div className="flex flex-col text-[8px] font-bold leading-none text-slate-700"><span>A</span><span>Z</span><ArrowDown size={8}/></div>} label="" onClick={() => {}} title="Sort A to Z" />
                 <RibbonButton variant="small" icon={<div className="flex flex-col text-[8px] font-bold leading-none text-slate-700"><span>Z</span><span>A</span><ArrowDown size={8}/></div>} label="" onClick={() => {}} title="Sort Z to A" />
             </div>
             <RibbonButton variant="large" icon={<ArrowDownUp size={20} className="text-slate-700" />} label="Sort" onClick={() => {}} />
             <RibbonButton variant="large" icon={<Filter size={20} className="text-blue-600" />} label="Filter" onClick={() => {}} />
             <div className="flex flex-col gap-0 justify-center">
                 <RibbonButton variant="small" icon={<Eraser size={14} className="text-pink-500" />} label="Clear" disabled onClick={() => {}} />
                 <RibbonButton variant="small" icon={<RefreshCw size={14} className="text-green-600" />} label="Reapply" disabled onClick={() => {}} />
                 <RibbonButton variant="small" icon={<Sliders size={14} className="text-blue-500" />} label="Advanced" onClick={() => {}} />
             </div>
        </div>
    </RibbonGroup>
  );
};

export default SortFilterGroup;