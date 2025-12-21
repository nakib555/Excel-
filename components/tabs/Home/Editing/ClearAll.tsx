
import React, { useState } from 'react';
import { Eraser, PaintBucket, FileX, MessageSquareX, Link2Off, Trash2 } from 'lucide-react';
import { RibbonButton, SmartDropdown, TabProps } from '../../shared';

interface ClearAllProps extends Pick<TabProps, 'onClear'> {}

const ClearAll: React.FC<ClearAllProps> = ({ onClear }) => {
    const [open, setOpen] = useState(false);

    return (
        <SmartDropdown
            open={open}
            onToggle={() => setOpen(!open)}
            contentWidth="w-56"
            trigger={
                <RibbonButton 
                    variant="small" 
                    icon={<Eraser size={14} className="text-fuchsia-600" />} 
                    label="Clear" 
                    hasDropdown 
                    active={open}
                    onClick={() => {}} 
                    title="Clear"
                />
            }
        >
            <div className="flex flex-col py-1">
                <button 
                    onClick={() => {
                        if (onClear) onClear();
                        setOpen(false);
                    }}
                    className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors text-left group"
                >
                    <Eraser size={16} className="text-fuchsia-600 group-hover:scale-110 transition-transform" />
                    <span>Clear All</span>
                </button>
                <button className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors text-left group">
                    <div className="relative">
                        <Eraser size={16} className="text-fuchsia-500" />
                        <span className="absolute -bottom-1 -right-1 text-[8px] font-bold text-fuchsia-700 bg-white rounded-full px-0.5">%</span>
                    </div>
                    <span>Clear Formats</span>
                </button>
                <button className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors text-left group">
                    <div className="w-4 flex justify-center">
                        <span className="font-serif border-b border-transparent group-hover:border-slate-400 text-slate-600 underline decoration-slate-300 underline-offset-2">Abc</span>
                    </div>
                    <span>Clear Contents</span>
                </button>
                <button className="flex items-center gap-3 px-3 py-2 text-xs text-slate-400 hover:bg-slate-50 transition-colors text-left cursor-default" disabled>
                    <MessageSquareX size={16} className="text-slate-300" />
                    <span>Clear Comments and Notes</span>
                </button>
                <button className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors text-left group">
                    <Link2Off size={16} className="text-slate-500 group-hover:text-red-500 transition-colors" />
                    <span>Clear Hyperlinks</span>
                </button>
                
                <div className="h-[1px] bg-slate-200 my-1 mx-2" />
                
                <button className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors text-left group">
                    <Trash2 size={16} className="text-slate-400 group-hover:text-red-500 transition-colors" />
                    <span>Remove Hyperlinks</span>
                </button>
            </div>
        </SmartDropdown>
    );
};

export default ClearAll;
