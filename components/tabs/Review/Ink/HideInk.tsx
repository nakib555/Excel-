import React from 'react';
import { PenTool } from 'lucide-react';
import { RibbonButton } from '../../../shared';

const HideInk = () => (
    <RibbonButton variant="large" icon={<PenTool size={20} className="text-purple-600" />} label="Hide" subLabel="Ink" hasDropdown onClick={() => {}} />
);

export default HideInk;