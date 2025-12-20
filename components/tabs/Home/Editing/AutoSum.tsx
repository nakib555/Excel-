
import React, { useState } from 'react';
import { Sigma, ChevronDown } from 'lucide-react';
import { RibbonButton, SmartDropdown } from '../../shared';

interface AutoSumProps {
  onAutoSum?: (func?: string) => void;
}

const AutoSum: React.FC<AutoSumProps> = ({ onAutoSum }) => {
    const [open, setOpen] = useState(false);

    const handleSelect = (funcName: string) => {
        if (onAutoSum) onAutoSum(funcName);
        setOpen(false);
    };

    return (
        <div className="flex items-center gap-0">
            {/* Split Button: Main Action (SUM) */}
            <RibbonButton 
                variant="small" 
                icon={<Sigma size={14} className="text-orange-600" />} 
                label="AutoSum" 
                onClick={() => onAutoSum && onAutoSum('SUM')} 
                title="Sum (Alt+=)"
                className="rounded-r-none border-r border-transparent hover:border-slate-300 pr-1"
            />
            
            {/* Split Button: Dropdown Arrow */}
            <SmartDropdown
                open={open}
                onToggle={() => setOpen(!open)}
                contentWidth="w-40"
                trigger={
                    <button 
                        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
                        className={`h-6 w-4 flex items-center justify-center rounded-r-md hover:bg-slate-200 transition-colors ${open ? 'bg-slate-200' : ''}`}
                    >
                        <ChevronDown size={10} className="text-slate-600" />
                    </button>
                }
            >
                <div className="flex flex-col py-1">
                     <button
                        onClick={() => handleSelect('SUM')}
                        className="flex items-center gap-3 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 text-left transition-colors w-full group"
                     >
                        <span className="font-bold text-orange-600 w-4 flex justify-center">Σ</span>
                        <span>Sum</span>
                     </button>
                     <button
                        onClick={() => handleSelect('AVERAGE')}
                        className="flex items-center gap-3 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 text-left transition-colors w-full group"
                     >
                        <span className="w-4"></span>
                        <span>Average</span>
                     </button>
                     <button
                        onClick={() => handleSelect('COUNT')}
                        className="flex items-center gap-3 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 text-left transition-colors w-full group"
                     >
                        <span className="w-4"></span>
                        <span>Count Numbers</span>
                     </button>
                     <button
                        onClick={() => handleSelect('MAX')}
                        className="flex items-center gap-3 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 text-left transition-colors w-full group"
                     >
                        <span className="w-4"></span>
                        <span>Max</span>
                     </button>
                     <button
                        onClick={() => handleSelect('MIN')}
                        className="flex items-center gap-3 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 text-left transition-colors w-full group"
                     >
                        <span className="w-4"></span>
                        <span>Min</span>
                     </button>
                     <div className="border-t border-slate-100 mt-1 pt-1">
                         <button 
                            className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100"
                            onClick={() => { setOpen(false); alert("Function Library: More functions placeholder."); }}
                         >
                             More Functions...
                         </button>
                     </div>
                </div>
            </SmartDropdown>
        </div>
    );
};

export default AutoSum;
