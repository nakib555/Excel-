import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { 
  Table2, TableProperties, Table, FormInput, Image as ImageIcon, CheckSquare, 
  BarChart, BarChart3, LineChart, PieChart, ScatterChart, Map, BarChart4, 
  Activity, BarChart2, TrendingUp, Filter, History, Link2, MessageSquare, 
  BoxSelect, Sigma 
} from 'lucide-react';
import { RibbonGroup, RibbonButton, TabProps } from '../shared';

const InsertTab: React.FC<TabProps> = () => {
  return (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex h-full min-w-max gap-1"
    >
        <RibbonGroup label="Tables">
            <RibbonButton variant="large" icon={<Table2 size={20} />} label="PivotTable" hasDropdown onClick={() => {}} />
            <RibbonButton variant="large" icon={<TableProperties size={20} className="text-blue-600" />} label="Recommended" subLabel="Pivots" onClick={() => {}} />
            <RibbonButton variant="large" icon={<Table size={20} />} label="Table" onClick={() => {}} />
            <RibbonButton variant="large" icon={<FormInput size={20} className="text-teal-600" />} label="Forms" hasDropdown onClick={() => {}} />
        </RibbonGroup>

        <RibbonGroup label="Illustrations">
             <div className="flex gap-1 h-full items-center">
                 <RibbonButton variant="large" icon={<ImageIcon size={20} className="text-purple-600" />} label="Illustrations" hasDropdown onClick={() => {}} />
                 <RibbonButton variant="large" icon={<CheckSquare size={20} />} label="Checkbox" onClick={() => {}} />
             </div>
        </RibbonGroup>

        <RibbonGroup label="Charts">
            <div className="flex gap-2 h-full items-center">
                 <RibbonButton variant="large" icon={<BarChart size={20} />} label="Recommended" subLabel="Charts" onClick={() => {}} />
                 
                 <div className="flex flex-col gap-0 h-full justify-center">
                     <div className="flex gap-0.5">
                         <RibbonButton variant="icon-only" icon={<BarChart3 size={14} />} hasDropdown onClick={() => {}} title="Column" />
                         <RibbonButton variant="icon-only" icon={<LineChart size={14} />} hasDropdown onClick={() => {}} title="Line" />
                         <RibbonButton variant="icon-only" icon={<PieChart size={14} />} hasDropdown onClick={() => {}} title="Pie" />
                     </div>
                     <div className="flex gap-0.5">
                         <RibbonButton variant="icon-only" icon={<ScatterChart size={14} />} hasDropdown onClick={() => {}} title="Scatter" />
                         <RibbonButton variant="icon-only" icon={<Map size={14} />} hasDropdown onClick={() => {}} title="Maps" />
                         <RibbonButton variant="icon-only" icon={<BarChart4 size={14} />} hasDropdown onClick={() => {}} title="PivotChart" />
                     </div>
                 </div>
            </div>
        </RibbonGroup>

        <RibbonGroup label="Sparklines">
             <div className="flex flex-col gap-0 h-full justify-center">
                 <RibbonButton variant="small" icon={<Activity size={14} />} label="Line" onClick={() => {}} />
                 <RibbonButton variant="small" icon={<BarChart2 size={14} />} label="Column" onClick={() => {}} />
                 <RibbonButton variant="small" icon={<TrendingUp size={14} />} label="Win/Loss" onClick={() => {}} />
             </div>
        </RibbonGroup>
        
        <RibbonGroup label="Filters">
             <div className="flex flex-col gap-0 h-full justify-center">
                 <RibbonButton variant="small" icon={<Filter size={14} />} label="Slicer" onClick={() => {}} />
                 <RibbonButton variant="small" icon={<History size={14} />} label="Timeline" onClick={() => {}} />
             </div>
        </RibbonGroup>

        <RibbonGroup label="Links & Comments">
            <div className="flex gap-1 h-full items-center">
               <RibbonButton variant="large" icon={<Link2 size={20} />} label="Link" hasDropdown onClick={() => {}} />
               <RibbonButton variant="large" icon={<MessageSquare size={20} />} label="Comment" onClick={() => {}} />
            </div>
        </RibbonGroup>

        <RibbonGroup label="Text & Symbols" className="border-r-0">
            <div className="flex gap-1 h-full items-center">
               <RibbonButton variant="large" icon={<BoxSelect size={20} />} label="Text" hasDropdown onClick={() => {}} />
               <RibbonButton variant="large" icon={<Sigma size={20} />} label="Symbols" hasDropdown onClick={() => {}} />
            </div>
        </RibbonGroup>
    </motion.div>
  );
};

export default memo(InsertTab);