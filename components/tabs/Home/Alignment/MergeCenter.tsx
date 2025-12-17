
import React from 'react';
import { Merge } from 'lucide-react';
import { RibbonButton } from '../../shared';

const MergeCenter = () => (
    <RibbonButton
        variant="small"
        icon={<Merge size={16} className="text-slate-600" />}
        label="Merge & Center"
        hasDropdown
        onClick={() => {}}
        title="Merge & Center"
    />
);

export default MergeCenter;
