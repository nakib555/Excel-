
import React from 'react';
import { Scaling } from 'lucide-react';
import { RibbonButton, TabProps } from '../../shared';

interface ShrinkToFitProps extends Pick<TabProps, 'currentStyle' | 'onToggleStyle' | 'onAutoFitRowHeight' | 'onAutoFitColWidth'> {}

// Renamed internally to AutoFitContent but exported as ShrinkToFit to avoid file refactoring issues in parent
const ShrinkToFit: React.FC<ShrinkToFitProps> = ({ onAutoFitRowHeight, onAutoFitColWidth }) => (
    <RibbonButton
        variant="icon-only"
        icon={<Scaling size={16} className="text-slate-600" />}
        onClick={() => {
            if (onAutoFitColWidth) onAutoFitColWidth();
            // onAutoFitRowHeight can also be called if needed, but primary use is width
        }}
        title="Auto Fit Content"
    />
);

export default ShrinkToFit;
