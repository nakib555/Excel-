import React from 'react';
import { Eraser as EraserIcon } from 'lucide-react';
import { RibbonButton } from '../../shared';

const Eraser = () => (
    <RibbonButton variant="large" icon={<EraserIcon size={20} className="text-pink-500" />} label="Eraser" hasDropdown onClick={() => {}} />
);

export default Eraser;