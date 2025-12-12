import React from 'react';
import { ArrowUpDown } from 'lucide-react';
import { RibbonButton } from '../../shared';

const SortFilter = () => (
    <RibbonButton variant="small" icon={<ArrowUpDown size={14} className="text-blue-600" />} label="Sort & Filter" onClick={() => {}} hasDropdown />
);

export default SortFilter;
