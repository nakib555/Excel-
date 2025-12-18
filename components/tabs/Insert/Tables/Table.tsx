

import React from 'react';
import { Table as TableIcon } from 'lucide-react';
import { RibbonButton } from '../../shared';

interface TableProps {
    onInsertTable?: () => void;
}

const Table: React.FC<TableProps> = ({ onInsertTable }) => (
    <RibbonButton variant="large" icon={<TableIcon size={20} className="text-sky-600" />} label="Table" onClick={onInsertTable || (() => {})} />
);

export default Table;