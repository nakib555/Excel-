import React from 'react';
import { Shapes } from 'lucide-react';
import { RibbonButton } from '../../shared';

const InkToShape = () => (
    <RibbonButton variant="large" icon={<Shapes size={20} className="text-indigo-500" />} label="Ink to" subLabel="Shape" onClick={() => {}} />
);

export default InkToShape;