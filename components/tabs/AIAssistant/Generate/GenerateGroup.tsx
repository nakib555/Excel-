
import React from 'react';
import { RibbonGroup, TabProps } from '../../shared';
import FormulaGen from './FormulaGen';
import TableGen from './TableGen';

const GenerateGroup: React.FC<TabProps> = ({ onToggleAI }) => (
    <RibbonGroup label="Generate">
        <div className="flex items-center gap-1 h-full">
            <FormulaGen onToggleAI={onToggleAI} />
            <TableGen onToggleAI={onToggleAI} />
        </div>
    </RibbonGroup>
);

export default GenerateGroup;
