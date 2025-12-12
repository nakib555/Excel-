import React from 'react';
import { Filter } from 'lucide-react';
import { RibbonButton } from '../../shared';

const Slicer = () => (
    <RibbonButton variant="small" icon={<Filter size={14} className="text-blue-600" />} label="Slicer" onClick={() => {}} />
);

export default Slicer;
