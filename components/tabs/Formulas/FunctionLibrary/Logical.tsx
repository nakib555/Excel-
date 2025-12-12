import React from 'react';
import { Binary } from 'lucide-react';
import { RibbonButton } from '../../../shared';

const Logical = () => (
    <RibbonButton variant="large" icon={<Binary size={18} className="text-purple-600" />} label="Logical" hasDropdown onClick={() => {}} />
);

export default Logical;