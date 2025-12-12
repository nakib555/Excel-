import React from 'react';
import { X } from 'lucide-react';
import { RibbonButton } from '../../shared';

const Delete = () => (
    <RibbonButton variant="small" icon={<X size={14} className="text-rose-600" />} label="Delete" onClick={() => {}} hasDropdown />
);

export default Delete;
