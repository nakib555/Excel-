
import React from 'react';
import { MoveLeft } from 'lucide-react';
import { RibbonButton, TabProps } from '../../shared';

interface IncreaseDecimalProps extends Pick<TabProps, 'currentStyle' | 'onToggleStyle'> {}

const IncreaseDecimal: React.FC<IncreaseDecimalProps> = ({ currentStyle, onToggleStyle }) => {
    const decimals = currentStyle.decimalPlaces ?? 2;
    return (
        <RibbonButton 
            variant="icon-only" 
            icon={<div className="flex items-center text-[9px]"><span className="text-blue-500">.0</span><MoveLeft size={8} /></div>} 
            onClick={() => onToggleStyle('decimalPlaces', decimals + 1)} 
            title="Increase Decimal" 
        />
    );
};

export default IncreaseDecimal;