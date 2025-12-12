import React from 'react';
import { FileSpreadsheet } from 'lucide-react';
import { RibbonButton } from '../../../shared';

const CalculateSheet = () => (
    <RibbonButton variant="small" icon={<FileSpreadsheet size={14} className="text-green-600" />} label="Calculate Sheet" onClick={() => {}} />
);

export default CalculateSheet;