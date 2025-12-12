import React from 'react';
import { FileCode } from 'lucide-react';
import { RibbonButton } from '../../../shared';

const UseInFormula = () => (
    <RibbonButton variant="small" icon={<FileCode size={14} className="text-slate-500" />} label="Use in Formula" hasDropdown onClick={() => {}} />
);

export default UseInFormula;