
import React from 'react';
import { FunctionSquare } from 'lucide-react';
import { RibbonButton } from '../../shared';

const FormulaGen: React.FC<{ onToggleAI?: () => void }> = ({ onToggleAI }) => (
    <RibbonButton 
        variant="large" 
        icon={<FunctionSquare size={20} className="text-emerald-600" />} 
        label="Draft" 
        subLabel="Formula" 
        onClick={onToggleAI || (() => {})} 
    />
);

export default FormulaGen;
