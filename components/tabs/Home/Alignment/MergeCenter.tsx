import React from 'react';
import { Merge, ChevronDown } from 'lucide-react';

const MergeCenter = () => (
    <button className="flex items-center gap-2 px-2 py-0.5 hover:bg-slate-100 rounded text-[11px] font-medium text-slate-700 w-full text-left transition-colors h-7">
        <Merge size={16} className="text-emerald-500" />
        <span>Merge & Center</span>
        <ChevronDown size={10} className="ml-auto opacity-50 stroke-[3]" />
    </button>
);

export default MergeCenter;
