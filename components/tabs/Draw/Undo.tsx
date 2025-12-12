import React from 'react';
import { Undo as UndoIcon } from 'lucide-react';
import { RibbonButton } from '../../shared';

const Undo = () => (
    <RibbonButton variant="icon-only" icon={<UndoIcon size={14} className="text-blue-600" />} onClick={() => {}} title="Undo" />
);

export default Undo;