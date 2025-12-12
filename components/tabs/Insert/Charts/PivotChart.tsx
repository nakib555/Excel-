import React from 'react';
import { BarChart4 } from 'lucide-react';
import { RibbonButton } from '../../shared';

const PivotChart = () => (
    <RibbonButton variant="icon-only" icon={<BarChart4 size={14} className="text-emerald-500" />} hasDropdown onClick={() => {}} title="PivotChart" />
);

export default PivotChart;
