
import React from 'react';
import { Minimize2 } from 'lucide-react';
import { RibbonButton, TabProps } from '../../shared';

interface ShrinkToFitProps extends Pick<TabProps, 'currentStyle' | 'onToggleStyle'> {}

const ShrinkToFit: React.FC<ShrinkToFitProps> = ({ currentStyle, onToggleStyle }) => (
    <RibbonButton
        variant="icon-only"
        icon={<Minimize2 size={16} className={currentStyle.shrinkToFit ? "text-emerald-600" : "text-slate-600"} />}
        active={currentStyle.shrinkToFit}
        onClick={() => {
            // Shrink to fit usually disables wrap text in Excel logic
            if (!currentStyle.shrinkToFit) {
                onToggleStyle('wrapText', false);
            }
            onToggleStyle('shrinkToFit', !currentStyle.shrinkToFit);
        }}
        title="Shrink to Fit"
    />
);

export default ShrinkToFit;
