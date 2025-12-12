import React from 'react';
import { Plus } from 'lucide-react';
import { RibbonButton } from '../../shared';

interface InsertProps {
  onInsertRow?: () => void;
}

const Insert: React.FC<InsertProps> = ({ onInsertRow }) => (
    <RibbonButton variant="small" icon={<Plus size={14} className="text-emerald-600" />} label="Insert Row" onClick={onInsertRow || (() => {})} />
);

export default Insert;