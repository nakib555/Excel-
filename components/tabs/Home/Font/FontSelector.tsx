
import React, { useState } from 'react';
import { ChevronDown, Type } from 'lucide-react';
import { SmartDropdown } from '../../shared';

const FONTS = ['Inter', 'Arial', 'Calibri', 'Times New Roman', 'Courier New', 'Verdana'];

const FontSelector = () => {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState('Inter');

    return (
        <SmartDropdown
            open={open}
            onToggle={() => setOpen(!open)}
            contentWidth="w-48"
            triggerClassName="h-auto"
            trigger={
                <div className="w-32 h-7 bg-white border border-slate-300 hover:border-slate-400 rounded-md flex items-center justify-between px-2 text-xs text-slate-700 shadow-sm cursor-pointer transition-colors">
                    <span className="truncate">{selected}</span>
                    <ChevronDown size={12} className="opacity-50 flex-shrink-0" />
                </div>
            }
        >
             <div className="flex flex-col p-1">
                {FONTS.map((font, idx) => (
                    <div 
                        key={font} 
                        onClick={() => { setSelected(font); setOpen(false); }}
                        className="px-2 py-1.5 hover:bg-slate-100 cursor-pointer text-xs rounded-sm text-slate-700 flex items-center gap-2"
                        style={{ fontFamily: font }}
                    >
                        <div className={`w-5 h-5 flex items-center justify-center rounded bg-slate-50 border border-slate-100 text-slate-500`}>
                            <Type size={12} className={idx % 2 === 0 ? "text-indigo-500" : "text-violet-500"} />
                        </div>
                        {font}
                    </div>
                ))}
             </div>
        </SmartDropdown>
    );
};

export default FontSelector;
