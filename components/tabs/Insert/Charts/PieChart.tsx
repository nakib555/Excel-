import React from 'react';
import { PieChart as PieChartIcon } from 'lucide-react';
import { RibbonButton } from '../../shared';

const PieChart = () => (
    <RibbonButton variant="icon-only" icon={<PieChartIcon size={14} className="text-orange-500" />} hasDropdown onClick={() => {}} title="Pie" />
);

export default PieChart;
