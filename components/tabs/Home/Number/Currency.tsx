
import React from 'react';
import { DollarSign } from 'lucide-react';
import { RibbonButton, TabProps } from '../../shared';

interface CurrencyProps extends Pick<TabProps, 'currentStyle' | 'onToggleStyle'> {}

const Currency: React.FC<CurrencyProps> = ({ currentStyle, onToggleStyle }) => (
    <RibbonButton 
        variant="icon-only" 
        icon={<DollarSign size={14} className="text-emerald-600" />} 
        active={currentStyle.format === 'currency'}
        onClick={() => onToggleStyle('format', currentStyle.format === 'currency' ? 'general' : 'currency')} 
        title="Currency Format" 
    />
);

export default Currency;