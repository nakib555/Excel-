
import React from 'react';
import { Bot } from 'lucide-react';
import { RibbonButton } from '../../shared';

interface LaunchProps {
    onToggleAI?: () => void;
}

const Launch: React.FC<LaunchProps> = ({ onToggleAI }) => (
    <RibbonButton 
        variant="large" 
        icon={<Bot size={24} className="text-indigo-600" />} 
        label="Launch" 
        subLabel="Copilot" 
        onClick={onToggleAI || (() => {})} 
    />
);

export default Launch;
