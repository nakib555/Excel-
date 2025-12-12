
import React from 'react';
import { RibbonGroup, TabProps } from '../../shared';
import NumberFormatSelector from './NumberFormatSelector';
import Currency from './Currency';
import PercentStyle from './Percent';
import CommaStyle from './CommaStyle';
import IncreaseDecimal from './IncreaseDecimal';
import DecreaseDecimal from './DecreaseDecimal';

const NumberGroup: React.FC<TabProps> = ({ currentStyle, onToggleStyle }) => {
  return (
    <RibbonGroup label="Number">
        <div className="flex flex-col gap-1 justify-center h-full py-0.5">
            <NumberFormatSelector />
            <div className="flex items-center gap-1 justify-between px-1">
                <div className="flex gap-0.5">
                    <Currency currentStyle={currentStyle} onToggleStyle={onToggleStyle} />
                    <PercentStyle currentStyle={currentStyle} onToggleStyle={onToggleStyle} />
                    <CommaStyle currentStyle={currentStyle} onToggleStyle={onToggleStyle} />
                </div>
                <div className="flex gap-0.5">
                    <IncreaseDecimal currentStyle={currentStyle} onToggleStyle={onToggleStyle} />
                    <DecreaseDecimal currentStyle={currentStyle} onToggleStyle={onToggleStyle} />
                </div>
            </div>
        </div>
    </RibbonGroup>
  );
};

export default NumberGroup;