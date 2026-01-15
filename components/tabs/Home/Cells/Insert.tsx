
import React, { useState } from 'react';
import { Plus, ArrowRight, ArrowDown, Sheet, Table } from 'lucide-react';
import { RibbonButton, SmartDropdown, TabProps } from '../../shared';

interface InsertProps extends Pick<TabProps, 'onInsertRow' | 'onInsertColumn' | 'onInsertSheet' | 'onInsertCells'> {}

const Insert: React.FC<InsertProps> = ({ onInsertRow, onInsertColumn, onInsertSheet, onInsertCells }) => {
    const [open, setOpen] = useState(false);

    return (
        <SmartDropdown
            open={open}
            onToggle={() => setOpen(!open)}
            contentWidth="w-56"
            trigger={
                <RibbonButton 
                    variant="small" 
                    icon={<Plus size={14} className="text-emerald-600" />} 
                    label="Insert" 
                    hasDropdown 
                    onClick={() => {}} 
                    title="Insert Cells"
                />
            }
        >
            <div className="flex flex-col py-1">
                <button 
                    onClick={() => { onInsertCells?.(); setOpen(false); }}
                    className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors text-left"
                >
                    <Table size={14} className="text-emerald-600" />
                    <span>Insert Cells...</span>
                </button>
                <button 
                    onClick={() => { onInsertRow?.(); setOpen(false); }}
                    className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors text-left"
                >
                    <ArrowRight size={14} className="text-emerald-600" />
                    <span>Insert Sheet Rows</span>
                </button>
                <button 
                    onClick={() => { onInsertColumn?.(); setOpen(false); }}
                    className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors text-left"
                >
                    <ArrowDown size={14} className="text-emerald-600" />
                    <span>Insert Sheet Columns</span>
                </button>
                <button 
                    onClick={() => { onInsertSheet?.(); setOpen(false); }}
                    className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors text-left"
                >
                    <Sheet size={14} className="text-emerald-600" />
                    <span>Insert Sheet</span>
                </button>
            </div>
        </SmartDropdown>
    );
};

export default Insert;
