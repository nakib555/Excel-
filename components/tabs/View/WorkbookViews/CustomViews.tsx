import React from 'react';
import { Settings } from 'lucide-react';
import { RibbonButton } from '../../../shared';

const CustomViews = () => (
    <RibbonButton variant="large" icon={<Settings size={20} className="text-slate-600" />} label="Custom" subLabel="Views" onClick={() => {}} />
);

export default CustomViews;