import React from 'react';
import { Sigma } from 'lucide-react';
import { RibbonButton } from '../../shared';

const AutoSum = () => (
    <RibbonButton variant="small" icon={<Sigma size={14} className="text-orange-600" />} label="AutoSum" onClick={() => {}} hasDropdown />
);

export default AutoSum;
