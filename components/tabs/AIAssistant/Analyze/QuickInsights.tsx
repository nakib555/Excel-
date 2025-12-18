
import React from 'react';
import { Lightbulb } from 'lucide-react';
import { RibbonButton } from '../../shared';

const QuickInsights: React.FC<{ onToggleAI?: () => void }> = ({ onToggleAI }) => (
    <RibbonButton 
        variant="large" 
        icon={<Lightbulb size={20} className="text-amber-500" />} 
        label="Quick" 
        subLabel="Insights" 
        onClick={onToggleAI || (() => {})} 
    />
);

export default QuickInsights;
