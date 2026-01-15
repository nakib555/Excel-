
import React from 'react';
import { Tooltip } from '../../../shared';

const Ruler = () => (
    <Tooltip content="Show rulers next to the sheet">
        <label className="flex items-center gap-1 text-[10px] text-slate-600"><input type="checkbox" disabled /> Ruler</label>
    </Tooltip>
);

export default Ruler;
