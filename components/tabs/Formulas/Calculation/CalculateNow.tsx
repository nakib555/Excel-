import React from 'react';
import { Calculator } from 'lucide-react';
import { RibbonButton } from '../../../shared';

const CalculateNow = () => (
    <RibbonButton variant="small" icon={<Calculator size={14} className="text-slate-600" />} label="Calculate Now" onClick={() => {}} title="Calculate Now (F9)" />
);

export default CalculateNow;