import React from 'react';
import { Layers } from 'lucide-react';
import { RibbonButton } from '../../shared';

const SelectionPane = () => (
    <RibbonButton variant="large" icon={<Layers size={20} className="text-blue-500" />} label="Selection" subLabel="Pane" onClick={() => {}} />
);

export default SelectionPane;