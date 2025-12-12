import React from 'react';
import { ChevronDown } from 'lucide-react';

const DefaultViewSelector = () => (
    <div className="bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] rounded text-slate-500 w-24 flex justify-between items-center cursor-pointer">Default <ChevronDown size={8}/></div>
);

export default DefaultViewSelector;