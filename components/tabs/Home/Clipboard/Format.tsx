
import React from 'react';
import { Paintbrush } from 'lucide-react';
import { RibbonButton } from '../../shared';

interface FormatProps {
  onFormatPainter?: () => void;
  isFormatPainterActive?: boolean;
}

const Format: React.FC<FormatProps> = ({ onFormatPainter, isFormatPainterActive }) => (
  <RibbonButton 
    variant="small" 
    icon={<Paintbrush size={14} className={isFormatPainterActive ? "text-blue-600 animate-pulse" : "text-orange-500"} />} 
    label="Format" 
    active={isFormatPainterActive}
    onClick={onFormatPainter || (() => {})} 
    title="Format Painter (Copy formatting from one place and apply to another)" 
  />
);

export default Format;
