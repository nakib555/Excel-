import React from 'react';
import { AlignCenter } from 'lucide-react';
import { RibbonButton, TabProps } from '../../shared';

interface CenterProps extends Pick<TabProps, 'currentStyle' | 'onToggleStyle'> {}

const Center: React.FC<CenterProps> = ({ currentStyle, onToggleStyle }) => (
    <RibbonButton variant="icon-only" icon={<AlignCenter size={14} className="text-slate-600" />} active={currentStyle.align === 'center'} onClick={() => onToggleStyle('align', 'center')} title="Center" />
);

export default Center;
