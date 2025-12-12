import React from 'react';
import { Sigma } from 'lucide-react';
import { RibbonButton } from '../../shared';

interface AutoSumProps {
  onAutoSum?: () => void;
}

const AutoSum: React.FC<AutoSumProps> = ({ onAutoSum }) => (
    <RibbonButton variant="small" icon={<Sigma size={14} className="text-orange-600" />} label="AutoSum" onClick={onAutoSum || (() => {})} hasDropdown />
);

export default AutoSum;