import React from 'react';
import { SpellCheck } from 'lucide-react';
import { RibbonButton } from '../../../shared';

const Spelling = () => (
    <RibbonButton variant="large" icon={<SpellCheck size={20} className="text-blue-600" />} label="Spelling" onClick={() => {}} title="Spelling (F7)" />
);

export default Spelling;