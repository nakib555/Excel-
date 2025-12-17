
import React from 'react';
import { AlignVerticalJustifyStart } from 'lucide-react';
import { RibbonButton, TabProps } from '../../shared';

interface TopAlignProps extends Pick<TabProps, 'currentStyle' | 'onToggleStyle'> {}

const TopAlign: React.FC<TopAlignProps> = ({ currentStyle, onToggleStyle }) => (
    <RibbonButton 
        variant="icon-only" 
        icon={<AlignVerticalJustifyStart size={14} className="rotate-180 text-slate-600" />} 
        active={currentStyle.verticalAlign === 'top'}
        onClick={() => onToggleStyle('verticalAlign', 'top')} 
        title="Top Align" 
    />
);

export default TopAlign;