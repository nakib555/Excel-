
import React from 'react';
import { RibbonGroup, Tooltip } from '../../shared';
import { Table } from '../../../../types';

interface TableStyleOptionsGroupProps {
    table: Table;
    onChange: (key: keyof Table, val: any) => void;
}

const TableStyleOptionsGroup: React.FC<TableStyleOptionsGroupProps> = ({ table, onChange }) => {
    return (
        <RibbonGroup label="Table Style Options">
            <div className="grid grid-flow-col grid-rows-3 gap-x-4 gap-y-0.5 h-full content-center px-1">
                {/* Column 1 */}
                <Tooltip content="Toggle Header Row">
                    <label className="flex items-center gap-2 text-[11px] text-slate-700 cursor-pointer select-none">
                        <input 
                            type="checkbox" 
                            checked={table.headerRow} 
                            onChange={(e) => onChange('headerRow', e.target.checked)}
                            className="accent-emerald-600 rounded-[2px]"
                        />
                        Header Row
                    </label>
                </Tooltip>
                <Tooltip content="Toggle Total Row">
                    <label className="flex items-center gap-2 text-[11px] text-slate-700 cursor-pointer select-none">
                        <input 
                            type="checkbox" 
                            checked={table.totalRow} 
                            onChange={(e) => onChange('totalRow', e.target.checked)}
                            className="accent-emerald-600 rounded-[2px]"
                        />
                        Total Row
                    </label>
                </Tooltip>
                <Tooltip content="Toggle Banded Rows">
                    <label className="flex items-center gap-2 text-[11px] text-slate-700 cursor-pointer select-none">
                        <input 
                            type="checkbox" 
                            checked={table.bandedRows} 
                            onChange={(e) => onChange('bandedRows', e.target.checked)}
                            className="accent-emerald-600 rounded-[2px]"
                        />
                        Banded Rows
                    </label>
                </Tooltip>

                {/* Column 2 */}
                <Tooltip content="Highlight First Column">
                    <label className="flex items-center gap-2 text-[11px] text-slate-700 cursor-pointer select-none">
                        <input 
                            type="checkbox" 
                            checked={false} 
                            disabled
                            className="accent-emerald-600 rounded-[2px] opacity-50"
                        />
                        First Column
                    </label>
                </Tooltip>
                <Tooltip content="Highlight Last Column">
                    <label className="flex items-center gap-2 text-[11px] text-slate-700 cursor-pointer select-none">
                        <input 
                            type="checkbox" 
                            checked={false} 
                            disabled
                            className="accent-emerald-600 rounded-[2px] opacity-50"
                        />
                        Last Column
                    </label>
                </Tooltip>
                <Tooltip content="Toggle Banded Columns">
                    <label className="flex items-center gap-2 text-[11px] text-slate-700 cursor-pointer select-none">
                        <input 
                            type="checkbox" 
                            checked={false} 
                            disabled
                            className="accent-emerald-600 rounded-[2px] opacity-50"
                        />
                        Banded Columns
                    </label>
                </Tooltip>

                {/* Column 3 */}
                <Tooltip content="Toggle Filter Button">
                    <label className="flex items-center gap-2 text-[11px] text-slate-700 cursor-pointer select-none">
                        <input 
                            type="checkbox" 
                            checked={table.filterButton} 
                            onChange={(e) => onChange('filterButton', e.target.checked)}
                            className="accent-emerald-600 rounded-[2px]"
                        />
                        Filter Button
                    </label>
                </Tooltip>
                {/* Spacer cells for grid alignment */}
                <div />
                <div />
            </div>
        </RibbonGroup>
    );
};

export default TableStyleOptionsGroup;
