
import React from 'react';
import { MoveRight } from 'lucide-react';
import { RibbonButton, TabProps } from '../../shared';

interface IncreaseIndentProps extends Pick<TabProps, 'currentStyle' | 'onToggleStyle'> {}

const IncreaseIndent: React.FC<IncreaseIndentProps> = ({ currentStyle, onToggleStyle }) => {
    const currentIndent = currentStyle.indent || 0;
    return (
        <RibbonButton 
            variant="icon-only" 
            icon={<div className="flex -space-x-1 items-center text-slate-500"><div className="w-[1px] h-2.5 bg-slate-400"></div><MoveRight size={10} /></div>} 
            onClick={() => onToggleStyle('indent', currentIndent + 1)} 
            title="Increase Indent" 
        />
    );
};

export default IncreaseIndent;