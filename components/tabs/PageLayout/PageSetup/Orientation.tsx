import React from 'react';
import { Smartphone } from 'lucide-react';
import { RibbonButton } from '../../shared';

const Orientation = () => (
    <RibbonButton variant="large" icon={<Smartphone size={20} className="rotate-90 text-slate-600" />} label="Orientation" hasDropdown onClick={() => {}} />
);

export default Orientation;