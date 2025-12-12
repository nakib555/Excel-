import React from 'react';
import { Columns } from 'lucide-react';
import { RibbonButton } from '../../../shared';

const TextToColumns = () => (
    <RibbonButton variant="large" icon={<Columns size={20} className="text-blue-500" />} label="Text to" subLabel="Columns" onClick={() => {}} />
);

export default TextToColumns;