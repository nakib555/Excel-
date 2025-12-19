
import React, { memo } from 'react';
import { RibbonGroup, TabProps } from '../../shared';
import NumberFormatSelector from './NumberFormatSelector';
import Currency from './Currency';
import PercentStyle from './Percent';
import CommaStyle from './CommaStyle';
import IncreaseDecimal from './IncreaseDecimal';
import DecreaseDecimal from './DecreaseDecimal';

const NumberGroup: React.FC<TabProps> = memo(({ currentStyle, onToggleStyle, onOpenFormatDialog }) => {
  return (
    <RibbonGroup label="Number" showLauncher onLaunch={onOpenFormatDialog}>
        <div className="flex flex-col gap-1.5 justify-center h-full py-1 px-1">
            <div className="flex justify-center w-full">
                <NumberFormatSelector currentStyle={currentStyle} onToggleStyle={onToggleStyle} onOpenFormatDialog={onOpenFormatDialog} />
            </div>
            <div className="flex items-center justify-between w-full px-1 gap-3">
                <div className="flex items-center gap-0.5">
                    <Currency currentStyle={currentStyle} onToggleStyle={onToggleStyle} onOpenFormatDialog={onOpenFormatDialog} />
                    <PercentStyle currentStyle={currentStyle} onToggleStyle={onToggleStyle} />
                    <CommaStyle currentStyle={currentStyle} onToggleStyle={onToggleStyle} />
                </div>
                <div className="flex items-center gap-0.5">
                    <IncreaseDecimal currentStyle={currentStyle} onToggleStyle={onToggleStyle} />
                    <DecreaseDecimal currentStyle={currentStyle} onToggleStyle={onToggleStyle} />
                </div>
            </div>
        </div>
    </RibbonGroup>
  );
});

export default NumberGroup;
