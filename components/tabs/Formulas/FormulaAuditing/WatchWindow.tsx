import React from 'react';
import { Eye } from 'lucide-react';
import { RibbonButton } from '../../../shared';

const WatchWindow = () => (
    <RibbonButton variant="large" icon={<Eye size={20} className="text-teal-600" />} label="Watch" subLabel="Window" onClick={() => {}} />
);

export default WatchWindow;