
import React from 'react';
import { MoveRight } from 'lucide-react';
import { RibbonButton, TabProps } from '../../shared';

interface DecreaseDecimalProps extends Pick<TabProps, 'currentStyle' | 'onToggleStyle'> {}

const DecreaseDecimal: React.FC<DecreaseDecimalProps> = ({ currentStyle, onToggleStyle }) => {
    const decimals = currentStyle.decimalPlaces ?? 2;
    return (
        <RibbonButton 
            variant="icon-only" 
            icon={<div className="flex items-center text-[9px]"><MoveRight size={8} /><span className="text-blue-500">.0</span></div>} 
            onClick={() => onToggleStyle('decimalPlaces', Math.max(0, decimals - 1))} 
            title="Decrease Decimal" 
        />
    );
};

export default DecreaseDecimal;