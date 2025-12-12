import React from 'react';
import { FormInput } from 'lucide-react';
import { RibbonButton } from '../../shared';

const Forms = () => (
    <RibbonButton variant="large" icon={<FormInput size={20} className="text-teal-600" />} label="Forms" hasDropdown onClick={() => {}} />
);

export default Forms;
