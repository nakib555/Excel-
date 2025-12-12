import React from 'react';
import { AlignRight as AlignRightIcon } from 'lucide-react';
import { RibbonButton, TabProps } from '../../shared';

interface AlignRightProps extends Pick<TabProps, 'currentStyle' | 'onToggleStyle'> {}

const AlignRight: React.FC<AlignRightProps> = ({ currentStyle, onToggleStyle }) => (
    <RibbonButton variant="icon-only" icon={<AlignRightIcon size={14} className="text-slate-600" />} active={currentStyle.align === 'right'} onClick={() => onToggleStyle('align', 'right')} title="Align Right" />
);

export default AlignRight;
