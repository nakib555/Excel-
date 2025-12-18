
import React from 'react';
import { ChevronDown } from 'lucide-react';

const DefaultViewSelector = () => (
    <div className="bg-white border border-slate-300 px-2 h-6 text-[10px] rounded-md text-slate-500 w-24 flex justify-between items-center cursor-pointer shadow-sm hover:border-slate-400 transition-colors">
        <span>Default</span> 
        <ChevronDown size={10} className="opacity-50" />
    </div>
);

export default DefaultViewSelector;
