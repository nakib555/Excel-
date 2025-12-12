import React from 'react';
import { Table } from 'lucide-react';
import { RibbonButton } from '../../../shared';

const FromTableRange = () => (
    <RibbonButton variant="large" icon={<Table size={20} className="text-emerald-600" />} label="From Table/" subLabel="Range" onClick={() => {}} />
);

export default FromTableRange;