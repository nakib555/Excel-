import React from 'react';
import { TabProps } from '../../shared';

const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 36, 48, 72];

interface FontSizeSelectorProps extends Pick<TabProps, 'currentStyle' | 'onToggleStyle'> {}

const FontSizeSelector: React.FC<FontSizeSelectorProps> = ({ currentStyle, onToggleStyle }) => {
    const currentFontSize = currentStyle.fontSize || 13;
    return (
        <div className="w-12 h-7 bg-white border border-slate-300 hover:border-slate-400 rounded flex items-center justify-center text-xs text-slate-700 shadow-sm cursor-pointer group relative transition-colors">
            <span>{currentFontSize}</span>
            <div className="absolute top-full left-0 w-12 bg-white border border-slate-200 shadow-lg hidden group-hover:block z-50 max-h-48 overflow-y-auto rounded-md mt-1">
                {FONT_SIZES.map(s => (
                    <div 
                        key={s} 
                        onClick={() => onToggleStyle('fontSize', s)}
                        className="px-2 py-1.5 hover:bg-primary-50 cursor-pointer text-center"
                    >
                        {s}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FontSizeSelector;
