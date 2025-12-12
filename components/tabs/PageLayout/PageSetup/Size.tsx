import React from 'react';
import { File } from 'lucide-react';
import { RibbonButton } from '../../shared';

const Size = () => (
    <RibbonButton variant="large" icon={<File size={20} className="text-slate-600" />} label="Size" hasDropdown onClick={() => {}} />
);

export default Size;