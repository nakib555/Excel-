import React from 'react';
import { Coins } from 'lucide-react';
import { RibbonButton } from '../../../shared';

const Financial = () => (
    <RibbonButton variant="large" icon={<Coins size={18} className="text-green-600" />} label="Financial" hasDropdown onClick={() => {}} />
);

export default Financial;