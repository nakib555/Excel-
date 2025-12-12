import React from 'react';
import { Columns2 } from 'lucide-react';
import { RibbonButton } from '../../../shared';

const FreezePanes = () => (
    <RibbonButton variant="large" icon={<Columns2 size={20} className="text-blue-500" />} label="Freeze" subLabel="Panes" hasDropdown onClick={() => {}} />
);

export default FreezePanes;