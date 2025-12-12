import React from 'react';
import { UserCheck } from 'lucide-react';
import { RibbonButton } from '../../../shared';

const AllowEditRanges = () => (
    <RibbonButton variant="large" icon={<UserCheck size={20} className="text-blue-500" />} label="Allow Edit" subLabel="Ranges" onClick={() => {}} />
);

export default AllowEditRanges;