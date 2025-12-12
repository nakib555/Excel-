import React from 'react';
import { PenTool } from 'lucide-react';
import { RibbonButton } from '../../shared';

const GreenPen = () => (
    <RibbonButton variant="large" icon={<PenTool size={20} color="#059669" fill="#059669" />} label="Green" hasDropdown onClick={() => {}} />
);

export default GreenPen;