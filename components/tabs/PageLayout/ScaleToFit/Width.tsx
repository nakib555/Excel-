
import React from 'react';
import { ChevronDown } from 'lucide-react';

const Width = () => (
    <div className="flex items-center gap-2 text-[10px] text-slate-600">
        <span className="w-10">Width:</span>
        <div className="border border-slate-300 rounded-md h-6 px-2 w-20 bg-white text-slate-500 flex items-center justify-between shadow-sm hover:border-slate-400 cursor-pointer transition-colors">
            <span>Automatic</span>
            <ChevronDown size={10} className="opacity-50" />
        </div>
    </div>
);

export default Width;
