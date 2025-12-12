import React from 'react';
import { PenTool } from 'lucide-react';
import { RibbonButton } from '../../shared';

const GalaxyPen = () => (
    <RibbonButton variant="large" icon={<PenTool size={20} className="text-purple-500" />} label="Galaxy" hasDropdown onClick={() => {}} />
);

export default GalaxyPen;