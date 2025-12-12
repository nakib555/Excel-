import React from 'react';
import { LayoutList } from 'lucide-react';
import { RibbonButton } from '../../shared';

const ConditionalFormatting = () => (
    <RibbonButton variant="large" icon={<LayoutList size={20} className="text-pink-500" />} label="Conditional" subLabel="Formatting" onClick={() => {}} hasDropdown />
);

export default ConditionalFormatting;
