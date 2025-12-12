import React from 'react';
import { View as ViewEye } from 'lucide-react';
import { RibbonButton } from '../../../shared';

const Unhide = () => (
    <RibbonButton variant="small" icon={<ViewEye size={14} className="text-slate-600" />} label="Unhide" onClick={() => {}} />
);

export default Unhide;