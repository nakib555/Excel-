import React from 'react';
import { BoxSelect } from 'lucide-react';
import { RibbonButton } from '../../shared';

const Lasso = () => (
    <RibbonButton variant="large" icon={<BoxSelect size={20} className="stroke-dashed text-slate-700" />} label="Lasso" onClick={() => {}} />
);

export default Lasso;