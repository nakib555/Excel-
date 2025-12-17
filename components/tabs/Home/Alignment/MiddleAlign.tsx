
import React from 'react';
import { AlignVerticalJustifyCenter } from 'lucide-react';
import { RibbonButton, TabProps } from '../../shared';

interface MiddleAlignProps extends Pick<TabProps, 'currentStyle' | 'onToggleStyle'> {}

const MiddleAlign: React.FC<MiddleAlignProps> = ({ currentStyle, onToggleStyle }) => (
    <RibbonButton 
        variant="icon-only" 
        icon={<AlignVerticalJustifyCenter size={14} className="text-slate-600" />} 
        active={currentStyle.verticalAlign === 'middle'}
        onClick={() => onToggleStyle('verticalAlign', 'middle')} 
        title="Middle Align" 
    />
);

export default MiddleAlign;