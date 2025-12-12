import React from 'react';
import { ChevronDown } from 'lucide-react';

const FontSelector = () => (
    <div className="w-32 h-7 bg-white border border-slate-300 hover:border-slate-400 rounded flex items-center justify-between px-2 text-xs text-slate-700 shadow-sm cursor-pointer transition-colors">
        <span className="truncate">Inter</span>
        <ChevronDown size={12} className="opacity-50 flex-shrink-0" />
    </div>
);

export default FontSelector;
