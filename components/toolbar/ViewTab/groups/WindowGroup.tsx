import React from 'react';
import { AppWindow, LayoutList, Columns2, Split, EyeOff, View as ViewEye, Monitor } from 'lucide-react';
import { RibbonGroup, RibbonButton, TabProps } from '../../shared';

const WindowGroup: React.FC<TabProps> = () => {
  return (
    <RibbonGroup label="Window">
         <div className="flex items-center gap-1 h-full">
             <RibbonButton variant="large" icon={<AppWindow size={20} className="text-blue-500" />} label="New Window" onClick={() => {}} />
             <RibbonButton variant="large" icon={<LayoutList size={20} className="text-slate-600" />} label="Arrange All" onClick={() => {}} />
             <RibbonButton variant="large" icon={<Columns2 size={20} className="text-blue-500" />} label="Freeze" subLabel="Panes" hasDropdown onClick={() => {}} />
              <div className="flex flex-col gap-0 justify-center">
                 <div className="flex gap-0.5">
                    <RibbonButton variant="small" icon={<Split size={14} className="text-slate-600" />} label="Split" onClick={() => {}} />
                    <RibbonButton variant="small" icon={<EyeOff size={14} className="text-slate-600" />} label="Hide" onClick={() => {}} />
                    <RibbonButton variant="small" icon={<ViewEye size={14} className="text-slate-600" />} label="Unhide" onClick={() => {}} />
                 </div>
                  <div className="flex gap-0.5">
                    <RibbonButton variant="small" icon={<Monitor size={14} className="text-slate-600" />} label="Switch Windows" hasDropdown onClick={() => {}} />
                 </div>
             </div>
         </div>
    </RibbonGroup>
  );
};

export default WindowGroup;