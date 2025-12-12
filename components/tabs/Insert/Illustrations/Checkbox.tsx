import React from 'react';
import { CheckSquare } from 'lucide-react';
import { RibbonButton } from '../../shared';

const Checkbox = () => (
    <RibbonButton variant="large" icon={<CheckSquare size={20} className="text-slate-600" />} label="Checkbox" onClick={() => {}} />
);

export default Checkbox;
