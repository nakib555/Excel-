import React from 'react';
import { Tag } from 'lucide-react';
import { RibbonButton } from '../../../shared';

const NameManager = () => (
    <RibbonButton variant="large" icon={<Tag size={20} className="text-pink-500" />} label="Name" subLabel="Manager" onClick={() => {}} />
);

export default NameManager;