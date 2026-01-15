
import React from 'react';
import { Tooltip } from '../../../shared';

const HeadingsView = () => (
    <Tooltip content="Show row and column headings">
        <label className="flex items-center gap-1 text-[10px] text-slate-600"><input type="checkbox" defaultChecked /> View</label>
    </Tooltip>
);

export default HeadingsView;
