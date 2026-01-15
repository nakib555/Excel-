
import React from 'react';
import { Tooltip } from '../../../shared';

const GridlinesView = () => (
    <Tooltip content="Show gridlines">
        <label className="flex items-center gap-1 text-[10px] text-slate-600"><input type="checkbox" defaultChecked /> View</label>
    </Tooltip>
);

export default GridlinesView;
