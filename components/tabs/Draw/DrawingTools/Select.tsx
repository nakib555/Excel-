import React from 'react';
import { MousePointer2 } from 'lucide-react';
import { RibbonButton } from '../../shared';

const Select = () => (
    <RibbonButton variant="large" icon={<MousePointer2 size={20} className="text-slate-700" />} label="Select" onClick={() => {}} />
);

export default Select;