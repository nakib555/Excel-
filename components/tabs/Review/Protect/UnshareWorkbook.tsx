import React from 'react';
import { UserCheck } from 'lucide-react';
import { RibbonButton } from '../../../shared';

const UnshareWorkbook = () => (
    <RibbonButton variant="large" icon={<UserCheck size={20} className="text-slate-400" />} label="Unshare" subLabel="Workbook" disabled onClick={() => {}} />
);

export default UnshareWorkbook;