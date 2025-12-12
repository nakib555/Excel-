import React from 'react';
import { Calendar } from 'lucide-react';
import { RibbonButton } from '../../../shared';

const DateTime = () => (
    <RibbonButton variant="large" icon={<Calendar size={18} className="text-red-500" />} label="Date &" subLabel="Time" hasDropdown onClick={() => {}} />
);

export default DateTime;