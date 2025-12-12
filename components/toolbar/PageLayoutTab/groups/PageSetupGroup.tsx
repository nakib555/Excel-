import React from 'react';
import { Maximize, Smartphone, File, Printer, Scissors, Image, Columns } from 'lucide-react';
import { RibbonGroup, RibbonButton, TabProps } from '../../shared';

const PageSetupGroup: React.FC<TabProps> = () => {
  return (
    <RibbonGroup label="Page Setup">
         <div className="flex items-center gap-1 h-full">
             <RibbonButton variant="large" icon={<Maximize size={20} className="text-blue-500" />} label="Margins" hasDropdown onClick={() => {}} />
             <RibbonButton variant="large" icon={<Smartphone size={20} className="rotate-90 text-slate-600" />} label="Orientation" hasDropdown onClick={() => {}} />
             <RibbonButton variant="large" icon={<File size={20} className="text-slate-600" />} label="Size" hasDropdown onClick={() => {}} />
             <RibbonButton variant="large" icon={<Printer size={20} className="text-slate-700" />} label="Print" subLabel="Area" hasDropdown onClick={() => {}} />
             <div className="flex flex-col gap-0 justify-center pl-1">
                 <RibbonButton variant="small" icon={<Scissors size={14} className="text-red-500" />} label="Breaks" onClick={() => {}} />
                 <RibbonButton variant="small" icon={<Image size={14} className="text-purple-500" />} label="Background" onClick={() => {}} />
                 <RibbonButton variant="small" icon={<Columns size={14} className="text-slate-500" />} label="Print Titles" onClick={() => {}} />
             </div>
         </div>
    </RibbonGroup>
  );
};

export default PageSetupGroup;