import React from 'react';
import { FunctionSquare } from 'lucide-react';
import { RibbonButton } from '../../../shared';

const InsertFunction = () => (
    <RibbonButton variant="large" icon={<FunctionSquare size={20} className="text-blue-600" />} label="Insert" subLabel="Function" onClick={() => {}} />
);

export default InsertFunction;