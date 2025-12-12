import React from 'react';
import { Workflow } from 'lucide-react';
import { RibbonGroup, RibbonButton, TabProps } from '../../shared';

const PowerAutomateGroup: React.FC<TabProps> = () => {
  return (
    <RibbonGroup label="Power Automate">
         <div className="flex items-center gap-1 h-full">
             <RibbonButton variant="large" icon={<Workflow size={20} className="text-blue-500" />} label="Flow" subLabel="Templates" disabled onClick={() => {}} />
         </div>
    </RibbonGroup>
  );
};

export default PowerAutomateGroup;