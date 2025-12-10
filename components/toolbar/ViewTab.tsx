import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronDown, Save, EyeOff, Grid, Layout, FileSpreadsheet, Settings, 
  PanelLeftClose, Plus, Search, FileText, ZoomIn, AppWindow, LayoutList, 
  Columns2, Split, View as ViewEye, Monitor 
} from 'lucide-react';
import { RibbonGroup, RibbonButton, TabProps } from './shared';

const ViewTab: React.FC<TabProps> = () => {
  return (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex h-full min-w-max gap-1"
    >
         <RibbonGroup label="Sheet View">
             <div className="flex items-center gap-1 h-full">
                 <div className="flex flex-col gap-0 justify-center">
                     <div className="bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] rounded text-slate-500 w-24 flex justify-between items-center">Default <ChevronDown size={8}/></div>
                     <div className="flex gap-1 mt-1">
                          <RibbonButton variant="icon-only" icon={<Save size={14} />} disabled onClick={() => {}} />
                          <RibbonButton variant="icon-only" icon={<EyeOff size={14} />} disabled onClick={() => {}} />
                     </div>
                 </div>
             </div>
        </RibbonGroup>

        <RibbonGroup label="Workbook Views">
            <div className="flex items-center gap-1 h-full">
                 <RibbonButton variant="large" icon={<Grid size={24} />} label="Normal" onClick={() => {}} />
                 <RibbonButton variant="large" icon={<Layout size={24} />} label="Page Break" subLabel="Preview" onClick={() => {}} />
                 <RibbonButton variant="large" icon={<FileSpreadsheet size={24} />} label="Page Layout" onClick={() => {}} />
                 <RibbonButton variant="large" icon={<Settings size={24} />} label="Custom" subLabel="Views" onClick={() => {}} />
            </div>
        </RibbonGroup>

        <RibbonGroup label="Show">
             <div className="flex gap-4 px-2 h-full items-center">
                <RibbonButton variant="large" icon={<PanelLeftClose size={24} />} label="Navigation" onClick={() => {}} />
                <div className="flex flex-col gap-1">
                    <label className="flex items-center gap-1 text-[10px]"><input type="checkbox" disabled /> Ruler</label>
                    <label className="flex items-center gap-1 text-[10px]"><input type="checkbox" checked /> Gridlines</label>
                    <label className="flex items-center gap-1 text-[10px]"><input type="checkbox" checked /> Formula Bar</label>
                </div>
                 <div className="flex flex-col gap-1">
                    <label className="flex items-center gap-1 text-[10px]"><input type="checkbox" checked /> Headings</label>
                    <label className="flex items-center gap-1 text-[10px]"><input type="checkbox" checked /> Data Type Icons</label>
                    <div className="flex items-center gap-1 text-[10px] text-green-700 font-medium"><Plus size={10} /> Focus Cell</div>
                </div>
            </div>
        </RibbonGroup>

        <RibbonGroup label="Zoom">
             <div className="flex items-center gap-1 h-full">
                 <RibbonButton variant="large" icon={<Search size={24} />} label="Zoom" onClick={() => {}} />
                 <RibbonButton variant="large" icon={<FileText size={24} />} label="100%" onClick={() => {}} />
                 <RibbonButton variant="large" icon={<ZoomIn size={24} />} label="Zoom to" subLabel="Selection" onClick={() => {}} />
             </div>
        </RibbonGroup>

        <RibbonGroup label="Window">
             <div className="flex items-center gap-1 h-full">
                 <RibbonButton variant="large" icon={<AppWindow size={24} />} label="New Window" onClick={() => {}} />
                 <RibbonButton variant="large" icon={<LayoutList size={24} />} label="Arrange All" onClick={() => {}} />
                 <RibbonButton variant="large" icon={<Columns2 size={24} />} label="Freeze" subLabel="Panes" hasDropdown onClick={() => {}} />
                  <div className="flex flex-col gap-0 justify-center">
                     <div className="flex gap-0.5">
                        <RibbonButton variant="small" icon={<Split size={14} />} label="Split" onClick={() => {}} />
                        <RibbonButton variant="small" icon={<EyeOff size={14} />} label="Hide" onClick={() => {}} />
                        <RibbonButton variant="small" icon={<ViewEye size={14} />} label="Unhide" onClick={() => {}} />
                     </div>
                      <div className="flex gap-0.5">
                        <RibbonButton variant="small" icon={<Monitor size={14} />} label="Switch Windows" hasDropdown onClick={() => {}} />
                     </div>
                 </div>
             </div>
        </RibbonGroup>
    </motion.div>
  );
};

export default memo(ViewTab);
