

import React from 'react';
import { Link2 } from 'lucide-react';
import { RibbonButton } from '../../shared';

interface LinkProps {
    onInsertLink?: () => void;
}

const Link: React.FC<LinkProps> = ({ onInsertLink }) => (
    <RibbonButton variant="large" icon={<Link2 size={20} className="text-blue-600" />} label="Link" hasDropdown onClick={onInsertLink || (() => {})} />
);

export default Link;