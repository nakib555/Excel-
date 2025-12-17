
import React from 'react';
import { AlignVerticalJustifyEnd } from 'lucide-react';
import { RibbonButton, TabProps } from '../../shared';

interface BottomAlignProps extends Pick<TabProps, 'currentStyle' | 'onToggleStyle'> {}

const BottomAlign: React.FC<BottomAlignProps> = ({ currentStyle, onToggleStyle }) => (
    <RibbonButton 
        variant="icon-only" 
        icon={<AlignVerticalJustifyEnd size={14} className="rotate-180 text-slate-600" />} 
        active={!currentStyle.verticalAlign || currentStyle.verticalAlign === 'bottom'}
        onClick={() => onToggleStyle('verticalAlign', 'bottom')} 
        title="Bottom Align" 
    />
);

export default BottomAlign;