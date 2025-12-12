import React from 'react';
import { Sigma } from 'lucide-react';
import { RibbonButton } from '../../shared';

const Symbols = () => (
    <RibbonButton variant="large" icon={<Sigma size={20} className="text-slate-700" />} label="Symbols" hasDropdown onClick={() => {}} />
);

export default Symbols;
