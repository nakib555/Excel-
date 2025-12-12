import React from 'react';
import { Filter as FilterIcon } from 'lucide-react';
import { RibbonButton } from '../../../shared';

const Filter = () => (
    <RibbonButton variant="large" icon={<FilterIcon size={20} className="text-blue-600" />} label="Filter" onClick={() => {}} />
);

export default Filter;