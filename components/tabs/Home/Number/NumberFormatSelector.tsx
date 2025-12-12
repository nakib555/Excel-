import React from 'react';
import { ChevronDown } from 'lucide-react';

const NumberFormatSelector = () => (
    <div className="w-32 md:w-32 h-7 bg-white border border-slate-300 rounded flex items-center justify-between px-2 text-xs text-slate-700 shadow-sm cursor-pointer hover:border-slate-400">
        <span>General</span>
        <ChevronDown size={10} className="opacity-50" />
    </div>
);

export default NumberFormatSelector;
