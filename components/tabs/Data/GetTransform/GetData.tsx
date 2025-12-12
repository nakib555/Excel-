import React from 'react';
import { Database } from 'lucide-react';
import { RibbonButton } from '../../../shared';

const GetData = () => (
    <RibbonButton variant="large" icon={<Database size={20} className="text-slate-600" />} label="Get" subLabel="Data" hasDropdown onClick={() => {}} />
);

export default GetData;