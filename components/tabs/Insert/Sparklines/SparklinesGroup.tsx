import React from 'react';
import { RibbonGroup, TabProps } from '../../shared';
import Line from './Line';
import Column from './Column';
import WinLoss from './WinLoss';

const SparklinesGroup: React.FC<TabProps> = () => {
  return (
    <RibbonGroup label="Sparklines">
        <div className="flex flex-col gap-0 h-full justify-center">
            <Line />
            <Column />
            <WinLoss />
        </div>
    </RibbonGroup>
  );
};

export default SparklinesGroup;
