import React from 'react';
import { Accessibility } from 'lucide-react';
import { RibbonButton } from '../../../shared';

const CheckAccessibility = () => (
    <RibbonButton variant="large" icon={<Accessibility size={20} className="text-blue-500" />} label="Check" subLabel="Accessibility" hasDropdown onClick={() => {}} />
);

export default CheckAccessibility;