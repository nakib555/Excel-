import React from 'react';
import { Sigma } from 'lucide-react';
import { RibbonButton } from '../../../shared';

const AutoSum = () => (
    <RibbonButton variant="large" icon={<Sigma size={20} className="text-orange-600" />} label="AutoSum" hasDropdown onClick={() => {}} />
);

export default AutoSum;