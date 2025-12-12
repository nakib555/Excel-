import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { RibbonGroup, RibbonButton, TabProps } from '../../shared';
import Checkbox from './Checkbox';

const IllustrationsGroup: React.FC<TabProps> = () => {
  return (
    <RibbonGroup label="Illustrations">
        <div className="flex gap-1 h-full items-center">
            <RibbonButton variant="large" icon={<ImageIcon size={20} className="text-purple-600" />} label="Illustrations" hasDropdown onClick={() => {}} />
            <Checkbox />
        </div>
    </RibbonGroup>
  );
};

export default IllustrationsGroup;
