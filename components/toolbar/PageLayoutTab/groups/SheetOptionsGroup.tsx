import React from 'react';
import { RibbonGroup, TabProps } from '../../shared';

const SheetOptionsGroup: React.FC<TabProps> = () => {
  return (
    <RibbonGroup label="Sheet Options">
        <div className="flex gap-4 px-2 h-full items-center">
            <div className="flex flex-col gap-0.5">
                <span className="text-[11px] font-semibold text-slate-700">Gridlines</span>
                <label className="flex items-center gap-1 text-[10px] text-slate-600"><input type="checkbox" checked readOnly /> View</label>
                <label className="flex items-center gap-1 text-[10px] text-slate-600"><input type="checkbox" /> Print</label>
            </div>
            <div className="flex flex-col gap-0.5">
                <span className="text-[11px] font-semibold text-slate-700">Headings</span>
                <label className="flex items-center gap-1 text-[10px] text-slate-600"><input type="checkbox" checked readOnly /> View</label>
                <label className="flex items-center gap-1 text-[10px] text-slate-600"><input type="checkbox" /> Print</label>
            </div>
        </div>
    </RibbonGroup>
  );
};

export default SheetOptionsGroup;