import React from 'react';
import { Tag } from 'lucide-react';
import { RibbonButton } from '../../../shared';

const DefineName = () => (
    <RibbonButton variant="small" icon={<Tag size={14} className="text-pink-500" />} label="Define Name" hasDropdown onClick={() => {}} />
);

export default DefineName;