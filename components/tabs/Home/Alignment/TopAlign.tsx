import React from 'react';
import { AlignVerticalJustifyStart } from 'lucide-react';
import { RibbonButton } from '../../shared';

const TopAlign = () => (
    <RibbonButton variant="icon-only" icon={<AlignVerticalJustifyStart size={14} className="rotate-180 text-slate-600" />} onClick={() => {}} title="Top Align" />
);

export default TopAlign;
