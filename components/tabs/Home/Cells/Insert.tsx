import React from 'react';
import { Plus } from 'lucide-react';
import { RibbonButton } from '../../shared';

const Insert = () => (
    <RibbonButton variant="small" icon={<Plus size={14} className="text-emerald-600" />} label="Insert" onClick={() => {}} hasDropdown />
);

export default Insert;
