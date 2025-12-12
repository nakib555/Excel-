import React from 'react';
import { AlignVerticalJustifyEnd } from 'lucide-react';
import { RibbonButton } from '../../shared';

const BottomAlign = () => (
    <RibbonButton variant="icon-only" icon={<AlignVerticalJustifyEnd size={14} className="rotate-180 text-slate-600" />} onClick={() => {}} title="Bottom Align" />
);

export default BottomAlign;
