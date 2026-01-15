import React, { useState } from 'react';
import { 
    Search, Replace, ArrowRight, Calculator, MessageSquare, 
    LayoutList, Lock, CheckSquare, MousePointer2, Layers
} from 'lucide-react';
import { RibbonButton, SmartDropdown, TabProps, Tooltip } from '../../shared';

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
                    variant="large"
                    icon={<Search size={20} className="text-indigo-600" />} 
                    label="Find &" 
                    subLabel="Select"
                    hasDropdown 
                    onClick={() => {}} 
                    title="Find & Select (Ctrl+F)"
                />
            }
        >
            <div className="flex flex-col py-1">
                <Tooltip content="Find text" side="right">
                    <button 
                        onClick={() => handleSelect(() => onFindReplace?.('find'))}
                        className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors text-left group"
                    >
                        <Search size={14} className="text-blue-500 group-hover:scale-110 transition-transform" />
                        <span className="flex-1">Find...</span>
                        <span className="text-[9px] text-slate-400 font-mono">Ctrl+F</span>
                    </button>
                </Tooltip>
                <Tooltip content="Replace text" side="right">
                    <button 
                        onClick={() => handleSelect(() => onFindReplace?.('replace'))}
                        className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors text-left group"
                    >
                        <Replace size={14} className="text-orange-500 group-hover:scale-110 transition-transform" />
                        <span className="flex-1">Replace...</span>
                        <span className="text-[9px] text-slate-400 font-mono">Ctrl+H</span>
                    </button>
                </Tooltip>
                <Tooltip content="Go to specific cell" side="right">
                    <button 
                        onClick={() => handleSelect(() => onFindReplace?.('goto'))}
                        className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors text-left group"
                    >
                        <ArrowRight size={14} className="text-green-500 group-hover:scale-110 transition-transform" />
                        <span className="flex-1">Go To...</span>
                        <span className="text-[9px] text-slate-400 font-mono">Ctrl+G</span>
                    </button>
                </Tooltip>
                
                <div className="h-[1px] bg-slate-200 my-1 mx-2" />
                
                <Tooltip content="Select cells with formulas" side="right">
                    <button 
                        onClick={() => handleSelect(() => onSelectSpecial?.('formulas'))}
                        className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors text-left group"
                    >
                        <Calculator size={14} className="text-purple-500 group-hover:scale-110 transition-transform" />
                        <span>Formulas</span>
                    </button>
                </Tooltip>
                <Tooltip content="Select cells with comments" side="right">
                    <button 
                        onClick={() => handleSelect(() => onSelectSpecial?.('comments'))}
                        className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors text-left group"
                    >
                        <MessageSquare size={14} className="text-yellow-500 group-hover:scale-110 transition-transform" />
                        <span>Comments</span>
                    </button>
                </Tooltip>
                <Tooltip content="Select cells with conditional formatting" side="right">
                    <button 
                        onClick={() => handleSelect(() => onSelectSpecial?.('conditional'))}
                        className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors text-left group"
                    >
                        <LayoutList size={14} className="text-pink-500 group-hover:scale-110 transition-transform" />
                        <span>Conditional Formatting</span>
                    </button>
                </Tooltip>
                <Tooltip content="Select cells with constants" side="right">
                    <button 
                        onClick={() => handleSelect(() => onSelectSpecial?.('constants'))}
                        className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors text-left group"
                    >
                        <Lock size={14} className="text-cyan-500 group-hover:scale-110 transition-transform" />
                        <span>Constants</span>
                    </button>
                </Tooltip>
                <Tooltip content="Select cells with data validation" side="right">
                    <button 
                        onClick={() => handleSelect(() => onSelectSpecial?.('validation'))}
                        className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors text-left group"
                    >
                        <CheckSquare size={14} className="text-emerald-500 group-hover:scale-110 transition-transform" />
                        <span>Data Validation</span>
                    </button>
                </Tooltip>

                <div className="h-[1px] bg-slate-200 my-1 mx-2" />

                <Tooltip content="Select objects" side="right">
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
                </Tooltip>
                <Tooltip content="Show selection pane" side="right">
                    <button 
                        className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors text-left group"
                        onClick={() => setOpen(false)}
                    >
                        <Layers size={14} className="text-indigo-400 group-hover:text-indigo-600" />
                        <span>Selection Pane...</span>
                    </button>
                </Tooltip>
            </div>
        </SmartDropdown>
    );
};

export default FindSelect;