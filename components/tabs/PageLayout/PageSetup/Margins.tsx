import React from 'react';
import { Maximize } from 'lucide-react';
import { RibbonButton } from '../../shared';

const Margins = () => (
    <RibbonButton variant="large" icon={<Maximize size={20} className="text-blue-500" />} label="Margins" hasDropdown onClick={() => {}} />
);

export default Margins;