import React from 'react';
import { RotateCcw } from 'lucide-react';
import { RibbonButton } from '../../shared';

const Redo = () => (
    <RibbonButton variant="icon-only" icon={<RotateCcw size={14} className="rotate-180 scale-x-[-1] text-blue-600" />} onClick={() => {}} title="Redo" />
);

export default Redo;