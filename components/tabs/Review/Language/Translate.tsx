import React from 'react';
import { Languages } from 'lucide-react';
import { RibbonButton } from '../../../shared';

const Translate = () => (
    <RibbonButton variant="large" icon={<Languages size={20} className="text-indigo-600" />} label="Translate" onClick={() => {}} />
);

export default Translate;