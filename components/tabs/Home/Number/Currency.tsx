import React from 'react';
import { DollarSign } from 'lucide-react';
import { RibbonButton } from '../../shared';

const Currency = () => (
    <RibbonButton variant="icon-only" icon={<DollarSign size={14} className="text-emerald-600" />} onClick={() => {}} title="Currency" />
);

export default Currency;
