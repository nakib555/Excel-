import React from 'react';
import { Layout } from 'lucide-react';
import { RibbonButton } from '../../shared';

const Format = () => (
    <RibbonButton variant="small" icon={<Layout size={14} className="text-slate-600" />} label="Format" onClick={() => {}} hasDropdown />
);

export default Format;
