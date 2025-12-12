import React from 'react';
import { Link2 } from 'lucide-react';
import { RibbonButton } from '../../../shared';

const EditLinks = () => (
    <RibbonButton variant="small" icon={<Link2 size={14} className="text-slate-500" />} label="Edit Links" disabled onClick={() => {}} />
);

export default EditLinks;