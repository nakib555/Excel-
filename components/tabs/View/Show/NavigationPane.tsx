import React from 'react';
import { PanelLeftClose } from 'lucide-react';
import { RibbonButton } from '../../../shared';

const NavigationPane = () => (
    <RibbonButton variant="large" icon={<PanelLeftClose size={20} className="text-slate-700" />} label="Navigation" onClick={() => {}} />
);

export default NavigationPane;