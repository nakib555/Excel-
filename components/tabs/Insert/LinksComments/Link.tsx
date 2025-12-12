import React from 'react';
import { Link2 } from 'lucide-react';
import { RibbonButton } from '../../shared';

const Link = () => (
    <RibbonButton variant="large" icon={<Link2 size={20} className="text-blue-600" />} label="Link" hasDropdown onClick={() => {}} />
);

export default Link;
