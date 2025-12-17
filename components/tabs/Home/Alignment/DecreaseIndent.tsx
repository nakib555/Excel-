
import React from 'react';
import { MoveLeft } from 'lucide-react';
import { RibbonButton, TabProps } from '../../shared';

interface DecreaseIndentProps extends Pick<TabProps, 'currentStyle' | 'onToggleStyle'> {}

const DecreaseIndent: React.FC<DecreaseIndentProps> = ({ currentStyle, onToggleStyle }) => {
    const currentIndent = currentStyle.indent || 0;
    return (
        <RibbonButton 
            variant="icon-only" 
            icon={<div className="flex -space-x-1 items-center text-slate-500"><MoveLeft size={10} /><div className="w-[1px] h-2.5 bg-slate-400"></div></div>} 
            onClick={() => onToggleStyle('indent', Math.max(0, currentIndent - 1))} 
            title="Decrease Indent" 
        />
    );
};

export default DecreaseIndent;