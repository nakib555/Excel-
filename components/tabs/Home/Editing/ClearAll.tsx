import React from 'react';
import { Eraser } from 'lucide-react';
import { RibbonButton, TabProps } from '../../shared';

interface ClearAllProps extends Pick<TabProps, 'onClear'> {}

const ClearAll: React.FC<ClearAllProps> = ({ onClear }) => (
    <RibbonButton 
        variant="large" 
        icon={<Eraser size={20} className="text-rose-500" />} 
        label="Clear" 
        onClick={onClear} 
        hasDropdown 
        title="Clear All"
    />
);

export default ClearAll;
