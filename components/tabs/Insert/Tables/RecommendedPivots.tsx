import React from 'react';
import { TableProperties } from 'lucide-react';
import { RibbonButton } from '../../shared';

const RecommendedPivots = () => (
    <RibbonButton variant="large" icon={<TableProperties size={20} className="text-blue-600" />} label="Recommended" subLabel="Pivots" onClick={() => {}} />
);

export default RecommendedPivots;
