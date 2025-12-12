import React from 'react';
import { RibbonGroup, Separator, TabProps } from '../../shared';
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

const AlignmentGroup: React.FC<TabProps> = ({ currentStyle, onToggleStyle }) => {
  return (
    <RibbonGroup label="Alignment">
        <div className="flex gap-2 h-full py-0.5">
                <div className="flex flex-col justify-between h-full py-0.5 gap-0.5">
                    <div className="flex gap-0.5">
                        <TopAlign />
                        <MiddleAlign />
                        <BottomAlign />
                        <Separator />
                        <Orientation />
                    </div>
                    <div className="flex gap-0.5">
                        <AlignLeft currentStyle={currentStyle} onToggleStyle={onToggleStyle} />
                        <Center currentStyle={currentStyle} onToggleStyle={onToggleStyle} />
                        <AlignRight currentStyle={currentStyle} onToggleStyle={onToggleStyle} />
                        <Separator />
                        <DecreaseIndent />
                        <IncreaseIndent />
                    </div>
                </div>
                <div className="flex flex-col gap-0.5 justify-center min-w-[100px]">
                    <WrapText currentStyle={currentStyle} onToggleStyle={onToggleStyle} />
                    <MergeCenter />
                </div>
        </div>
    </RibbonGroup>
  );
};

export default AlignmentGroup;