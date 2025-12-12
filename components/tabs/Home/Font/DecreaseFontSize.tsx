import React from 'react';
import { RibbonButton, TabProps } from '../../shared';

interface DecreaseFontSizeProps extends Pick<TabProps, 'currentStyle' | 'onToggleStyle'> {}

const DecreaseFontSize: React.FC<DecreaseFontSizeProps> = ({ currentStyle, onToggleStyle }) => {
    const currentFontSize = currentStyle.fontSize || 13;
    return (
        <RibbonButton 
            variant="icon-only" 
            icon={<span className="font-serif text-xs relative top-[1px] text-slate-700">A<span className="align-super text-[8px] absolute top-0 -right-1 text-slate-500">▼</span></span>} 
            onClick={() => onToggleStyle('fontSize', Math.max(1, currentFontSize - 1))} 
            title="Decrease Font Size" 
            className="w-6 h-6" 
        />
    );
};

export default DecreaseFontSize;
