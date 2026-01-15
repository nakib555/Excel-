
import React from 'react';
import { Tooltip } from '../../../shared';

const Gridlines = () => (
    <Tooltip content="Show lines between rows and columns to make editing and reading easier">
        <label className="flex items-center gap-1 text-[10px] text-slate-600"><input type="checkbox" defaultChecked /> Gridlines</label>
    </Tooltip>
);

export default Gridlines;
