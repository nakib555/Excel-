
import React from 'react';
import { RibbonButton, TabProps } from '../../shared';

interface IncreaseFontSizeProps extends Pick<TabProps, 'currentStyle' | 'onToggleStyle'> {}

const IncreaseFontSize: React.FC<IncreaseFontSizeProps> = ({ currentStyle, onToggleStyle }) => {
    const currentFontSize = currentStyle.fontSize || 13;
    return (
        <RibbonButton 
            variant="icon-only" 
            icon={<span className="font-serif text-[13px] font-medium text-slate-700">A</span>} 
            onClick={() => onToggleStyle('fontSize', currentFontSize + 1)} 
            title="Increase Font Size" 
            hasDropdown
        />
    );
};

export default IncreaseFontSize;
