import React from 'react';
import { Group as GroupIcon } from 'lucide-react';
import { RibbonButton } from '../../shared';

const Group = () => (
    <RibbonButton variant="small" icon={<GroupIcon size={14} className="text-slate-600" />} label="Group" hasDropdown onClick={() => {}} />
);

export default Group;