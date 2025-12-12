import React from 'react';
import { Sparkles } from 'lucide-react';
import { RibbonButton } from '../../shared';

const Effects = () => (
    <RibbonButton variant="small" icon={<Sparkles size={14} className="text-orange-500" />} label="Effects" hasDropdown onClick={() => {}} />
);

export default Effects;