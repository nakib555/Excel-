import React from 'react';
import { BarChart } from 'lucide-react';
import { RibbonButton } from '../../shared';

const RecommendedCharts = () => (
    <RibbonButton variant="large" icon={<BarChart size={20} className="text-blue-600" />} label="Recommended" subLabel="Charts" onClick={() => {}} />
);

export default RecommendedCharts;
