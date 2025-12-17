

import React from 'react';
import { RibbonGroup, TabProps } from '../../shared';
import TextToColumns from './TextToColumns';
import FlashFill from './FlashFill';
import RemoveDuplicates from './RemoveDuplicates';
import DataValidation from './DataValidation';
import Consolidate from './Consolidate';
import Relationships from './Relationships';

const DataToolsGroup: React.FC<TabProps> = ({ onDataValidation }) => (
    <RibbonGroup label="Data Tools">
        <div className="flex items-center gap-1 h-full">
            <TextToColumns />
            <div className="flex flex-col gap-0 justify-center">
                <FlashFill />
                <RemoveDuplicates />
                <DataValidation onDataValidation={onDataValidation} />
            </div>
            <div className="flex flex-col gap-0 justify-center">
                <Consolidate />
                <Relationships />
            </div>
        </div>
    </RibbonGroup>
);

export default DataToolsGroup;