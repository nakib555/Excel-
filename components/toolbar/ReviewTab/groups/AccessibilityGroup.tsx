import React from 'react';
import { Accessibility } from 'lucide-react';
import { RibbonGroup, RibbonButton, TabProps } from '../../shared';

const AccessibilityGroup: React.FC<TabProps> = () => {
  return (
    <RibbonGroup label="Accessibility">
         <RibbonButton variant="large" icon={<Accessibility size={20} className="text-blue-500" />} label="Check" subLabel="Accessibility" hasDropdown onClick={() => {}} />
    </RibbonGroup>
  );
};

export default AccessibilityGroup;