import React from 'react';
import { Printer } from 'lucide-react';
import { RibbonButton } from '../../shared';

const PrintArea = () => (
    <RibbonButton variant="large" icon={<Printer size={20} className="text-slate-700" />} label="Print" subLabel="Area" hasDropdown onClick={() => {}} />
);

export default PrintArea;