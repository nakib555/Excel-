
import React from 'react';
import { RibbonButton, TabProps } from '../../shared';

interface DecreaseFontSizeProps extends Pick<TabProps, 'currentStyle' | 'onToggleStyle'> {}

const DecreaseFontSize: React.FC<DecreaseFontSizeProps> = ({ currentStyle, onToggleStyle }) => {
    const currentFontSize = currentStyle.fontSize || 13;
    return (
        <RibbonButton 
            variant="icon-only" 
            icon={<span className="font-serif text-[11px] font-medium text-slate-700">A</span>} 
            onClick={() => onToggleStyle('fontSize', Math.max(1, currentFontSize - 1))} 
            title="Decrease Font Size" 
            hasDropdown
        />
    );
};

export default DecreaseFontSize;
