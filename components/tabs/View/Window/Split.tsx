import React from 'react';
import { Split as SplitIcon } from 'lucide-react';
import { RibbonButton } from '../../../shared';

const Split = () => (
    <RibbonButton variant="small" icon={<SplitIcon size={14} className="text-slate-600" />} label="Split" onClick={() => {}} />
);

export default Split;