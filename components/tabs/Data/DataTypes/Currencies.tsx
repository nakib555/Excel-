import React from 'react';
import { Coins } from 'lucide-react';
import { RibbonButton } from '../../../shared';

const Currencies = () => (
    <RibbonButton variant="large" icon={<Coins size={20} className="text-yellow-500" />} label="Currencies" onClick={() => {}} />
);

export default Currencies;