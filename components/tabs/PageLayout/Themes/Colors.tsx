import React from 'react';
import { Palette } from 'lucide-react';
import { RibbonButton } from '../../shared';

const Colors = () => (
    <RibbonButton variant="small" icon={<Palette size={14} className="text-purple-500" />} label="Colors" hasDropdown onClick={() => {}} />
);

export default Colors;