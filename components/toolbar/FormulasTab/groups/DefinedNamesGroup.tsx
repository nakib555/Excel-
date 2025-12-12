import React from 'react';
import { Tag, FileCode, Grid3X3 } from 'lucide-react';
import { RibbonGroup, RibbonButton, TabProps } from '../../shared';

const DefinedNamesGroup: React.FC<TabProps> = () => {
  return (
    <RibbonGroup label="Defined Names">
         <div className="flex items-center gap-1 h-full">
             <RibbonButton variant="large" icon={<Tag size={20} className="text-pink-500" />} label="Name" subLabel="Manager" onClick={() => {}} />
             <div className="flex flex-col gap-0 justify-center">
                 <RibbonButton variant="small" icon={<Tag size={14} className="text-pink-500" />} label="Define Name" hasDropdown onClick={() => {}} />
                 <RibbonButton variant="small" icon={<FileCode size={14} className="text-slate-500" />} label="Use in Formula" hasDropdown onClick={() => {}} />
                 <RibbonButton variant="small" icon={<Grid3X3 size={14} className="text-slate-500" />} label="Create from Selection" onClick={() => {}} />
             </div>
         </div>
    </RibbonGroup>
  );
};

export default DefinedNamesGroup;