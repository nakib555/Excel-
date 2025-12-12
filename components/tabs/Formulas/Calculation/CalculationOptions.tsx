import React from 'react';
import { Calculator } from 'lucide-react';
import { RibbonButton } from '../../../shared';

const CalculationOptions = () => (
    <RibbonButton variant="large" icon={<Calculator size={20} className="text-slate-600" />} label="Calculation" subLabel="Options" hasDropdown onClick={() => {}} />
);

export default CalculationOptions;