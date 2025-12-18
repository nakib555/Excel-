
import React from 'react';
import { Languages } from 'lucide-react';
import { RibbonButton } from '../../shared';

const Translate: React.FC<{ onToggleAI?: () => void }> = ({ onToggleAI }) => (
    <RibbonButton 
        variant="large" 
        icon={<Languages size={20} className="text-cyan-600" />} 
        label="Translate" 
        subLabel="Sheet" 
        onClick={onToggleAI || (() => {})} 
    />
);

export default Translate;
