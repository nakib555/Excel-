import React from 'react';
import { AlignVerticalJustifyCenter } from 'lucide-react';
import { RibbonButton } from '../../shared';

const MiddleAlign = () => (
    <RibbonButton variant="icon-only" icon={<AlignVerticalJustifyCenter size={14} className="text-slate-600" />} onClick={() => {}} title="Middle Align" />
);

export default MiddleAlign;
