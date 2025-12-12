import React from 'react';
import { Palette } from 'lucide-react';
import { RibbonButton } from '../../shared';

const CellStyles = () => (
    <RibbonButton variant="large" icon={<Palette size={20} className="text-purple-500" />} label="Cell" subLabel="Styles" onClick={() => {}} hasDropdown />
);

export default CellStyles;
