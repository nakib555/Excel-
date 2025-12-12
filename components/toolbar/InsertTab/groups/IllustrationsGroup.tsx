import React from 'react';
import { Image as ImageIcon, CheckSquare } from 'lucide-react';
import { RibbonGroup, RibbonButton, TabProps } from '../../shared';

const IllustrationsGroup: React.FC<TabProps> = () => {
  return (
    <RibbonGroup label="Illustrations">
         <div className="flex gap-1 h-full items-center">
             <RibbonButton variant="large" icon={<ImageIcon size={20} className="text-purple-600" />} label="Illustrations" hasDropdown onClick={() => {}} />
             <RibbonButton variant="large" icon={<CheckSquare size={20} className="text-slate-600" />} label="Checkbox" onClick={() => {}} />
         </div>
    </RibbonGroup>
  );
};

export default IllustrationsGroup;