import React from 'react';
import { PenTool } from 'lucide-react';
import { RibbonButton } from '../../shared';

const BlackPen = () => (
    <RibbonButton variant="large" icon={<PenTool size={20} color="#000" fill="#000" />} label="Black" hasDropdown onClick={() => {}} />
);

export default BlackPen;