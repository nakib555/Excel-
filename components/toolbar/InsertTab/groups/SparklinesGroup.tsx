import React from 'react';
import { Activity, BarChart2, TrendingUp } from 'lucide-react';
import { RibbonGroup, RibbonButton, TabProps } from '../../shared';

const SparklinesGroup: React.FC<TabProps> = () => {
  return (
    <RibbonGroup label="Sparklines">
         <div className="flex flex-col gap-0 h-full justify-center">
             <RibbonButton variant="small" icon={<Activity size={14} className="text-blue-500" />} label="Line" onClick={() => {}} />
             <RibbonButton variant="small" icon={<BarChart2 size={14} className="text-emerald-500" />} label="Column" onClick={() => {}} />
             <RibbonButton variant="small" icon={<TrendingUp size={14} className="text-orange-500" />} label="Win/Loss" onClick={() => {}} />
         </div>
    </RibbonGroup>
  );
};

export default SparklinesGroup;