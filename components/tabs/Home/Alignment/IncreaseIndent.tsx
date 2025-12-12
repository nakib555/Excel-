import React from 'react';
import { MoveRight } from 'lucide-react';
import { RibbonButton } from '../../shared';

const IncreaseIndent = () => (
    <RibbonButton variant="icon-only" icon={<div className="flex -space-x-1 items-center text-slate-500"><div className="w-[1px] h-2.5 bg-slate-400"></div><MoveRight size={10} /></div>} onClick={() => {}} title="Increase Indent" />
);

export default IncreaseIndent;
