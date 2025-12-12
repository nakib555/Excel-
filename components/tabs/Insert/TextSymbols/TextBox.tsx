import React from 'react';
import { BoxSelect } from 'lucide-react';
import { RibbonButton } from '../../shared';

const TextBox = () => (
    <RibbonButton variant="large" icon={<BoxSelect size={20} className="text-slate-600" />} label="Text" hasDropdown onClick={() => {}} />
);

export default TextBox;
