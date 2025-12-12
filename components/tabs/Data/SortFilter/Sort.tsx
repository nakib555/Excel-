import React from 'react';
import { ArrowDownUp } from 'lucide-react';
import { RibbonButton } from '../../../shared';

const Sort = () => (
    <RibbonButton variant="large" icon={<ArrowDownUp size={20} className="text-slate-700" />} label="Sort" onClick={() => {}} />
);

export default Sort;