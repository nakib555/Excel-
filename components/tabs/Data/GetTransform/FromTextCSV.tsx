import React from 'react';
import { FileText } from 'lucide-react';
import { RibbonButton } from '../../../shared';

const FromTextCSV = () => (
    <RibbonButton variant="large" icon={<FileText size={20} className="text-slate-500" />} label="From Text/" subLabel="CSV" onClick={() => {}} />
);

export default FromTextCSV;