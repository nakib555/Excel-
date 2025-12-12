import React from 'react';
import { Search } from 'lucide-react';
import { RibbonButton } from '../../../shared';

const LookupRef = () => (
    <RibbonButton variant="large" icon={<Search size={18} className="text-blue-500" />} label="Lookup &" subLabel="Ref" hasDropdown onClick={() => {}} />
);

export default LookupRef;