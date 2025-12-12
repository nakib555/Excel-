import React from 'react';
import { Highlighter } from 'lucide-react';
import { RibbonButton } from '../../shared';

const Highlight = () => (
    <RibbonButton variant="large" icon={<Highlighter size={20} className="text-yellow-400" />} label="Highlight" hasDropdown onClick={() => {}} />
);

export default Highlight;