
import React from 'react';
import { Tooltip } from '../../../shared';

const GridlinesPrint = () => (
    <Tooltip content="Print gridlines">
        <label className="flex items-center gap-1 text-[10px] text-slate-600"><input type="checkbox" /> Print</label>
    </Tooltip>
);

export default GridlinesPrint;
