import React from 'react';
import { ArrowLeftFromLine } from 'lucide-react';
import { RibbonButton } from '../../../shared';

const TraceDependents = () => (
    <RibbonButton variant="small" icon={<ArrowLeftFromLine size={14} className="text-blue-500" />} label="Trace Dependents" onClick={() => {}} />
);

export default TraceDependents;