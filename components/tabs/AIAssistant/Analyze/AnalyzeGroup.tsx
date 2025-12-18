
import React from 'react';
import { RibbonGroup, TabProps } from '../../shared';
import AnalyzeData from './AnalyzeData';
import QuickInsights from './QuickInsights';

const AnalyzeGroup: React.FC<TabProps> = ({ onToggleAI }) => (
    <RibbonGroup label="Analyze">
        <div className="flex items-center gap-1 h-full">
            <AnalyzeData onToggleAI={onToggleAI} />
            <QuickInsights onToggleAI={onToggleAI} />
        </div>
    </RibbonGroup>
);

export default AnalyzeGroup;
