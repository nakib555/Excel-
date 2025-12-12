import React from 'react';
import { Underline as UnderlineIcon } from 'lucide-react';
import { RibbonButton, TabProps } from '../../shared';

interface UnderlineProps extends Pick<TabProps, 'currentStyle' | 'onToggleStyle'> {}

const Underline: React.FC<UnderlineProps> = ({ currentStyle, onToggleStyle }) => (
    <RibbonButton 
        variant="icon-only" 
        icon={<UnderlineIcon size={14} className="text-slate-800" />} 
        active={currentStyle.underline} 
        onClick={() => onToggleStyle('underline', !currentStyle.underline)} 
        title="Underline" 
    />
);

export default Underline;
