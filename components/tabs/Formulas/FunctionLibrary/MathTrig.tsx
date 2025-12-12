import React from 'react';
import { Triangle } from 'lucide-react';
import { RibbonButton } from '../../../shared';

const MathTrig = () => (
    <RibbonButton variant="large" icon={<Triangle size={18} className="text-indigo-500" />} label="Math &" subLabel="Trig" hasDropdown onClick={() => {}} />
);

export default MathTrig;