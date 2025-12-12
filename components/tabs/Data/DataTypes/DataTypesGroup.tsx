import React from 'react';
import { RibbonGroup } from '../../../shared';
import Stocks from './Stocks';
import Currencies from './Currencies';

const DataTypesGroup = () => (
    <RibbonGroup label="Data Types">
        <div className="flex items-center gap-1 h-full">
            <Stocks />
            <Currencies />
        </div>
    </RibbonGroup>
);

export default DataTypesGroup;