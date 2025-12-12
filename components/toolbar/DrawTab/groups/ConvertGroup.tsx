import React from 'react';
import { Shapes, Pi } from 'lucide-react';
import { RibbonGroup, RibbonButton, TabProps } from '../../shared';

const ConvertGroup: React.FC<TabProps> = () => {
  return (
    <RibbonGroup label="Convert">
        <div className="flex items-center gap-1 h-full">
            <RibbonButton variant="large" icon={<Shapes size={20} className="text-indigo-500" />} label="Ink to" subLabel="Shape" onClick={() => {}} />
            <RibbonButton variant="large" icon={<Pi size={20} className="text-orange-500" />} label="Ink to" subLabel="Math" onClick={() => {}} />
        </div>
    </RibbonGroup>
  );
};

export default ConvertGroup;