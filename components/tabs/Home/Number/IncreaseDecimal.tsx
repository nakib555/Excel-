import React from 'react';
import { MoveLeft } from 'lucide-react';
import { RibbonButton } from '../../shared';

const IncreaseDecimal = () => (
    <RibbonButton variant="icon-only" icon={<div className="flex items-center text-[9px]"><span className="text-blue-500">.0</span><MoveLeft size={8} /></div>} onClick={() => {}} title="Increase Decimal" />
);

export default IncreaseDecimal;
