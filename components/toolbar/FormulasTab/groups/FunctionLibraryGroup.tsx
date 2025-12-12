import React from 'react';
import { FunctionSquare, Sigma, BookOpen, Coins, Binary, Type, Calendar, Search, Triangle } from 'lucide-react';
import { RibbonGroup, RibbonButton, TabProps } from '../../shared';

const FunctionLibraryGroup: React.FC<TabProps> = () => {
  return (
    <RibbonGroup label="Function Library">
         <div className="flex items-center gap-1 h-full">
             <RibbonButton variant="large" icon={<FunctionSquare size={20} className="text-blue-600" />} label="Insert" subLabel="Function" onClick={() => {}} />
             <RibbonButton variant="large" icon={<Sigma size={20} className="text-orange-600" />} label="AutoSum" hasDropdown onClick={() => {}} />
             <div className="flex gap-0.5 h-full items-center">
                 <RibbonButton variant="large" icon={<BookOpen size={18} className="text-amber-500" />} label="Recently" subLabel="Used" hasDropdown onClick={() => {}} />
                 <RibbonButton variant="large" icon={<Coins size={18} className="text-green-600" />} label="Financial" hasDropdown onClick={() => {}} />
                 <RibbonButton variant="large" icon={<Binary size={18} className="text-purple-600" />} label="Logical" hasDropdown onClick={() => {}} />
                 <RibbonButton variant="large" icon={<Type size={18} className="text-slate-600" />} label="Text" hasDropdown onClick={() => {}} />
                 <RibbonButton variant="large" icon={<Calendar size={18} className="text-red-500" />} label="Date &" subLabel="Time" hasDropdown onClick={() => {}} />
                 <RibbonButton variant="large" icon={<Search size={18} className="text-blue-500" />} label="Lookup &" subLabel="Ref" hasDropdown onClick={() => {}} />
                 <RibbonButton variant="large" icon={<Triangle size={18} className="text-indigo-500" />} label="Math &" subLabel="Trig" hasDropdown onClick={() => {}} />
             </div>
         </div>
    </RibbonGroup>
  );
};

export default FunctionLibraryGroup;