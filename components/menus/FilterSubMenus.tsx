
import React from 'react';
import { Palette, PaintBucket, Calculator } from 'lucide-react';

const Separator = () => <div className="h-[1px] bg-slate-100 my-1 mx-4" />;

export const ColorSortMenu = () => {
    return (
        <div className="py-2 w-max">
            <div className="px-4 py-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">Cell Color</div>
            <button className="w-full text-left px-4 py-2 text-[13px] hover:bg-blue-50 text-slate-700 flex items-center gap-3 transition-colors">
                <div className="w-4 h-4 bg-red-100 border border-red-200 rounded-[3px] shadow-sm"></div>
                <span>Light Red</span>
            </button>
            <button className="w-full text-left px-4 py-2 text-[13px] hover:bg-blue-50 text-slate-700 flex items-center gap-3 transition-colors">
                <div className="w-4 h-4 bg-white border border-slate-200 rounded-[3px] shadow-sm"></div>
                <span>No Fill</span>
            </button>
        </div>
    );
};

export const ColorFilterMenu = () => {
    return (
        <div className="py-2 w-max">
            <div className="px-4 py-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">Cell Color</div>
            <button className="w-full text-left px-4 py-2 text-[13px] hover:bg-blue-50 text-slate-700 flex items-center gap-3 transition-colors">
                <div className="w-4 h-4 bg-red-100 border border-red-200 rounded-[3px]"></div>
                <span>Light Red</span>
            </button>
            <button className="w-full text-left px-4 py-2 text-[13px] hover:bg-blue-50 text-slate-700 flex items-center gap-3 transition-colors">
                <div className="w-4 h-4 bg-white border border-slate-200 rounded-[3px]"></div>
                <span>No Fill</span>
            </button>
        </div>
    );
};

export const NumberFilterMenu = () => {
    return (
        <div className="py-1 w-max">
            {[
                'Equals...', 'Does Not Equal...', 'Greater Than...', 'Greater Than Or Equal To...',
                'Less Than...', 'Less Than Or Equal To...', 'Between...', 'Top 10...', 
                'Above Average', 'Below Average'
            ].map((label, i) => (
                <button key={i} className="w-full text-left px-4 py-2 text-[13px] text-slate-700 hover:bg-blue-50 transition-colors whitespace-nowrap">
                    {label}
                </button>
            ))}
            <Separator />
            <button className="w-full text-left px-4 py-2 text-[13px] text-slate-700 hover:bg-blue-50 font-medium whitespace-nowrap">Custom Filter...</button>
        </div>
    );
};
