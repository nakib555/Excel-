import React from 'react';
import { EyeOff } from 'lucide-react';
import { RibbonButton } from '../../../shared';

const HideView = () => (
    <RibbonButton variant="icon-only" icon={<EyeOff size={14} className="text-slate-400" />} disabled onClick={() => {}} title="Hide View" />
);

export default HideView;