

import React from 'react';
import { Merge } from 'lucide-react';
import { RibbonButton } from '../../shared';

interface MergeCenterProps {
    onMergeCenter?: () => void;
}

const MergeCenter: React.FC<MergeCenterProps> = ({ onMergeCenter }) => (
    <RibbonButton
        variant="icon-only"
        icon={<Merge size={16} className="text-slate-600" />}
        hasDropdown
        onClick={onMergeCenter || (() => {})}
        title="Merge & Center"
    />
);

export default MergeCenter;