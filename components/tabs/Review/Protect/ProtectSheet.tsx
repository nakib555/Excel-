import React from 'react';
import { Lock } from 'lucide-react';
import { RibbonButton } from '../../../shared';

const ProtectSheet = () => (
    <RibbonButton variant="large" icon={<Lock size={20} className="text-amber-500" />} label="Protect" subLabel="Sheet" onClick={() => {}} title="Protect Sheet" />
);

export default ProtectSheet;