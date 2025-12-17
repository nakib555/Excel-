
import React from 'react';
import { WrapText as WrapTextIcon } from 'lucide-react';
import { RibbonButton, TabProps } from '../../shared';

interface WrapTextProps extends Pick<TabProps, 'currentStyle' | 'onToggleStyle'> {}

const WrapText: React.FC<WrapTextProps> = ({ currentStyle, onToggleStyle }) => (
    <RibbonButton
        variant="small"
        icon={<WrapTextIcon size={16} className={currentStyle.wrapText ? "text-emerald-600" : "text-slate-600"} />}
        label="Wrap Text"
        active={currentStyle.wrapText}
        onClick={() => onToggleStyle('wrapText', !currentStyle.wrapText)}
        title="Wrap Text"
    />
);

export default WrapText;
