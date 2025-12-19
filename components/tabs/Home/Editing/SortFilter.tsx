
import React from 'react';
import { ArrowDownUp } from 'lucide-react';
import { RibbonButton } from '../../shared';

const SortFilter = () => (
    <RibbonButton variant="large" icon={<ArrowDownUp size={20} className="text-blue-600" />} label="Sort &" subLabel="Filter" onClick={() => {}} hasDropdown />
);

export default SortFilter;
