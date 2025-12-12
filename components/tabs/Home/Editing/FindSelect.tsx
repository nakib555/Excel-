import React from 'react';
import { Search } from 'lucide-react';
import { RibbonButton } from '../../shared';

const FindSelect = () => (
    <RibbonButton variant="small" icon={<Search size={14} className="text-indigo-600" />} label="Find & Select" onClick={() => {}} hasDropdown />
);

export default FindSelect;
