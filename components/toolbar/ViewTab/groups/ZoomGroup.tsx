import React from 'react';
import { Search, FileText, ZoomIn } from 'lucide-react';
import { RibbonGroup, RibbonButton, TabProps } from '../../shared';

const ZoomGroup: React.FC<TabProps> = () => {
  return (
    <RibbonGroup label="Zoom">
         <div className="flex items-center gap-1 h-full">
             <RibbonButton variant="large" icon={<Search size={20} className="text-blue-500" />} label="Zoom" onClick={() => {}} />
             <RibbonButton variant="large" icon={<FileText size={20} className="text-slate-600" />} label="100%" onClick={() => {}} />
             <RibbonButton variant="large" icon={<ZoomIn size={20} className="text-blue-500" />} label="Zoom to" subLabel="Selection" onClick={() => {}} />
         </div>
    </RibbonGroup>
  );
};

export default ZoomGroup;