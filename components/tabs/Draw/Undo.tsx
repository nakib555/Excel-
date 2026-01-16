
import React from 'react';
import { Undo as UndoIcon } from 'lucide-react';
import { RibbonButton } from '../../shared';

interface UndoProps {
    onUndo?: () => void;
}

const Undo: React.FC<UndoProps> = ({ onUndo }) => (
    <RibbonButton variant="icon-only" icon={<UndoIcon size={14} className="text-blue-600" />} onClick={onUndo || (() => {})} title="Undo" />
);

export default Undo;