import React from 'react';
import { Image } from 'lucide-react';
import { RibbonButton } from '../../shared';

const Background = () => (
    <RibbonButton variant="small" icon={<Image size={14} className="text-purple-500" />} label="Background" onClick={() => {}} />
);

export default Background;