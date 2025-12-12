import React from 'react';
import { Columns } from 'lucide-react';
import { RibbonButton } from '../../shared';

const PrintTitles = () => (
    <RibbonButton variant="small" icon={<Columns size={14} className="text-slate-500" />} label="Print Titles" onClick={() => {}} />
);

export default PrintTitles;