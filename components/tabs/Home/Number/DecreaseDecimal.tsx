import React from 'react';
import { MoveRight } from 'lucide-react';
import { RibbonButton } from '../../shared';

const DecreaseDecimal = () => (
    <RibbonButton variant="icon-only" icon={<div className="flex items-center text-[9px]"><MoveRight size={8} /><span className="text-blue-500">.0</span></div>} onClick={() => {}} title="Decrease Decimal" />
);

export default DecreaseDecimal;
