import React from 'react';
import { Layout } from 'lucide-react';
import { RibbonButton } from '../../../shared';

const PageBreakPreview = () => (
    <RibbonButton variant="large" icon={<Layout size={20} className="text-orange-500" />} label="Page Break" subLabel="Preview" onClick={() => {}} />
);

export default PageBreakPreview;