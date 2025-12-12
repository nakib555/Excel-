import React from 'react';
import { Grid3X3 } from 'lucide-react';
import { RibbonButton } from '../../../shared';

const CreateFromSelection = () => (
    <RibbonButton variant="small" icon={<Grid3X3 size={14} className="text-slate-500" />} label="Create from Selection" onClick={() => {}} />
);

export default CreateFromSelection;