import React from 'react';
import { Table2 } from 'lucide-react';
import { RibbonButton } from '../../shared';

const PivotTable = () => (
    <RibbonButton variant="large" icon={<Table2 size={20} className="text-emerald-600" />} label="PivotTable" hasDropdown onClick={() => {}} />
);

export default PivotTable;
