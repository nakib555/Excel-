import React from 'react';
import { Eraser } from 'lucide-react';
import { RibbonButton } from '../../../shared';

const ClearFilter = () => (
    <RibbonButton variant="small" icon={<Eraser size={14} className="text-pink-500" />} label="Clear" disabled onClick={() => {}} />
);

export default ClearFilter;