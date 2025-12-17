
import React, { memo } from 'react';
import { RibbonGroup, TabProps } from '../../shared';
import TopAlign from './TopAlign';
import MiddleAlign from './MiddleAlign';
import BottomAlign from './BottomAlign';
import Orientation from './Orientation';
import AlignLeft from './AlignLeft';
import Center from './Center';
import AlignRight from './AlignRight';
import DecreaseIndent from './DecreaseIndent';
import IncreaseIndent from './IncreaseIndent';
import WrapText from './WrapText';
import MergeCenter from './MergeCenter';

const AlignmentGroup: React.FC<TabProps> = memo(({ currentStyle, onToggleStyle }) => {
  return (
    <RibbonGroup label="Alignment" className="px-1">
        <div className="flex gap-1 h-full py-0.5">
            {/* Left Block: Alignment Icons */}
            <div className="flex flex-col justify-between h-full gap-0.5 pr-2 border-r border-slate-200/50">
                {/* Row 1: Vertical Align + Orientation */}
                <div className="flex gap-0.5 items-center">
                    <TopAlign />
                    <MiddleAlign />
                    <BottomAlign />
                    <div className="w-1.5" /> 
                    <Orientation />
                </div>
                {/* Row 2: Horizontal Align + Indent */}
                <div className="flex gap-0.5 items-center">
                    <AlignLeft currentStyle={currentStyle} onToggleStyle={onToggleStyle} />
                    <Center currentStyle={currentStyle} onToggleStyle={onToggleStyle} />
                    <AlignRight currentStyle={currentStyle} onToggleStyle={onToggleStyle} />
                    <div className="w-1.5" />
                    <DecreaseIndent />
                    <IncreaseIndent />
                </div>
            </div>

            {/* Right Block: Wrap & Merge */}
            <div className="flex flex-col gap-0.5 justify-center min-w-[120px]">
                <WrapText currentStyle={currentStyle} onToggleStyle={onToggleStyle} />
                <MergeCenter />
            </div>
        </div>
    </RibbonGroup>
  );
});

export default AlignmentGroup;
