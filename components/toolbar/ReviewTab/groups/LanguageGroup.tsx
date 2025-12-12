import React from 'react';
import { Languages } from 'lucide-react';
import { RibbonGroup, RibbonButton, TabProps } from '../../shared';

const LanguageGroup: React.FC<TabProps> = () => {
  return (
    <RibbonGroup label="Language">
         <RibbonButton variant="large" icon={<Languages size={20} className="text-indigo-600" />} label="Translate" onClick={() => {}} />
    </RibbonGroup>
  );
};

export default LanguageGroup;