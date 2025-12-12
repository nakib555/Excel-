import React from 'react';
import { RibbonGroup, TabProps } from '../../shared';
import NumberFormatSelector from './NumberFormatSelector';
import Currency from './Currency';
import PercentStyle from './Percent';
import CommaStyle from './CommaStyle';
import IncreaseDecimal from './IncreaseDecimal';
import DecreaseDecimal from './DecreaseDecimal';

const NumberGroup: React.FC<TabProps> = () => {
  return (
    <RibbonGroup label="Number">
        <div className="flex flex-col gap-1 justify-center h-full py-0.5">
            <NumberFormatSelector />
            <div className="flex items-center gap-1 justify-between px-1">
                <div className="flex gap-0.5">
                    <Currency />
                    <PercentStyle />
                    <CommaStyle />
                </div>
                <div className="flex gap-0.5">
                    <IncreaseDecimal />
                    <DecreaseDecimal />
                </div>
            </div>
        </div>
    </RibbonGroup>
  );
};

export default NumberGroup;
