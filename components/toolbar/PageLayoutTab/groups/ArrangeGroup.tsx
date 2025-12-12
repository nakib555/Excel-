import React from 'react';
import { BringToFront, SendToBack, Layers, AlignLeft, Group, RotateCw } from 'lucide-react';
import { RibbonGroup, RibbonButton, TabProps } from '../../shared';

const ArrangeGroup: React.FC<TabProps> = () => {
  return (
    <RibbonGroup label="Arrange">
         <div className="flex items-center gap-1 h-full">
             <div className="flex flex-col gap-0 justify-center">
                 <RibbonButton variant="small" icon={<BringToFront size={14} className="text-orange-600" />} label="Bring Forward" hasDropdown onClick={() => {}} />
                 <RibbonButton variant="small" icon={<SendToBack size={14} className="text-orange-600" />} label="Send Backward" hasDropdown onClick={() => {}} />
             </div>
             <RibbonButton variant="large" icon={<Layers size={20} className="text-blue-500" />} label="Selection" subLabel="Pane" onClick={() => {}} />
             <div className="flex flex-col gap-0 justify-center">
                 <RibbonButton variant="small" icon={<AlignLeft size={14} className="text-slate-600" />} label="Align" hasDropdown onClick={() => {}} />
                 <RibbonButton variant="small" icon={<Group size={14} className="text-slate-600" />} label="Group" hasDropdown onClick={() => {}} />
                 <RibbonButton variant="small" icon={<RotateCw size={14} className="text-slate-600" />} label="Rotate" hasDropdown onClick={() => {}} />
             </div>
         </div>
    </RibbonGroup>
  );
};

export default ArrangeGroup;