
import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Tooltip } from '../../../shared';

const Scale = () => (
    <div className="flex items-center gap-2 text-[10px] text-slate-600">
        <span className="w-10">Scale:</span>
        <Tooltip content="Scale Percentage">
            <div className="border border-slate-300 rounded-md h-6 px-2 w-16 bg-white text-slate-500 flex items-center justify-between shadow-sm hover:border-slate-400 cursor-pointer transition-colors">
                <span>100%</span>
                <div className="flex flex-col -mr-1">
                    <ChevronDown size={8} className="rotate-180 opacity-50" />
                    <ChevronDown size={8} className="opacity-50" />
                </div>
            </div>
        </Tooltip>
    </div>
);

export default Scale;
