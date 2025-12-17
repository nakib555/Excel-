
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
    <RibbonGroup label="Alignment">
        <div className="flex h-full py-0.5 gap-2 px-1">
            {/* 1. Alignment Grid */}
            <div className="flex flex-col justify-center h-full gap-1">
                <div className="flex gap-0.5">
                    <TopAlign />
                    <MiddleAlign />
                    <BottomAlign />
                </div>
                <div className="flex gap-0.5">
                    <AlignLeft currentStyle={currentStyle} onToggleStyle={onToggleStyle} />
                    <Center currentStyle={currentStyle} onToggleStyle={onToggleStyle} />
                    <AlignRight currentStyle={currentStyle} onToggleStyle={onToggleStyle} />
                </div>
            </div>

            {/* Separator */}
            <div className="h-4/5 w-[1px] bg-slate-200 my-auto mx-0.5" />

            {/* 2. Indentation & Orientation */}
             <div className="flex flex-col justify-center h-full gap-1">
                <div className="flex gap-0.5 pl-0.5">
                     <Orientation />
                </div>
                <div className="flex gap-0.5">
                    <DecreaseIndent />
                    <IncreaseIndent />
                </div>
            </div>

            {/* 3. Text Control */}
            <div className="flex flex-col justify-center h-full gap-1 w-[120px]">
                <WrapText currentStyle={currentStyle} onToggleStyle={onToggleStyle} />
                <MergeCenter />
            </div>
        </div>
    </RibbonGroup>
  );
});

export default AlignmentGroup;
