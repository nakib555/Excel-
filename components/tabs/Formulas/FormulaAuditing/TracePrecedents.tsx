import React from 'react';
import { ArrowRightFromLine } from 'lucide-react';
import { RibbonButton } from '../../../shared';

const TracePrecedents = () => (
    <RibbonButton variant="small" icon={<ArrowRightFromLine size={14} className="text-blue-500" />} label="Trace Precedents" onClick={() => {}} />
);

export default TracePrecedents;