import React from 'react';
import { ScatterChart as ScatterChartIcon } from 'lucide-react';
import { RibbonButton } from '../../shared';

const ScatterChart = () => (
    <RibbonButton variant="icon-only" icon={<ScatterChartIcon size={14} className="text-indigo-500" />} hasDropdown onClick={() => {}} title="Scatter" />
);

export default ScatterChart;
