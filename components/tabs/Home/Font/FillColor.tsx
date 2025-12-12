import React from 'react';
import { PaintBucket } from 'lucide-react';
import { ColorPicker, TabProps } from '../../shared';

interface FillColorProps extends Pick<TabProps, 'currentStyle' | 'onToggleStyle'> {}

const FillColor: React.FC<FillColorProps> = ({ currentStyle, onToggleStyle }) => (
    <ColorPicker 
        icon={<PaintBucket size={14} className="text-amber-400" />} 
        color={currentStyle.bg || 'transparent'} 
        onChange={(c) => onToggleStyle('bg', c)} 
        colors={['transparent', '#fee2e2', '#d1fae5', '#dbeafe', '#fef3c7', '#f3f4f6', '#10b981', '#ef4444']}
        title="Fill Color"
    />
);

export default FillColor;
