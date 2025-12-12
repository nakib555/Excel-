import React from 'react';
import { MoveLeft } from 'lucide-react';
import { RibbonButton } from '../../shared';

const DecreaseIndent = () => (
    <RibbonButton variant="icon-only" icon={<div className="flex -space-x-1 items-center text-slate-500"><MoveLeft size={10} /><div className="w-[1px] h-2.5 bg-slate-400"></div></div>} onClick={() => {}} title="Decrease Indent" />
);

export default DecreaseIndent;
