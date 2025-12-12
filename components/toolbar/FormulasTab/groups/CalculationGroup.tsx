import React from 'react';
import { Calculator, FileSpreadsheet } from 'lucide-react';
import { RibbonGroup, RibbonButton, TabProps } from '../../shared';

const CalculationGroup: React.FC<TabProps> = () => {
  return (
    <RibbonGroup label="Calculation">
         <div className="flex items-center gap-1 h-full">
            <RibbonButton variant="large" icon={<Calculator size={20} className="text-slate-600" />} label="Calculation" subLabel="Options" hasDropdown onClick={() => {}} />
            <div className="flex flex-col gap-0 justify-center">
                 <RibbonButton variant="small" icon={<Calculator size={14} className="text-slate-600" />} label="Calculate Now" onClick={() => {}} />
                 <RibbonButton variant="small" icon={<FileSpreadsheet size={14} className="text-green-600" />} label="Calculate Sheet" onClick={() => {}} />
             </div>
         </div>
    </RibbonGroup>
  );
};

export default CalculationGroup;