
import React from 'react';
import { Table2 } from 'lucide-react';
import { RibbonButton } from '../../shared';

const TableGen: React.FC<{ onToggleAI?: () => void }> = ({ onToggleAI }) => (
    <RibbonButton 
        variant="large" 
        icon={<Table2 size={20} className="text-purple-600" />} 
        label="Create" 
        subLabel="Table" 
        onClick={onToggleAI || (() => {})} 
    />
);

export default TableGen;
