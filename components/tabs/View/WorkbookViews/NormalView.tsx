import React from 'react';
import { Grid } from 'lucide-react';
import { RibbonButton } from '../../../shared';

const NormalView = () => (
    <RibbonButton variant="large" icon={<Grid size={20} className="text-blue-600" />} label="Normal" onClick={() => {}} />
);

export default NormalView;