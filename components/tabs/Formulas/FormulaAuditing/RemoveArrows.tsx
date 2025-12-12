import React from 'react';
import { X } from 'lucide-react';
import { RibbonButton } from '../../../shared';

const RemoveArrows = () => (
    <RibbonButton variant="small" icon={<X size={14} className="text-red-500" />} label="Remove Arrows" hasDropdown onClick={() => {}} />
);

export default RemoveArrows;