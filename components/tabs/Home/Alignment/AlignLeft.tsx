import React from 'react';
import { AlignLeft as AlignLeftIcon } from 'lucide-react';
import { RibbonButton, TabProps } from '../../shared';

interface AlignLeftProps extends Pick<TabProps, 'currentStyle' | 'onToggleStyle'> {}

const AlignLeft: React.FC<AlignLeftProps> = ({ currentStyle, onToggleStyle }) => (
    <RibbonButton variant="icon-only" icon={<AlignLeftIcon size={14} className="text-slate-600" />} active={currentStyle.align === 'left'} onClick={() => onToggleStyle('align', 'left')} title="Align Left" />
);

export default AlignLeft;
