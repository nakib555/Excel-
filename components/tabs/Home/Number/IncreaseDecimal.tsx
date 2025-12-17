
import React from 'react';
import { MoveLeft } from 'lucide-react';
import { RibbonButton, TabProps } from '../../shared';

interface IncreaseDecimalProps extends Pick<TabProps, 'currentStyle' | 'onToggleStyle'> {}

const IncreaseDecimal: React.FC<IncreaseDecimalProps> = ({ currentStyle, onToggleStyle }) => {
    const decimals = currentStyle.decimalPlaces ?? 2;
    return (
        <RibbonButton 
            variant="icon-only" 
            icon={<div className="flex items-center text-[10px] text-slate-600"><span className="text-blue-500 font-bold mr-0.5">.00</span><MoveLeft size={10} /></div>} 
            onClick={() => {
                onToggleStyle('decimalPlaces', decimals + 1);
                // If format is general, switch to number so decimals show up
                if (!currentStyle.format || currentStyle.format === 'general') {
                    onToggleStyle('format', 'number');
                }
            }} 
            title="Increase Decimal" 
        />
    );
};

export default IncreaseDecimal;
