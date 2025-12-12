import React from 'react';
import { BarChart3 } from 'lucide-react';
import { RibbonButton } from '../../shared';

const ColumnChart = () => (
    <RibbonButton variant="icon-only" icon={<BarChart3 size={14} className="text-blue-500" />} hasDropdown onClick={() => {}} title="Column" />
);

export default ColumnChart;
