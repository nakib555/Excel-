import React from 'react';
import { LineChart as LineChartIcon } from 'lucide-react';
import { RibbonButton } from '../../shared';

const LineChart = () => (
    <RibbonButton variant="icon-only" icon={<LineChartIcon size={14} className="text-red-500" />} hasDropdown onClick={() => {}} title="Line" />
);

export default LineChart;
