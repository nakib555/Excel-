import React from 'react';
import { WrapText as WrapTextIcon } from 'lucide-react';
import { TabProps } from '../../shared';

interface WrapTextProps extends Pick<TabProps, 'currentStyle' | 'onToggleStyle'> {}

const WrapText: React.FC<WrapTextProps> = ({ currentStyle, onToggleStyle }) => (
    <button 
        className={`flex items-center gap-2 px-2 py-0.5 rounded text-[11px] font-medium w-full text-left transition-colors h-7 ${
            currentStyle.wrapText ? 'bg-primary-50 text-primary-700' : 'hover:bg-slate-100 text-slate-700'
        }`}
        onClick={() => onToggleStyle('wrapText', !currentStyle.wrapText)}
    >
        <WrapTextIcon size={16} className={currentStyle.wrapText ? "text-primary-600" : "text-blue-500"} />
        <span>Wrap Text</span>
    </button>
);

export default WrapText;