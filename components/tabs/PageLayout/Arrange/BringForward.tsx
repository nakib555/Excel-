import React from 'react';
import { BringToFront } from 'lucide-react';
import { RibbonButton } from '../../shared';

const BringForward = () => (
    <RibbonButton variant="small" icon={<BringToFront size={14} className="text-orange-600" />} label="Bring Forward" hasDropdown onClick={() => {}} />
);

export default BringForward;