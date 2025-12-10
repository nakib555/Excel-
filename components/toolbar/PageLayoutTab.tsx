import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { 
  Layout, Palette, Type, Sparkles, Maximize, Smartphone, File, Printer, 
  Scissors, Image, Columns, BringToFront, SendToBack, Layers, AlignLeft, 
  Group, RotateCw 
} from 'lucide-react';
import { RibbonGroup, RibbonButton, TabProps } from './shared';

const PageLayoutTab: React.FC<TabProps> = () => {
  return (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex h-full min-w-max gap-1"
    >
        <RibbonGroup label="Themes">
            <div className="flex items-center gap-2 h-full">
                <RibbonButton variant="large" icon={<Layout size={20} className="text-indigo-600" />} label="Themes" hasDropdown onClick={() => {}} />
                <div className="flex flex-col gap-0 justify-center">
                    <RibbonButton variant="small" icon={<Palette size={14} />} label="Colors" hasDropdown onClick={() => {}} />
                    <RibbonButton variant="small" icon={<Type size={14} />} label="Fonts" hasDropdown onClick={() => {}} />
                    <RibbonButton variant="small" icon={<Sparkles size={14} />} label="Effects" hasDropdown onClick={() => {}} />
                </div>
            </div>
        </RibbonGroup>

        <RibbonGroup label="Page Setup">
             <div className="flex items-center gap-1 h-full">
                 <RibbonButton variant="large" icon={<Maximize size={20} />} label="Margins" hasDropdown onClick={() => {}} />
                 <RibbonButton variant="large" icon={<Smartphone size={20} className="rotate-90" />} label="Orientation" hasDropdown onClick={() => {}} />
                 <RibbonButton variant="large" icon={<File size={20} />} label="Size" hasDropdown onClick={() => {}} />
                 <RibbonButton variant="large" icon={<Printer size={20} />} label="Print" subLabel="Area" hasDropdown onClick={() => {}} />
                 <div className="flex flex-col gap-0 justify-center pl-1">
                     <RibbonButton variant="small" icon={<Scissors size={14} />} label="Breaks" onClick={() => {}} />
                     <RibbonButton variant="small" icon={<Image size={14} />} label="Background" onClick={() => {}} />
                     <RibbonButton variant="small" icon={<Columns size={14} />} label="Print Titles" onClick={() => {}} />
                 </div>
             </div>
        </RibbonGroup>

        <RibbonGroup label="Scale to Fit">
            <div className="flex flex-col gap-0.5 justify-center h-full px-1">
                <div className="flex items-center gap-2 text-[10px] text-slate-600">
                    <span className="w-10">Width:</span>
                    <div className="border border-slate-300 rounded px-1 w-20 bg-white">Automatic</div>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-600">
                    <span className="w-10">Height:</span>
                    <div className="border border-slate-300 rounded px-1 w-20 bg-white">Automatic</div>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-600">
                    <span className="w-10">Scale:</span>
                    <div className="border border-slate-300 rounded px-1 w-16 bg-white">100%</div>
                </div>
            </div>
        </RibbonGroup>

        <RibbonGroup label="Sheet Options">
            <div className="flex gap-4 px-2 h-full items-center">
                <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] font-semibold text-slate-700">Gridlines</span>
                    <label className="flex items-center gap-1 text-[10px]"><input type="checkbox" checked /> View</label>
                    <label className="flex items-center gap-1 text-[10px]"><input type="checkbox" /> Print</label>
                </div>
                <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] font-semibold text-slate-700">Headings</span>
                    <label className="flex items-center gap-1 text-[10px]"><input type="checkbox" checked /> View</label>
                    <label className="flex items-center gap-1 text-[10px]"><input type="checkbox" /> Print</label>
                </div>
            </div>
        </RibbonGroup>

         <RibbonGroup label="Arrange">
             <div className="flex items-center gap-1 h-full">
                 <div className="flex flex-col gap-0 justify-center">
                     <RibbonButton variant="small" icon={<BringToFront size={14} />} label="Bring Forward" hasDropdown onClick={() => {}} />
                     <RibbonButton variant="small" icon={<SendToBack size={14} />} label="Send Backward" hasDropdown onClick={() => {}} />
                 </div>
                 <RibbonButton variant="large" icon={<Layers size={20} />} label="Selection" subLabel="Pane" onClick={() => {}} />
                 <div className="flex flex-col gap-0 justify-center">
                     <RibbonButton variant="small" icon={<AlignLeft size={14} />} label="Align" hasDropdown onClick={() => {}} />
                     <RibbonButton variant="small" icon={<Group size={14} />} label="Group" hasDropdown onClick={() => {}} />
                     <RibbonButton variant="small" icon={<RotateCw size={14} />} label="Rotate" hasDropdown onClick={() => {}} />
                 </div>
             </div>
        </RibbonGroup>
    </motion.div>
  );
};

export default memo(PageLayoutTab);