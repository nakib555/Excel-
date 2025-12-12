import React from 'react';
import { PenTool } from 'lucide-react';
import { RibbonButton } from '../../shared';

const RedPen = () => (
    <RibbonButton variant="large" icon={<PenTool size={20} color="#ef4444" fill="#ef4444" />} label="Red" hasDropdown onClick={() => {}} />
);

export default RedPen;