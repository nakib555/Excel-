import React from 'react';
import { Layout } from 'lucide-react';
import { RibbonButton } from '../../shared';

const Themes = () => (
    <RibbonButton variant="large" icon={<Layout size={20} className="text-indigo-600" />} label="Themes" hasDropdown onClick={() => {}} />
);

export default Themes;