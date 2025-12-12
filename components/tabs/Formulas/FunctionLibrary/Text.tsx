import React from 'react';
import { Type } from 'lucide-react';
import { RibbonButton } from '../../../shared';

const Text = () => (
    <RibbonButton variant="large" icon={<Type size={18} className="text-slate-600" />} label="Text" hasDropdown onClick={() => {}} />
);

export default Text;