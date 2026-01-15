import React from 'react';
import { Italic as ItalicIcon } from 'lucide-react';
import { RibbonButton, TabProps } from '../../shared';

interface ItalicProps extends Pick<TabProps, 'currentStyle' | 'onToggleStyle'> {}

const Italic: React.FC<ItalicProps> = ({ currentStyle, onToggleStyle }) => (
    <RibbonButton 
        variant="icon-only" 
        icon={<ItalicIcon size={14} className="text-slate-800" />} 
        active={currentStyle.italic} 
        onClick={() => onToggleStyle('italic', !currentStyle.italic)} 
        title="Italic (Ctrl+I)" 
    />
);

export default Italic;