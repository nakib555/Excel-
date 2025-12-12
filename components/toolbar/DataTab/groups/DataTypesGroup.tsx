import React from 'react';
import { Landmark, Coins } from 'lucide-react';
import { RibbonGroup, RibbonButton, TabProps } from '../../shared';

const DataTypesGroup: React.FC<TabProps> = () => {
  return (
    <RibbonGroup label="Data Types">
         <div className="flex items-center gap-1 h-full">
             <RibbonButton variant="large" icon={<Landmark size={20} className="text-emerald-500" />} label="Stocks" onClick={() => {}} />
             <RibbonButton variant="large" icon={<Coins size={20} className="text-yellow-500" />} label="Currencies" onClick={() => {}} />
         </div>
    </RibbonGroup>
  );
};

export default DataTypesGroup;