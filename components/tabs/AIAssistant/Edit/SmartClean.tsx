
import React from 'react';
import { Wand2 } from 'lucide-react';
import { RibbonButton } from '../../shared';

const SmartClean: React.FC<{ onToggleAI?: () => void }> = ({ onToggleAI }) => (
    <RibbonButton 
        variant="large" 
        icon={<Wand2 size={20} className="text-pink-500" />} 
        label="Smart" 
        subLabel="Clean" 
        onClick={onToggleAI || (() => {})} 
    />
);

export default SmartClean;
