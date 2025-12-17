
import React, { memo } from 'react';
import { RibbonGroup, Separator, TabProps } from '../../shared';
import FontSelector from './FontSelector';
import FontSizeSelector from './FontSizeSelector';
import IncreaseFontSize from './IncreaseFontSize';
import DecreaseFontSize from './DecreaseFontSize';
import Bold from './Bold';
import Italic from './Italic';
import Underline from './Underline';
import Borders from './Borders';
import FillColor from './FillColor';
import FontColor from './FontColor';

const FontGroup: React.FC<TabProps> = memo(({ currentStyle, onToggleStyle }) => {
  return (
    <RibbonGroup label="Font" className="px-3">
        <div className="flex flex-col gap-1 justify-center h-full py-0.5">
            <div className="flex items-center gap-1.5">
                <FontSelector />
                <FontSizeSelector currentStyle={currentStyle} onToggleStyle={onToggleStyle} />
                <div className="flex items-center gap-0.5">
                    <IncreaseFontSize currentStyle={currentStyle} onToggleStyle={onToggleStyle} />
                    <DecreaseFontSize currentStyle={currentStyle} onToggleStyle={onToggleStyle} />
                </div>
            </div>
            
            <div className="flex items-center gap-0.5">
                <Bold currentStyle={currentStyle} onToggleStyle={onToggleStyle} />
                <Italic currentStyle={currentStyle} onToggleStyle={onToggleStyle} />
                <Underline currentStyle={currentStyle} onToggleStyle={onToggleStyle} />
                <Separator />
                <Borders />
                <FillColor currentStyle={currentStyle} onToggleStyle={onToggleStyle} />
                <FontColor currentStyle={currentStyle} onToggleStyle={onToggleStyle} />
            </div>
        </div>
    </RibbonGroup>
  );
});

export default FontGroup;
