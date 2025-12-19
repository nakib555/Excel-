
import React, { useState } from 'react';
import { 
    Search, Replace, ArrowRight, Calculator, MessageSquare, 
    LayoutList, Lock, CheckSquare, MousePointer2, Layers
} from 'lucide-react';
import { RibbonButton, SmartDropdown, TabProps } from '../../shared';

interface FindSelectProps extends Pick<TabProps, 'onFindReplace' | 'onSelectSpecial'> {}

const FindSelect: React.FC<FindSelectProps> = ({ onFindReplace, onSelectSpecial }) => {
    const [open, setOpen] = useState(false);

    const handleSelect = (action: () => void) => {
        setOpen(false);
        action();
    };

    return (
        <SmartDropdown
            open={open}
            onToggle={() => setOpen(!open)}
            contentWidth="w-56"
            trigger={
                <RibbonButton 
                    variant="small"
                    icon={<Search size={14} className="text-indigo-600" />} 
                    label="Find & Select" 
                    hasDropdown 
                    onClick={() => {}} 
                />
            }
        >
            <div className="flex flex-col py-1">
                <button 
                    onClick={() => handleSelect(() => onFindReplace?.('find'))}
                    className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors text-left"
                >
                    <Search size={14} className="text-slate-500" />
                    <span className="flex-1">Find...</span>
                    <span className="text-[9px] text-slate-400 font-mono">Ctrl+F</span>
                </button>
                <button 
                    onClick={() => handleSelect(() => onFindReplace?.('replace'))}
                    className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors text-left"
                >
                    <Replace size={14} className="text-slate-500" />
                    <span className="flex-1">Replace...</span>
                    <span className="text-[9px] text-slate-400 font-mono">Ctrl+H</span>
                </button>
                <button 
                    onClick={() => handleSelect(() => onFindReplace?.('goto'))}
                    className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors text-left"
                >
                    <ArrowRight size={14} className="text-slate-500" />
                    <span className="flex-1">Go To...</span>
                    <span className="text-[9px] text-slate-400 font-mono">Ctrl+G</span>
                </button>
                
                <div className="h-[1px] bg-slate-200 my-1 mx-2" />
                
                <button 
                    onClick={() => handleSelect(() => onSelectSpecial?.('formulas'))}
                    className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors text-left"
                >
                    <Calculator size={14} className="text-slate-500" />
                    <span>Formulas</span>
                </button>
                <button 
                    onClick={() => handleSelect(() => onSelectSpecial?.('comments'))}
                    className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors text-left"
                >
                    <MessageSquare size={14} className="text-slate-500" />
                    <span>Comments</span>
                </button>
                <button 
                    onClick={() => handleSelect(() => onSelectSpecial?.('conditional'))}
                    className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors text-left"
                >
                    <LayoutList size={14} className="text-slate-500" />
                    <span>Conditional Formatting</span>
                </button>
                <button 
                    onClick={() => handleSelect(() => onSelectSpecial?.('constants'))}
                    className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors text-left"
                >
                    <Lock size={14} className="text-slate-500" />
                    <span>Constants</span>
                </button>
                <button 
                    onClick={() => handleSelect(() => onSelectSpecial?.('validation'))}
                    className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors text-left"
                >
                    <CheckSquare size={14} className="text-slate-500" />
                    <span>Data Validation</span>
                </button>

                <div className="h-[1px] bg-slate-200 my-1 mx-2" />

                <button 
                    className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors text-left group"
                    onClick={() => {
                        document.body.style.cursor = 'default';
                        setOpen(false);
                    }}
                >
                    <MousePointer2 size={14} className="text-slate-500 group-hover:text-black" />
                    <span>Select Objects</span>
                </button>
                <button 
                    className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors text-left"
                    onClick={() => setOpen(false)}
                >
                    <Layers size={14} className="text-slate-500" />
                    <span>Selection Pane...</span>
                </button>
            </div>
        </SmartDropdown>
    );
};

export default FindSelect;
