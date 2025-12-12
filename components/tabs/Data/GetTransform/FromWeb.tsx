import React from 'react';
import { Globe } from 'lucide-react';
import { RibbonButton } from '../../../shared';

const FromWeb = () => (
    <RibbonButton variant="large" icon={<Globe size={20} className="text-blue-500" />} label="From" subLabel="Web" onClick={() => {}} />
);

export default FromWeb;