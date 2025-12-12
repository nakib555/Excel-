import React from 'react';
import { BoxSelect, Sigma } from 'lucide-react';
import { RibbonGroup, RibbonButton, TabProps } from '../../shared';

const TextSymbolsGroup: React.FC<TabProps> = () => {
  return (
    <RibbonGroup label="Text & Symbols" className="border-r-0">
        <div className="flex gap-1 h-full items-center">
           <RibbonButton variant="large" icon={<BoxSelect size={20} className="text-slate-600" />} label="Text" hasDropdown onClick={() => {}} />
           <RibbonButton variant="large" icon={<Sigma size={20} className="text-slate-700" />} label="Symbols" hasDropdown onClick={() => {}} />
        </div>
    </RibbonGroup>
  );
};

export default TextSymbolsGroup;