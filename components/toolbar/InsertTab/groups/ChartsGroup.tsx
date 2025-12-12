import React from 'react';
import { BarChart, BarChart3, LineChart, PieChart, ScatterChart, Map, BarChart4 } from 'lucide-react';
import { RibbonGroup, RibbonButton, TabProps } from '../../shared';

const ChartsGroup: React.FC<TabProps> = () => {
  return (
    <RibbonGroup label="Charts">
        <div className="flex gap-2 h-full items-center">
             <RibbonButton variant="large" icon={<BarChart size={20} className="text-blue-600" />} label="Recommended" subLabel="Charts" onClick={() => {}} />
             
             <div className="flex flex-col gap-0 h-full justify-center">
                 <div className="flex gap-0.5">
                     <RibbonButton variant="icon-only" icon={<BarChart3 size={14} className="text-blue-500" />} hasDropdown onClick={() => {}} title="Column" />
                     <RibbonButton variant="icon-only" icon={<LineChart size={14} className="text-red-500" />} hasDropdown onClick={() => {}} title="Line" />
                     <RibbonButton variant="icon-only" icon={<PieChart size={14} className="text-orange-500" />} hasDropdown onClick={() => {}} title="Pie" />
                 </div>
                 <div className="flex gap-0.5">
                     <RibbonButton variant="icon-only" icon={<ScatterChart size={14} className="text-indigo-500" />} hasDropdown onClick={() => {}} title="Scatter" />
                     <RibbonButton variant="icon-only" icon={<Map size={14} className="text-green-500" />} hasDropdown onClick={() => {}} title="Maps" />
                     <RibbonButton variant="icon-only" icon={<BarChart4 size={14} className="text-emerald-500" />} hasDropdown onClick={() => {}} title="PivotChart" />
                 </div>
             </div>
        </div>
    </RibbonGroup>
  );
};

export default ChartsGroup;