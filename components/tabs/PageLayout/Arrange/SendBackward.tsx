import React from 'react';
import { SendToBack } from 'lucide-react';
import { RibbonButton } from '../../shared';

const SendBackward = () => (
    <RibbonButton variant="small" icon={<SendToBack size={14} className="text-orange-600" />} label="Send Backward" hasDropdown onClick={() => {}} />
);

export default SendBackward;