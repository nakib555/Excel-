import React from 'react';
import { Clipboard } from 'lucide-react';
import { RibbonButton } from '../../shared';

const Paste = () => (
  <RibbonButton 
    variant="large" 
    icon={<Clipboard size={20} className="stroke-[1.75] text-blue-600" />} 
    label="Paste" 
    onClick={() => {}}
    title="Paste (Ctrl+V)"
    hasDropdown
  />
);

export default Paste;
