import React from 'react';
import { Monitor } from 'lucide-react';
import { RibbonButton } from '../../../shared';

const SwitchWindows = () => (
    <RibbonButton variant="small" icon={<Monitor size={14} className="text-slate-600" />} label="Switch Windows" hasDropdown onClick={() => {}} />
);

export default SwitchWindows;