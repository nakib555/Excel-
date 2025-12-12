import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { RibbonButton } from '../../../shared';

const ErrorChecking = () => (
    <RibbonButton variant="small" icon={<ShieldAlert size={14} className="text-amber-500" />} label="Error Checking" hasDropdown onClick={() => {}} />
);

export default ErrorChecking;