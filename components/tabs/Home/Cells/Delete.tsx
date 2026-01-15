
import React, { useState } from 'react';
import { X, Table, Sheet, Trash2 } from 'lucide-react';
import { RibbonButton, SmartDropdown, TabProps } from '../../shared';

interface DeleteProps extends Pick<TabProps, 'onDeleteRow' | 'onDeleteColumn' | 'onDeleteSheet' | 'onDeleteCells'> {}

const Delete: React.FC<DeleteProps> = ({ onDeleteRow, onDeleteColumn, onDeleteSheet, onDeleteCells }) => {
    const [open, setOpen] = useState(false);

    return (
        <SmartDropdown
            open={open}
            onToggle={() => setOpen(!open)}
            contentWidth="w-56"
            trigger={
                <RibbonButton 
                    variant="small" 
                    icon={<X size={14} className="text-rose-600" />} 
                    label="Delete" 
                    hasDropdown 
                    onClick={() => {}} 
                    title="Delete Cells"
                />
            }
        >
            <div className="flex flex-col py-1">
                <button 
                    onClick={() => { onDeleteCells?.(); setOpen(false); }}
                    className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors text-left"
                >
                    <Table size={14} className="text-rose-500" />
                    <span>Delete Cells...</span>
                </button>
                <button 
                    onClick={() => { onDeleteRow?.(); setOpen(false); }}
                    className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors text-left"
                >
                    <Trash2 size={14} className="text-rose-500" />
                    <span>Delete Sheet Rows</span>
                </button>
                <button 
                    onClick={() => { onDeleteColumn?.(); setOpen(false); }}
                    className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors text-left"
                >
                    <Trash2 size={14} className="text-rose-500 rotate-90" />
                    <span>Delete Sheet Columns</span>
                </button>
                <button 
                    onClick={() => { onDeleteSheet?.(); setOpen(false); }}
                    className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors text-left"
                >
                    <Sheet size={14} className="text-rose-500" />
                    <span>Delete Sheet</span>
                </button>
            </div>
        </SmartDropdown>
    );
};

export default Delete;
