import React from 'react';
import { PenTool } from 'lucide-react';
import { RibbonGroup, RibbonButton, TabProps } from '../../shared';

const InkGroup: React.FC<TabProps> = () => {
  return (
    <RibbonGroup label="Ink">
         <RibbonButton variant="large" icon={<PenTool size={20} className="text-purple-600" />} label="Hide" subLabel="Ink" hasDropdown onClick={() => {}} />
    </RibbonGroup>
  );
};

export default InkGroup;