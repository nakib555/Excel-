import React from 'react';
import { LayoutList } from 'lucide-react';
import { RibbonButton } from '../../../shared';

const ArrangeAll = () => (
    <RibbonButton variant="large" icon={<LayoutList size={20} className="text-slate-600" />} label="Arrange All" onClick={() => {}} />
);

export default ArrangeAll;