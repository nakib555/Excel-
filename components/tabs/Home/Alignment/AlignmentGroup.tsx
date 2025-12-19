
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
import ShrinkToFit from './ShrinkToFit';

const AlignmentGroup: React.FC<TabProps> = memo(({ currentStyle, onToggleStyle, onMergeCenter, onOpenFormatDialog }) => {
  return (
    <RibbonGroup label="Alignment" showLauncher onLaunch={() => onOpenFormatDialog?.('Alignment')}>
        <div className="flex h-full py-0.5 gap-2 px-1">
            {/* 1. Alignment Icons (3x2 Grid) */}
            <div className="flex flex-col justify-center h-full gap-1">
                <div className="flex gap-0.5">
                    <TopAlign currentStyle={currentStyle} onToggleStyle={onToggleStyle} />
                    <MiddleAlign currentStyle={currentStyle} onToggleStyle={onToggleStyle} />
                    <BottomAlign currentStyle={currentStyle} onToggleStyle={onToggleStyle} />
                </div>
                <div className="flex gap-0.5">
                    <AlignLeft currentStyle={currentStyle} onToggleStyle={onToggleStyle} />
                    <Center currentStyle={currentStyle} onToggleStyle={onToggleStyle} />
                    <AlignRight currentStyle={currentStyle} onToggleStyle={onToggleStyle} />
                </div>
            </div>

            {/* Separator */}
            <div className="h-4/5 w-[1px] bg-slate-200 my-auto mx-1" />

            {/* 2. Controls (Right Side) */}
            <div className="flex flex-col justify-center h-full gap-1">
                {/* Row 1 */}
                <div className="flex gap-1">
                     <Orientation currentStyle={currentStyle} onToggleStyle={onToggleStyle} />
                     <WrapText currentStyle={currentStyle} onToggleStyle={onToggleStyle} />
                     <ShrinkToFit currentStyle={currentStyle} onToggleStyle={onToggleStyle} />
                </div>
                {/* Row 2 */}
                <div className="flex gap-1">
                    <DecreaseIndent currentStyle={currentStyle} onToggleStyle={onToggleStyle} />
                    <IncreaseIndent currentStyle={currentStyle} onToggleStyle={onToggleStyle} />
                    <MergeCenter onMergeCenter={onMergeCenter} />
                </div>
            </div>
        </div>
    </RibbonGroup>
  );
});

export default AlignmentGroup;
