import React from 'react';
import { Percent as PercentIcon } from 'lucide-react';
import { RibbonButton } from '../../shared';

const PercentStyle = () => (
    <RibbonButton variant="icon-only" icon={<PercentIcon size={14} className="text-blue-600" />} onClick={() => {}} title="Percent" />
);

export default PercentStyle;
