
import React, { useState } from 'react';
import { Merge, ChevronDown, ArrowRight, Grid, LayoutGrid } from 'lucide-react';
import { RibbonButton, SmartDropdown, TabProps } from '../../shared';

interface MergeCenterProps extends Pick<TabProps, 'onMerge'> {}

const MergeCenter: React.FC<MergeCenterProps> = ({ onMerge }) => {
    const [open, setOpen] = useState(false);

    const handleSelect = (type: 'center' | 'across' | 'cells' | 'unmerge') => {
        if (onMerge) onMerge(type);
        setOpen(false);
    };

    return (
        <div className="flex items-center gap-0 h-full">
            {/* Main Button - Defaults to Merge & Center */}
            <RibbonButton
                variant="icon-only"
                icon={<Merge size={16} className="text-slate-600" />}
                onClick={() => onMerge && onMerge('center')}
                title="Merge & Center"
                className="rounded-r-none border-r border-transparent hover:border-slate-300 pr-1"
            />
            
            {/* Dropdown Arrow */}
            <SmartDropdown
                open={open}
                onToggle={() => setOpen(!open)}
                contentWidth="w-48"
                trigger={
                    <button 
                        className={`h-6 w-4 flex items-center justify-center rounded-r-md hover:bg-slate-200 transition-colors ${open ? 'bg-slate-200' : ''}`}
                    >
                        <ChevronDown size={10} className="text-slate-600" />
                    </button>
                }
            >
                <div className="flex flex-col py-1">
                    <button onClick={() => handleSelect('center')} className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 text-left transition-colors group">
                        <Merge size={16} className="text-slate-500 group-hover:text-slate-700" />
                        <span>Merge & Center</span>
                    </button>
                    <button onClick={() => handleSelect('across')} className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 text-left transition-colors group">
                        <ArrowRight size={16} className="text-slate-500 group-hover:text-slate-700" />
                        <span>Merge Across</span>
                    </button>
                    <button onClick={() => handleSelect('cells')} className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 text-left transition-colors group">
                        <Grid size={16} className="text-slate-500 group-hover:text-slate-700" />
                        <span>Merge Cells</span>
                    </button>
                    <button onClick={() => handleSelect('unmerge')} className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 text-left transition-colors group">
                        <LayoutGrid size={16} className="text-slate-500 group-hover:text-slate-700" />
                        <span>Unmerge Cells</span>
                    </button>
                </div>
            </SmartDropdown>
        </div>
    );
};

export default MergeCenter;
