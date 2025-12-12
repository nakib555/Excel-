import React from 'react';
import { ChevronRight } from 'lucide-react';
import { RibbonButton } from '../../../shared';

const NextComment = () => (
    <RibbonButton variant="small" icon={<ChevronRight size={14} className="text-slate-400" />} label="Next Comment" disabled onClick={() => {}} />
);

export default NextComment;