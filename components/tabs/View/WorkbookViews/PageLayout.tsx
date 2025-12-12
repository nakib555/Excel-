import React from 'react';
import { FileSpreadsheet } from 'lucide-react';
import { RibbonButton } from '../../../shared';

const PageLayout = () => (
    <RibbonButton variant="large" icon={<FileSpreadsheet size={20} className="text-green-600" />} label="Page Layout" onClick={() => {}} />
);

export default PageLayout;