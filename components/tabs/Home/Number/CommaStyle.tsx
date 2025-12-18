import React from 'react';
import { RibbonButton, TabProps } from '../../shared';

interface CommaProps extends Pick<TabProps, 'currentStyle' | 'onToggleStyle'> {}

const CommaStyle: React.FC<CommaProps> = ({ currentStyle, onToggleStyle }) => (
    <RibbonButton 
        variant="icon-only" 
        icon={<span className="font-bold text-[14px] text-slate-600 leading-none pb-1">,</span>} 
        active={currentStyle.format === 'comma'}
        onClick={() => {
            const isComma = currentStyle.format === 'comma';
            onToggleStyle('format', isComma ? 'general' : 'comma');
            if (!isComma) onToggleStyle('decimalPlaces', 2);
        }} 
        title="Comma Style" 
    />
);

export default CommaStyle;