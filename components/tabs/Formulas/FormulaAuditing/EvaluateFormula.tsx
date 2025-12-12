import React from 'react';
import { Calculator } from 'lucide-react';
import { RibbonButton } from '../../../shared';

const EvaluateFormula = () => (
    <RibbonButton variant="small" icon={<Calculator size={14} className="text-slate-500" />} label="Evaluate Formula" onClick={() => {}} />
);

export default EvaluateFormula;