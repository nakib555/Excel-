import React from 'react';
import { Filter, History } from 'lucide-react';
import { RibbonGroup, RibbonButton, TabProps } from '../../shared';

const FiltersGroup: React.FC<TabProps> = () => {
  return (
    <RibbonGroup label="Filters">
         <div className="flex flex-col gap-0 h-full justify-center">
             <RibbonButton variant="small" icon={<Filter size={14} className="text-blue-600" />} label="Slicer" onClick={() => {}} />
             <RibbonButton variant="small" icon={<History size={14} className="text-purple-600" />} label="Timeline" onClick={() => {}} />
         </div>
    </RibbonGroup>
  );
};

export default FiltersGroup;