import React from 'react';
import { RefreshCw } from 'lucide-react';
import { RibbonButton } from '../../../shared';

const RefreshAll = () => (
    <RibbonButton variant="large" icon={<RefreshCw size={20} className="text-green-600" />} label="Refresh" subLabel="All" hasDropdown onClick={() => {}} />
);

export default RefreshAll;