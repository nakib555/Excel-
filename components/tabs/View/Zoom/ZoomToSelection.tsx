import React from 'react';
import { ZoomIn } from 'lucide-react';
import { RibbonButton } from '../../../shared';

const ZoomToSelection = () => (
    <RibbonButton variant="large" icon={<ZoomIn size={20} className="text-blue-500" />} label="Zoom to" subLabel="Selection" onClick={() => {}} />
);

export default ZoomToSelection;