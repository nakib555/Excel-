import React from 'react';
import { Activity } from 'lucide-react';
import { RibbonButton } from '../../shared';

const Line = () => (
    <RibbonButton variant="small" icon={<Activity size={14} className="text-blue-500" />} label="Line" onClick={() => {}} />
);

export default Line;
