import React from 'react';
import { AppWindow } from 'lucide-react';
import { RibbonButton } from '../../../shared';

const NewWindow = () => (
    <RibbonButton variant="large" icon={<AppWindow size={20} className="text-blue-500" />} label="New Window" onClick={() => {}} />
);

export default NewWindow;