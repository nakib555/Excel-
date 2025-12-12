import React from 'react';
import { Bold as BoldIcon } from 'lucide-react';
import { RibbonButton, TabProps } from '../../shared';

interface BoldProps extends Pick<TabProps, 'currentStyle' | 'onToggleStyle'> {}

const Bold: React.FC<BoldProps> = ({ currentStyle, onToggleStyle }) => (
    <RibbonButton 
        variant="icon-only" 
        icon={<BoldIcon size={14} className="text-slate-800" />} 
        active={currentStyle.bold} 
        onClick={() => onToggleStyle('bold', !currentStyle.bold)} 
        title="Bold" 
    />
);

export default Bold;
