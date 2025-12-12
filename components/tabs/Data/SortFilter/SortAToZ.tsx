import React from 'react';
import { ArrowDown } from 'lucide-react';
import { RibbonButton } from '../../../shared';

const SortAToZ = () => (
    <RibbonButton 
        variant="small" 
        icon={<div className="flex flex-col text-[8px] font-bold leading-none text-slate-700"><span>A</span><span>Z</span><ArrowDown size={8}/></div>} 
        label="" 
        onClick={() => {}} 
        title="Sort A to Z" 
    />
);

export default SortAToZ;