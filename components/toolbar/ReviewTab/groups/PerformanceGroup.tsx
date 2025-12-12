import React from 'react';
import { Gauge } from 'lucide-react';
import { RibbonGroup, RibbonButton, TabProps } from '../../shared';

const PerformanceGroup: React.FC<TabProps> = () => {
  return (
    <RibbonGroup label="Performance">
         <RibbonButton variant="large" icon={<Gauge size={20} className="text-emerald-500" />} label="Check" subLabel="Performance" onClick={() => {}} />
    </RibbonGroup>
  );
};

export default PerformanceGroup;