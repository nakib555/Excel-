
import React from 'react';
import { RibbonButton } from '../../shared';

const Orientation = () => (
    <RibbonButton 
        variant="icon-only" 
        icon={
            <div className="flex items-end justify-center w-full h-full relative">
                 <span className="font-serif italic font-bold -rotate-45 text-[10px] text-slate-700 absolute left-0.5 top-0.5">ab</span>
                 <span className="text-[10px] font-bold text-slate-600 absolute right-0.5 bottom-0.5 mb-0.5">↗</span>
            </div>
        } 
        onClick={() => {}} 
        title="Orientation" 
        hasDropdown
    />
);

export default Orientation;
