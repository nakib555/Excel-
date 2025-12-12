import React from 'react';
import { ScrollText } from 'lucide-react';
import { RibbonButton } from '../../../shared';

const NewScript = () => (
    <RibbonButton variant="large" icon={<ScrollText size={20} className="text-blue-600" />} label="New" subLabel="Script" hasDropdown onClick={() => {}} />
);

export default NewScript;