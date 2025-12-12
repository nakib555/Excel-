import React from 'react';
import { Search } from 'lucide-react';
import { RibbonButton } from '../../../shared';

const Zoom = () => (
    <RibbonButton variant="large" icon={<Search size={20} className="text-blue-500" />} label="Zoom" onClick={() => {}} />
);

export default Zoom;