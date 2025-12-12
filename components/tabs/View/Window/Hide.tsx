import React from 'react';
import { EyeOff } from 'lucide-react';
import { RibbonButton } from '../../../shared';

const Hide = () => (
    <RibbonButton variant="small" icon={<EyeOff size={14} className="text-slate-600" />} label="Hide" onClick={() => {}} />
);

export default Hide;