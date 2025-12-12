import React from 'react';
import { ArrowRightFromLine, ArrowLeftFromLine, X, FunctionSquare, ShieldAlert, Calculator, Eye } from 'lucide-react';
import { RibbonGroup, RibbonButton, TabProps } from '../../shared';

const FormulaAuditingGroup: React.FC<TabProps> = () => {
  return (
    <RibbonGroup label="Formula Auditing">
         <div className="flex items-center gap-1 h-full">
             <div className="flex flex-col gap-0 justify-center">
                 <RibbonButton variant="small" icon={<ArrowRightFromLine size={14} className="text-blue-500" />} label="Trace Precedents" onClick={() => {}} />
                 <RibbonButton variant="small" icon={<ArrowLeftFromLine size={14} className="text-blue-500" />} label="Trace Dependents" onClick={() => {}} />
                 <RibbonButton variant="small" icon={<X size={14} className="text-red-500" />} label="Remove Arrows" hasDropdown onClick={() => {}} />
             </div>
             <div className="flex flex-col gap-0 justify-center">
                 <RibbonButton variant="small" icon={<FunctionSquare size={14} className="text-slate-500" />} label="Show Formulas" onClick={() => {}} />
                 <RibbonButton variant="small" icon={<ShieldAlert size={14} className="text-amber-500" />} label="Error Checking" hasDropdown onClick={() => {}} />
                 <RibbonButton variant="small" icon={<Calculator size={14} className="text-slate-500" />} label="Evaluate Formula" onClick={() => {}} />
             </div>
             <RibbonButton variant="large" icon={<Eye size={20} className="text-teal-600" />} label="Watch" subLabel="Window" onClick={() => {}} />
         </div>
    </RibbonGroup>
  );
};

export default FormulaAuditingGroup;