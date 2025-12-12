import React from 'react';
import { AlignLeft } from 'lucide-react';
import { RibbonButton } from '../../shared';

const Align = () => (
    <RibbonButton variant="small" icon={<AlignLeft size={14} className="text-slate-600" />} label="Align" hasDropdown onClick={() => {}} />
);

export default Align;