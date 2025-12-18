

import React from 'react';
import { CheckSquare } from 'lucide-react';
import { RibbonButton } from '../../shared';

interface CheckboxProps {
    onInsertCheckbox?: () => void;
}

const Checkbox: React.FC<CheckboxProps> = ({ onInsertCheckbox }) => (
    <RibbonButton variant="large" icon={<CheckSquare size={20} className="text-emerald-600" />} label="Checkbox" onClick={onInsertCheckbox || (() => {})} />
);

export default Checkbox;