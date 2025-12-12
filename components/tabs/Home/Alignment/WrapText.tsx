import React from 'react';
import { WrapText as WrapTextIcon } from 'lucide-react';

const WrapText = () => (
    <button className="flex items-center gap-2 px-2 py-0.5 hover:bg-slate-100 rounded text-[11px] font-medium text-slate-700 w-full text-left transition-colors h-7">
        <WrapTextIcon size={16} className="text-blue-500" />
        <span>Wrap Text</span>
    </button>
);

export default WrapText;
