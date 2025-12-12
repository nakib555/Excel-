import React from 'react';
import { Gauge } from 'lucide-react';
import { RibbonButton } from '../../../shared';

const CheckPerformance = () => (
    <RibbonButton variant="large" icon={<Gauge size={20} className="text-emerald-500" />} label="Check" subLabel="Performance" onClick={() => {}} />
);

export default CheckPerformance;