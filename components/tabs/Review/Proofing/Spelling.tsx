import React from 'react';
import { SpellCheck } from 'lucide-react';
import { RibbonButton } from '../../../shared';

const Spelling = () => (
    <RibbonButton variant="large" icon={<SpellCheck size={20} className="text-blue-600" />} label="Spelling" onClick={() => {}} />
);

export default Spelling;