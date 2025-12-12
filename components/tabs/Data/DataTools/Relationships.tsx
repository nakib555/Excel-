import React from 'react';
import { Link2 } from 'lucide-react';
import { RibbonButton } from '../../../shared';

const Relationships = () => (
    <RibbonButton variant="small" icon={<Link2 size={14} className="text-slate-400" />} label="Relationships" disabled onClick={() => {}} />
);

export default Relationships;