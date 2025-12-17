
import React from 'react';
import { Merge } from 'lucide-react';
import { RibbonButton } from '../../shared';

const MergeCenter = () => (
    <RibbonButton
        variant="small"
        icon={<Merge size={16} className="text-emerald-500" />}
        label="Merge & Center"
        hasDropdown
        onClick={() => {}}
        className="w-full justify-start px-2"
    />
);

export default MergeCenter;
