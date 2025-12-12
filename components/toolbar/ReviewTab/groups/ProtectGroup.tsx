import React from 'react';
import { Lock, UserCheck } from 'lucide-react';
import { RibbonGroup, RibbonButton, TabProps } from '../../shared';

const ProtectGroup: React.FC<TabProps> = () => {
  return (
    <RibbonGroup label="Protect">
        <div className="flex items-center gap-1 h-full">
            <RibbonButton variant="large" icon={<Lock size={20} className="text-amber-500" />} label="Protect" subLabel="Sheet" onClick={() => {}} />
            <RibbonButton variant="large" icon={<Lock size={20} className="text-amber-500" />} label="Protect" subLabel="Workbook" onClick={() => {}} />
            <RibbonButton variant="large" icon={<UserCheck size={20} className="text-blue-500" />} label="Allow Edit" subLabel="Ranges" onClick={() => {}} />
            <RibbonButton variant="large" icon={<UserCheck size={20} className="text-slate-400" />} label="Unshare" subLabel="Workbook" disabled onClick={() => {}} />
        </div>
    </RibbonGroup>
  );
};

export default ProtectGroup;