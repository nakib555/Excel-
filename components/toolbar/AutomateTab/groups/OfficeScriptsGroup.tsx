import React from 'react';
import { ScrollText, List } from 'lucide-react';
import { RibbonGroup, RibbonButton, TabProps } from '../../shared';

const OfficeScriptsGroup: React.FC<TabProps> = () => {
  return (
    <RibbonGroup label="Office Scripts">
         <div className="flex items-center gap-1 h-full">
             <RibbonButton variant="large" icon={<ScrollText size={20} className="text-blue-600" />} label="New" subLabel="Script" hasDropdown onClick={() => {}} />
             <RibbonButton variant="large" icon={<List size={20} className="text-slate-600" />} label="View" subLabel="Scripts" hasDropdown onClick={() => {}} />
         </div>
    </RibbonGroup>
  );
};

export default OfficeScriptsGroup;