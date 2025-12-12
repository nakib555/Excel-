import React from 'react';
import { Settings } from 'lucide-react';
import { RibbonButton } from '../../../shared';

const Properties = () => (
    <RibbonButton variant="small" icon={<Settings size={14} className="text-slate-500" />} label="Properties" disabled onClick={() => {}} />
);

export default Properties;