import React from 'react';
import { Table } from 'lucide-react';
import { RibbonButton } from '../../shared';

const FormatAsTable = () => (
    <RibbonButton variant="large" icon={<Table size={20} className="text-amber-500" />} label="Format as" subLabel="Table" onClick={() => {}} hasDropdown />
);

export default FormatAsTable;
