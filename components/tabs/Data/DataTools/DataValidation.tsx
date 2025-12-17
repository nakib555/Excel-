

import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { RibbonButton } from '../../../shared';

interface DataValidationProps {
    onDataValidation?: () => void;
}

const DataValidation: React.FC<DataValidationProps> = ({ onDataValidation }) => (
    <RibbonButton 
        variant="small" 
        icon={<ShieldCheck size={14} className="text-green-600" />} 
        label="Data Validation" 
        hasDropdown 
        onClick={onDataValidation || (() => {})} 
    />
);

export default DataValidation;