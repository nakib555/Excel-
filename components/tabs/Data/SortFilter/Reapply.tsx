import React from 'react';
import { RefreshCw } from 'lucide-react';
import { RibbonButton } from '../../../shared';

const Reapply = () => (
    <RibbonButton variant="small" icon={<RefreshCw size={14} className="text-green-600" />} label="Reapply" disabled onClick={() => {}} />
);

export default Reapply;