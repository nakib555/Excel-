import React from 'react';
import { Map } from 'lucide-react';
import { RibbonButton } from '../../shared';

const Maps = () => (
    <RibbonButton variant="icon-only" icon={<Map size={14} className="text-green-500" />} hasDropdown onClick={() => {}} title="Maps" />
);

export default Maps;
