import React from 'react';
import { CheckSquare } from 'lucide-react';
import { RibbonButton } from '../../../shared';

const FlashFill = () => (
    <RibbonButton variant="small" icon={<CheckSquare size={14} className="text-violet-500" />} label="Flash Fill" onClick={() => {}} />
);

export default FlashFill;