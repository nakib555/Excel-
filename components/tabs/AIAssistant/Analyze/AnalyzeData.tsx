
import React from 'react';
import { BarChart2 } from 'lucide-react';
import { RibbonButton } from '../../shared';

const AnalyzeData: React.FC<{ onToggleAI?: () => void }> = ({ onToggleAI }) => (
    <RibbonButton 
        variant="large" 
        icon={<BarChart2 size={20} className="text-blue-600" />} 
        label="Analyze" 
        subLabel="Data" 
        onClick={onToggleAI || (() => {})} 
    />
);

export default AnalyzeData;
