
import React from 'react';
import { RibbonButton, TabProps } from '../../shared';

interface CommaProps extends Pick<TabProps, 'currentStyle' | 'onToggleStyle'> {}

const CommaStyle: React.FC<CommaProps> = ({ currentStyle, onToggleStyle }) => (
    <RibbonButton 
        variant="icon-only" 
        icon={<span className="font-bold text-[11px] text-slate-600">,</span>} 
        active={currentStyle.format === 'comma'}
        onClick={() => onToggleStyle('format', currentStyle.format === 'comma' ? 'general' : 'comma')} 
        title="Comma Style" 
    />
);

export default CommaStyle;