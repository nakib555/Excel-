import React from 'react';
import { RotateCw } from 'lucide-react';
import { RibbonButton } from '../../shared';

const Rotate = () => (
    <RibbonButton variant="small" icon={<RotateCw size={14} className="text-slate-600" />} label="Rotate" hasDropdown onClick={() => {}} />
);

export default Rotate;