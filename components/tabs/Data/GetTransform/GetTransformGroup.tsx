import React from 'react';
import { RibbonGroup } from '../../../shared';
import GetData from './GetData';
import FromTextCSV from './FromTextCSV';
import FromWeb from './FromWeb';
import FromTableRange from './FromTableRange';

const GetTransformGroup = () => (
    <RibbonGroup label="Get & Transform Data">
        <div className="flex items-center gap-1 h-full">
            <GetData />
            <FromTextCSV />
            <FromWeb />
            <FromTableRange />
        </div>
    </RibbonGroup>
);

export default GetTransformGroup;