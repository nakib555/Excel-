import React from 'react';
import { Scissors } from 'lucide-react';
import { RibbonButton } from '../../shared';

const Breaks = () => (
    <RibbonButton variant="small" icon={<Scissors size={14} className="text-red-500" />} label="Breaks" onClick={() => {}} />
);

export default Breaks;