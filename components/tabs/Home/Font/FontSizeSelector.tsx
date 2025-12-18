
import React, { memo, useState } from 'react';
import { TabProps, SmartDropdown } from '../../shared';

const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 36, 48, 72];

interface FontSizeSelectorProps extends Pick<TabProps, 'currentStyle' | 'onToggleStyle'> {}

const FontSizeSelector: React.FC<FontSizeSelectorProps> = ({ currentStyle, onToggleStyle }) => {
    const currentFontSize = currentStyle.fontSize || 13;
    const [open, setOpen] = useState(false);

    return (
        <SmartDropdown
            open={open}
            onToggle={() => setOpen(!open)}
            contentWidth="w-16"
            className="max-h-64 overflow-y-auto"
            triggerClassName="h-auto"
            trigger={
                <div className="w-12 h-7 bg-white border border-slate-300 hover:border-slate-400 rounded-md flex items-center justify-center text-xs text-slate-700 shadow-sm cursor-pointer group relative transition-colors">
                    <span>{currentFontSize}</span>
                </div>
            }
        >
            <div className="flex flex-col">
                {FONT_SIZES.map(s => (
                    <div 
                        key={s} 
                        onClick={() => {
                            onToggleStyle('fontSize', s);
                            setOpen(false);
                        }}
                        className={`px-2 py-1.5 hover:bg-primary-50 cursor-pointer text-center text-xs ${currentFontSize === s ? 'bg-primary-50 font-semibold text-primary-700' : 'text-slate-700'}`}
                    >
                        {s}
                    </div>
                ))}
            </div>
        </SmartDropdown>
    );
};

export default memo(FontSizeSelector);
