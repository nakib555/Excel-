import React from 'react';
import { Undo, RotateCcw } from 'lucide-react';
import { RibbonGroup, RibbonButton, TabProps } from '../../shared';

const UndoGroup: React.FC<TabProps> = () => {
  return (
    <RibbonGroup label="Undo">
        <div className="flex flex-col gap-0 h-full justify-center">
            <RibbonButton variant="icon-only" icon={<Undo size={14} className="text-blue-600" />} onClick={() => {}} />
            <RibbonButton variant="icon-only" icon={<RotateCcw size={14} className="rotate-180 scale-x-[-1] text-blue-600" />} onClick={() => {}} />
        </div>
    </RibbonGroup>
  );
};

export default UndoGroup;