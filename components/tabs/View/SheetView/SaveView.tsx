import React from 'react';
import { Save } from 'lucide-react';
import { RibbonButton } from '../../../shared';

const SaveView = () => (
    <RibbonButton variant="icon-only" icon={<Save size={14} className="text-slate-400" />} disabled onClick={() => {}} title="Save View" />
);

export default SaveView;