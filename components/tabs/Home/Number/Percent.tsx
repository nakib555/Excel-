
import React from 'react';
import { Percent as PercentIcon } from 'lucide-react';
import { RibbonButton, TabProps } from '../../shared';

interface PercentProps extends Pick<TabProps, 'currentStyle' | 'onToggleStyle'> {}

const PercentStyle: React.FC<PercentProps> = ({ currentStyle, onToggleStyle }) => (
    <RibbonButton 
        variant="icon-only" 
        icon={<PercentIcon size={14} className="text-slate-600" />} 
        active={currentStyle.format === 'percent'}
        onClick={() => onToggleStyle('format', currentStyle.format === 'percent' ? 'general' : 'percent')} 
        title="Percent Style" 
    />
);

export default PercentStyle;
