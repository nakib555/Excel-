import React from 'react';
import { RibbonButton, TabProps } from '../../shared';

interface IncreaseFontSizeProps extends Pick<TabProps, 'currentStyle' | 'onToggleStyle'> {}

const IncreaseFontSize: React.FC<IncreaseFontSizeProps> = ({ currentStyle, onToggleStyle }) => {
    const currentFontSize = currentStyle.fontSize || 13;
    return (
        <RibbonButton 
            variant="icon-only" 
            icon={<span className="font-serif text-sm relative top-[1px] text-slate-700">A<span className="align-super text-[8px] absolute top-0 -right-1 text-slate-500">▲</span></span>} 
            onClick={() => onToggleStyle('fontSize', currentFontSize + 1)} 
            title="Increase Font Size" 
            className="w-6 h-6" 
        />
    );
};

export default IncreaseFontSize;
