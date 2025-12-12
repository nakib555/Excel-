import React from 'react';
import { RibbonGroup } from '../../../shared';
import CalculationOptions from './CalculationOptions';
import CalculateNow from './CalculateNow';
import CalculateSheet from './CalculateSheet';

const CalculationGroup = () => (
    <RibbonGroup label="Calculation">
        <div className="flex items-center gap-1 h-full">
            <CalculationOptions />
            <div className="flex flex-col gap-0 justify-center">
                <CalculateNow />
                <CalculateSheet />
            </div>
        </div>
    </RibbonGroup>
);

export default CalculationGroup;