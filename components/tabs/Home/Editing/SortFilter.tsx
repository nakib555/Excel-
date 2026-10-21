
import React, { useState } from 'react';
import { 
    ArrowDownUp, 
    ArrowDownAZ, 
    ArrowUpAZ, 
    SlidersHorizontal, 
    Filter, 
    FilterX, 
    RefreshCw 
} from 'lucide-react';
import { RibbonButton, SmartDropdown, Tooltip } from '../../shared';

interface SortFilterProps {
    onSort?: (direction: 'asc' | 'desc') => void;
    onToggleFilter?: () => void;
}

const SortFilter: React.FC<SortFilterProps> = ({ onSort, onToggleFilter }) => {
    const [open, setOpen] = useState(false);

    return (
        <SmartDropdown
            open={open}
            onToggle={() => setOpen(!open)}
            contentWidth="w-48"
            trigger={
                <RibbonButton 
                    variant="large" 
                    icon={<ArrowDownUp size={20} className="text-blue-600" />} 
                    label="Sort &" 
                    subLabel="Filter" 
                    active={open}
                    hasDropdown 
                    onClick={() => {}} 
                />
            }
        >
            <div className="flex flex-col py-1">
                <Tooltip content="Sort A to Z (Ascending)" side="right">
                    <button 
                        className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors text-left group w-full"
                        onClick={() => {
                            if (onSort) onSort('asc');
                            setOpen(false);
                        }}
                    >
                        <ArrowDownAZ size={16} className="text-slate-500 group-hover:text-blue-600" />
                        <span>Sort A to Z</span>
                    </button>
                </Tooltip>
                <Tooltip content="Sort Z to A (Descending)" side="right">
                    <button 
                        className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors text-left group w-full"
                        onClick={() => {
                            if (onSort) onSort('desc');
                            setOpen(false);
                        }}
                    >
                        <ArrowUpAZ size={16} className="text-slate-500 group-hover:text-blue-600" />
                        <span>Sort Z to A</span>
                    </button>
                </Tooltip>
                <Tooltip content="Custom Sort" side="right">
                    <button 
                        className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors text-left group w-full"
                        onClick={() => {
                            if (onSort) onSort('asc');
                            setOpen(false);
                        }}
                    >
                        <SlidersHorizontal size={16} className="text-slate-500 group-hover:text-blue-600" />
                        <span>Custom Sort...</span>
                    </button>
                </Tooltip>
                
                <div className="h-[1px] bg-slate-200 my-1 mx-2" />
                
                <Tooltip content="Turn on filtering for selected cells" side="right">
                    <button 
                        className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors text-left group w-full"
                        onClick={() => {
                            if (onToggleFilter) onToggleFilter();
                            setOpen(false);
                        }}
                    >
                        <Filter size={16} className="text-slate-500 group-hover:text-blue-600" />
                        <span>Filter</span>
                    </button>
                </Tooltip>
                <Tooltip content="Clear filter" side="right">
                    <button 
                        className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors text-left group w-full" 
                        onClick={() => {
                            if (onToggleFilter) onToggleFilter();
                            setOpen(false);
                        }}
                    >
                        <FilterX size={16} className="text-slate-500" />
                        <span>Clear</span>
                    </button>
                </Tooltip>
                <Tooltip content="Reapply filter" side="right">
                    <button 
                        className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors text-left group w-full" 
                        onClick={() => {
                            if (onSort) onSort('asc');
                            setOpen(false);
                        }}
                    >
                        <RefreshCw size={16} className="text-slate-500" />
                        <span>Reapply</span>
                    </button>
                </Tooltip>
            </div>
        </SmartDropdown>
    );
};

export default SortFilter;