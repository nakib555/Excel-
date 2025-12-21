
import React, { useState } from 'react';
import { ArrowDown, ArrowRight, ArrowUp, ArrowLeft, Layers, AlignJustify, Zap, ChevronDown } from 'lucide-react';
import { RibbonButton, SmartDropdown } from '../../shared';

const Fill = () => {
    const [open, setOpen] = useState(false);

    return (
        <SmartDropdown
            open={open}
            onToggle={() => setOpen(!open)}
            contentWidth="w-48"
            trigger={
                <RibbonButton 
                    variant="small" 
                    icon={<ArrowDown size={14} className="text-blue-600" />} 
                    label="Fill" 
                    hasDropdown 
                    active={open}
                    onClick={() => {}} 
                />
            }
        >
            <div className="flex flex-col py-1">
                <button className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors text-left group">
                    <ArrowDown size={16} className="text-blue-500 group-hover:scale-110 transition-transform" />
                    <span className="flex-1">Down</span>
                    <span className="text-[9px] text-slate-400 font-mono">Ctrl+D</span>
                </button>
                <button className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors text-left group">
                    <ArrowRight size={16} className="text-blue-500 group-hover:scale-110 transition-transform" />
                    <span className="flex-1">Right</span>
                    <span className="text-[9px] text-slate-400 font-mono">Ctrl+R</span>
                </button>
                <button className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors text-left group">
                    <ArrowUp size={16} className="text-blue-500 group-hover:scale-110 transition-transform" />
                    <span>Up</span>
                </button>
                <button className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors text-left group">
                    <ArrowLeft size={16} className="text-blue-500 group-hover:scale-110 transition-transform" />
                    <span>Left</span>
                </button>
                
                <div className="h-[1px] bg-slate-200 my-1 mx-2" />
                
                <button className="flex items-center gap-3 px-3 py-2 text-xs text-slate-400 hover:bg-slate-50 transition-colors text-left cursor-default" disabled>
                    <div className="w-4"></div>
                    <span>Across Worksheets...</span>
                </button>
                
                <button className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors text-left group">
                    <Layers size={16} className="text-slate-500 group-hover:text-slate-700" />
                    <span>Series...</span>
                </button>
                <button className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors text-left group">
                    <AlignJustify size={16} className="text-slate-500 group-hover:text-slate-700" />
                    <span>Justify</span>
                </button>
                <button className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors text-left group">
                    <Zap size={16} className="text-amber-500 fill-amber-100 group-hover:scale-110 transition-transform" />
                    <span className="flex-1">Flash Fill</span>
                    <span className="text-[9px] text-slate-400 font-mono">Ctrl+E</span>
                </button>
            </div>
        </SmartDropdown>
    );
};

export default Fill;
