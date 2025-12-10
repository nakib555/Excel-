import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { 
  FunctionSquare, Sigma, BookOpen, Coins, Binary, Type, Calendar, Search, 
  Triangle, Tag, FileCode, Grid3X3, ArrowRightFromLine, ArrowLeftFromLine, 
  X, ShieldAlert, Calculator, Eye, FileSpreadsheet 
} from 'lucide-react';
import { RibbonGroup, RibbonButton, TabProps } from '../shared';

const FormulasTab: React.FC<TabProps> = () => {
  return (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex h-full min-w-max gap-1"
    >
        <RibbonGroup label="Function Library">
             <div className="flex items-center gap-1 h-full">
                 <RibbonButton variant="large" icon={<FunctionSquare size={20} />} label="Insert" subLabel="Function" onClick={() => {}} />
                 <RibbonButton variant="large" icon={<Sigma size={20} />} label="AutoSum" hasDropdown onClick={() => {}} />
                 <div className="flex gap-0.5 h-full items-center">
                     <RibbonButton variant="large" icon={<BookOpen size={18} className="text-orange-500" />} label="Recently" subLabel="Used" hasDropdown onClick={() => {}} />
                     <RibbonButton variant="large" icon={<Coins size={18} className="text-green-600" />} label="Financial" hasDropdown onClick={() => {}} />
                     <RibbonButton variant="large" icon={<Binary size={18} className="text-purple-600" />} label="Logical" hasDropdown onClick={() => {}} />
                     <RibbonButton variant="large" icon={<Type size={18} className="text-slate-600" />} label="Text" hasDropdown onClick={() => {}} />
                     <RibbonButton variant="large" icon={<Calendar size={18} className="text-red-500" />} label="Date &" subLabel="Time" hasDropdown onClick={() => {}} />
                     <RibbonButton variant="large" icon={<Search size={18} className="text-blue-500" />} label="Lookup &" subLabel="Ref" hasDropdown onClick={() => {}} />
                     <RibbonButton variant="large" icon={<Triangle size={18} className="text-indigo-500" />} label="Math &" subLabel="Trig" hasDropdown onClick={() => {}} />
                 </div>
             </div>
        </RibbonGroup>

        <RibbonGroup label="Defined Names">
             <div className="flex items-center gap-1 h-full">
                 <RibbonButton variant="large" icon={<Tag size={20} />} label="Name" subLabel="Manager" onClick={() => {}} />
                 <div className="flex flex-col gap-0 justify-center">
                     <RibbonButton variant="small" icon={<Tag size={14} />} label="Define Name" hasDropdown onClick={() => {}} />
                     <RibbonButton variant="small" icon={<FileCode size={14} />} label="Use in Formula" hasDropdown onClick={() => {}} />
                     <RibbonButton variant="small" icon={<Grid3X3 size={14} />} label="Create from Selection" onClick={() => {}} />
                 </div>
             </div>
        </RibbonGroup>

        <RibbonGroup label="Formula Auditing">
             <div className="flex items-center gap-1 h-full">
                 <div className="flex flex-col gap-0 justify-center">
                     <RibbonButton variant="small" icon={<ArrowRightFromLine size={14} />} label="Trace Precedents" onClick={() => {}} />
                     <RibbonButton variant="small" icon={<ArrowLeftFromLine size={14} />} label="Trace Dependents" onClick={() => {}} />
                     <RibbonButton variant="small" icon={<X size={14} className="text-red-500" />} label="Remove Arrows" hasDropdown onClick={() => {}} />
                 </div>
                 <div className="flex flex-col gap-0 justify-center">
                     <RibbonButton variant="small" icon={<FunctionSquare size={14} />} label="Show Formulas" onClick={() => {}} />
                     <RibbonButton variant="small" icon={<ShieldAlert size={14} className="text-amber-500" />} label="Error Checking" hasDropdown onClick={() => {}} />
                     <RibbonButton variant="small" icon={<Calculator size={14} />} label="Evaluate Formula" onClick={() => {}} />
                 </div>
                 <RibbonButton variant="large" icon={<Eye size={20} />} label="Watch" subLabel="Window" onClick={() => {}} />
             </div>
        </RibbonGroup>

         <RibbonGroup label="Calculation">
             <div className="flex items-center gap-1 h-full">
                <RibbonButton variant="large" icon={<Calculator size={20} />} label="Calculation" subLabel="Options" hasDropdown onClick={() => {}} />
                <div className="flex flex-col gap-0 justify-center">
                     <RibbonButton variant="small" icon={<Calculator size={14} />} label="Calculate Now" onClick={() => {}} />
                     <RibbonButton variant="small" icon={<FileSpreadsheet size={14} />} label="Calculate Sheet" onClick={() => {}} />
                 </div>
             </div>
         </RibbonGroup>
    </motion.div>
  );
};

export default memo(FormulasTab);