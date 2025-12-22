
import React, { useState } from 'react';
import { RibbonButton, SmartDropdown, TabProps } from '../../shared';
import { ArrowUpRight, ArrowDownRight, ArrowUp, ArrowDown, RotateCw, RotateCcw, Settings2 } from 'lucide-react';

interface OrientationProps extends Pick<TabProps, 'currentStyle' | 'onToggleStyle' | 'onOpenFormatDialog' | 'onApplyStyle' | 'onResetSize'> {}

const Orientation: React.FC<OrientationProps> = ({ currentStyle, onToggleStyle, onOpenFormatDialog, onApplyStyle, onResetSize }) => {
    const [open, setOpen] = useState(false);

    const handleSelect = (rotation: number | undefined, vertical: boolean | undefined) => {
        if (onApplyStyle) {
            onApplyStyle({ textRotation: rotation, verticalText: vertical });
        } else {
            onToggleStyle('textRotation', rotation);
            onToggleStyle('verticalText', vertical);
        }
        setOpen(false);
    };

    const handleReset = () => {
        // Only reset rotation-related properties to preserve user's alignment choices
        if (onApplyStyle) {
            onApplyStyle({
                textRotation: 0,
                verticalText: false
            });
        } else {
            onToggleStyle('textRotation', 0);
            onToggleStyle('verticalText', false);
        }
        
        // Also reset cell sizes if handler provided
        if (onResetSize) {
            onResetSize();
        }
        
        setOpen(false);
    };

    return (
        <SmartDropdown
            open={open}
            onToggle={() => setOpen(!open)}
            contentWidth="w-56"
            trigger={
                <RibbonButton 
                    variant="icon-only" 
                    icon={
                        <div className="flex items-end justify-center w-full h-full relative">
                             <span className="font-serif italic font-bold -rotate-45 text-[10px] text-slate-700 absolute left-0.5 top-0.5">ab</span>
                        </div>
                    } 
                    onClick={() => {}} // Handled by SmartDropdown
                    title="Orientation" 
                    hasDropdown
                    active={!!currentStyle.textRotation || !!currentStyle.verticalText}
                />
            }
        >
            <div className="flex flex-col py-1">
                <button 
                    onClick={() => handleSelect(45, undefined)}
                    className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors text-left w-full"
                >
                    <ArrowUpRight size={16} className="text-slate-500" />
                    <span>Angle Counterclockwise</span>
                </button>
                <button 
                    onClick={() => handleSelect(-45, undefined)}
                    className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors text-left w-full"
                >
                    <ArrowDownRight size={16} className="text-slate-500" />
                    <span>Angle Clockwise</span>
                </button>
                <button 
                    onClick={() => handleSelect(undefined, true)}
                    className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors text-left w-full"
                >
                    <div className="w-4 flex flex-col items-center leading-[0.6] font-mono text-[9px] font-bold text-slate-500">
                        <span>v</span><span>e</span><span>r</span>
                    </div>
                    <span>Vertical Text</span>
                </button>
                <button 
                    onClick={() => handleSelect(90, undefined)}
                    className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors text-left w-full"
                >
                    <ArrowUp size={16} className="text-slate-500" />
                    <span>Rotate Text Up</span>
                </button>
                <button 
                    onClick={() => handleSelect(-90, undefined)}
                    className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors text-left w-full"
                >
                    <ArrowDown size={16} className="text-slate-500" />
                    <span>Rotate Text Down</span>
                </button>
                
                <div className="h-[1px] bg-slate-200 my-1 mx-2" />
                
                <button 
                    onClick={() => {
                        setOpen(false);
                        onOpenFormatDialog?.('Alignment');
                    }}
                    className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors text-left w-full group"
                >
                    <Settings2 size={16} className="text-slate-500 group-hover:text-slate-800" />
                    <span>Format Cell Alignment</span>
                </button>

                <button 
                    onClick={handleReset}
                    className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors text-left w-full group"
                >
                    <RotateCcw size={16} className="text-red-500 group-hover:text-red-600" />
                    <span>Reset Alignment</span>
                </button>
            </div>
        </SmartDropdown>
    );
};

export default Orientation;
