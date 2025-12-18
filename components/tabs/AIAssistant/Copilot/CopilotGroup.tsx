
import React from 'react';
import { RibbonGroup, TabProps } from '../../shared';
import Launch from './Launch';

const CopilotGroup: React.FC<TabProps> = ({ onToggleAI }) => (
    <RibbonGroup label="Copilot">
        <Launch onToggleAI={onToggleAI} />
    </RibbonGroup>
);

export default CopilotGroup;
