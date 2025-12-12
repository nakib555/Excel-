import React from 'react';
import { FileCode } from 'lucide-react';

const UnhideAllRowsCols = () => (
    <button className="flex items-center gap-2 px-2 py-0.5 bg-transparent hover:bg-slate-100 border border-transparent hover:border-slate-200 rounded-sm text-[11px] w-56 text-left transition-colors whitespace-nowrap text-slate-700">
        <FileCode size={14} className="text-emerald-600 flex-shrink-0" /> <span className="truncate">Unhide All Rows and Columns</span>
    </button>
);

export default UnhideAllRowsCols;