import React from 'react';
import { RibbonGroup } from '../../../shared';
import InsertFunction from './InsertFunction';
import AutoSum from './AutoSum';
import RecentlyUsed from './RecentlyUsed';
import Financial from './Financial';
import Logical from './Logical';
import Text from './Text';
import DateTime from './DateTime';
import LookupRef from './LookupRef';
import MathTrig from './MathTrig';

const FunctionLibraryGroup = () => (
    <RibbonGroup label="Function Library">
        <div className="flex items-center gap-1 h-full">
            <InsertFunction />
            <AutoSum />
            <div className="flex gap-0.5 h-full items-center">
                <RecentlyUsed />
                <Financial />
                <Logical />
                <Text />
                <DateTime />
                <LookupRef />
                <MathTrig />
            </div>
        </div>
    </RibbonGroup>
);

export default FunctionLibraryGroup;