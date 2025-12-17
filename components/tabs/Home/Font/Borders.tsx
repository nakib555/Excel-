
import React from 'react';
import { Grid3X3 } from 'lucide-react';
import { RibbonButton } from '../../shared';

const Borders = () => (
    <RibbonButton 
        variant="icon-only" 
        icon={<Grid3X3 size={14} className="opacity-70 text-slate-600" />} 
        onClick={() => {}} 
        hasDropdown 
        title="Borders" 
    />
);

export default Borders;
