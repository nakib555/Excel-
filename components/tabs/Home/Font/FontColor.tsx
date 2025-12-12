import React from 'react';
import { Type } from 'lucide-react';
import { ColorPicker, TabProps } from '../../shared';

interface FontColorProps extends Pick<TabProps, 'currentStyle' | 'onToggleStyle'> {}

const FontColor: React.FC<FontColorProps> = ({ currentStyle, onToggleStyle }) => (
    <ColorPicker 
        icon={<Type size={14} className="text-red-600" />} 
        color={currentStyle.color || '#000'} 
        onChange={(c) => onToggleStyle('color', c)} 
        colors={['#0f172a', '#dc2626', '#10b981', '#2563eb', '#d97706', '#9333ea', '#ffffff']}
        title="Font Color"
    />
);

export default FontColor;
