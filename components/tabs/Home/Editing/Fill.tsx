
import React from 'react';
import { ArrowDown } from 'lucide-react';
import { RibbonButton } from '../../shared';

const Fill = () => (
    <RibbonButton variant="small" icon={<ArrowDown size={14} className="text-blue-600" />} label="Fill" hasDropdown onClick={() => {}} />
);

export default Fill;
