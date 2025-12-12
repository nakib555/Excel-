import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { RibbonButton } from '../../../shared';

const PrevComment = () => (
    <RibbonButton variant="small" icon={<ChevronLeft size={14} className="text-slate-400" />} label="Previous Comment" disabled onClick={() => {}} />
);

export default PrevComment;