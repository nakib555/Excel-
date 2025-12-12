import React from 'react';
import { TrendingUp } from 'lucide-react';
import { RibbonButton } from '../../shared';

const WinLoss = () => (
    <RibbonButton variant="small" icon={<TrendingUp size={14} className="text-orange-500" />} label="Win/Loss" onClick={() => {}} />
);

export default WinLoss;
