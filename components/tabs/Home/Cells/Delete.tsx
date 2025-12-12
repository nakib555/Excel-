import React from 'react';
import { X } from 'lucide-react';
import { RibbonButton } from '../../shared';

interface DeleteProps {
  onDeleteRow?: () => void;
}

const Delete: React.FC<DeleteProps> = ({ onDeleteRow }) => (
    <RibbonButton variant="small" icon={<X size={14} className="text-rose-600" />} label="Delete Row" onClick={onDeleteRow || (() => {})} />
);

export default Delete;