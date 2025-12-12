import React from 'react';
import { Sliders } from 'lucide-react';
import { RibbonButton } from '../../../shared';

const AdvancedFilter = () => (
    <RibbonButton variant="small" icon={<Sliders size={14} className="text-blue-500" />} label="Advanced" onClick={() => {}} />
);

export default AdvancedFilter;