
import React from 'react';
import { Tooltip } from '../../../shared';

const FormulaBar = () => (
    <Tooltip content="View the Formula Bar to see cell contents">
        <label className="flex items-center gap-1 text-[10px] text-slate-600"><input type="checkbox" defaultChecked /> Formula Bar</label>
    </Tooltip>
);

export default FormulaBar;
