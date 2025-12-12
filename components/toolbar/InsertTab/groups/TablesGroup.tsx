import React from 'react';
import { Table2, TableProperties, Table, FormInput } from 'lucide-react';
import { RibbonGroup, RibbonButton, TabProps } from '../../shared';

const TablesGroup: React.FC<TabProps> = () => {
  return (
    <RibbonGroup label="Tables">
        <RibbonButton variant="large" icon={<Table2 size={20} className="text-emerald-600" />} label="PivotTable" hasDropdown onClick={() => {}} />
        <RibbonButton variant="large" icon={<TableProperties size={20} className="text-blue-600" />} label="Recommended" subLabel="Pivots" onClick={() => {}} />
        <RibbonButton variant="large" icon={<Table size={20} className="text-sky-600" />} label="Table" onClick={() => {}} />
        <RibbonButton variant="large" icon={<FormInput size={20} className="text-teal-600" />} label="Forms" hasDropdown onClick={() => {}} />
    </RibbonGroup>
  );
};

export default TablesGroup;