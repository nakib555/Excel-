import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { RibbonButton } from '../../../shared';

const DataValidation = () => (
    <RibbonButton variant="small" icon={<ShieldCheck size={14} className="text-green-600" />} label="Data Validation" hasDropdown onClick={() => {}} />
);

export default DataValidation;