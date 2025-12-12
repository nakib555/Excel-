import React from 'react';
import { FileText } from 'lucide-react';
import { RibbonButton } from '../../../shared';

const Zoom100 = () => (
    <RibbonButton variant="large" icon={<FileText size={20} className="text-slate-600" />} label="100%" onClick={() => {}} />
);

export default Zoom100;