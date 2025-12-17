
import React from 'react';
import { WrapText as WrapTextIcon } from 'lucide-react';
import { RibbonButton, TabProps } from '../../shared';

interface WrapTextProps extends Pick<TabProps, 'currentStyle' | 'onToggleStyle'> {}

const WrapText: React.FC<WrapTextProps> = ({ currentStyle, onToggleStyle }) => (
    <RibbonButton
        variant="small"
        icon={<WrapTextIcon size={16} className={currentStyle.wrapText ? "text-primary-600" : "text-blue-500"} />}
        label="Wrap Text"
        active={currentStyle.wrapText}
        onClick={() => onToggleStyle('wrapText', !currentStyle.wrapText)}
        className="w-full justify-start px-2"
    />
);

export default WrapText;
