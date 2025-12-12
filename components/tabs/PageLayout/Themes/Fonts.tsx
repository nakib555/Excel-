import React from 'react';
import { Type } from 'lucide-react';
import { RibbonButton } from '../../shared';

const Fonts = () => (
    <RibbonButton variant="small" icon={<Type size={14} className="text-slate-600" />} label="Fonts" hasDropdown onClick={() => {}} />
);

export default Fonts;