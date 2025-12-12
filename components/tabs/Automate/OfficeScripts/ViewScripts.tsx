import React from 'react';
import { List } from 'lucide-react';
import { RibbonButton } from '../../../shared';

const ViewScripts = () => (
    <RibbonButton variant="large" icon={<List size={20} className="text-slate-600" />} label="View" subLabel="Scripts" hasDropdown onClick={() => {}} />
);

export default ViewScripts;