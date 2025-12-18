
import React from 'react';
import { RibbonGroup, TabProps } from '../../shared';
import SmartClean from './SmartClean';
import Translate from './Translate';

const EditGroup: React.FC<TabProps> = ({ onToggleAI }) => (
    <RibbonGroup label="Smart Edit">
        <div className="flex items-center gap-1 h-full">
            <SmartClean onToggleAI={onToggleAI} />
            <Translate onToggleAI={onToggleAI} />
        </div>
    </RibbonGroup>
);

export default EditGroup;
