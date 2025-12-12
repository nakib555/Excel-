import React from 'react';
import { Table as TableIcon } from 'lucide-react';
import { RibbonButton } from '../../shared';

const Table = () => (
    <RibbonButton variant="large" icon={<TableIcon size={20} className="text-sky-600" />} label="Table" onClick={() => {}} />
);

export default Table;
