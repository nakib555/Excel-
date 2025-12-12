import React from 'react';
import { PlusCircle } from 'lucide-react';
import { RibbonButton } from '../../shared';

const AddPen = () => (
    <RibbonButton variant="large" icon={<PlusCircle size={20} className="text-green-600" />} label="Add" hasDropdown onClick={() => {}} />
);

export default AddPen;