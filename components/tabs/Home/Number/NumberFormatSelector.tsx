
import React, { useState } from 'react';
import { ChevronDown, Calculator, Calendar, Clock, Percent, Type, Hash, Coins } from 'lucide-react';
import { SmartDropdown, TabProps } from '../../shared';
import { CellStyle } from '../../../types';

interface NumberFormatSelectorProps extends Pick<TabProps, 'currentStyle' | 'onToggleStyle' | 'onOpenFormatDialog'> {}

const FORMAT_OPTIONS: { id: CellStyle['format'], label: string, example: string, icon: React.ReactNode }[] = [
    { id: 'general', label: 'General', example: 'No specific format', icon: <Hash size={14} className="text-slate-400" /> },
    { id: 'number', label: 'Number', example: '1,234.10', icon: <span className="font-mono text-[10px] font-bold">123</span> },
    { id: 'currency', label: 'Currency', example: '$1,234.10', icon: <span className="font-mono text-[10px] font-bold">$</span> },
    { id: 'accounting', label: 'Accounting', example: '$ 1,234.10', icon: <Coins size={14} className="text-yellow-600" /> },
    { id: 'shortDate', label: 'Short Date', example: '9/23/2024', icon: <Calendar size={14} className="text-slate-400" /> },
    { id: 'longDate', label: 'Long Date', example: 'Monday, September 23...', icon: <Calendar size={14} className="text-slate-400" /> },
    { id: 'time', label: 'Time', example: '1:30:55 PM', icon: <Clock size={14} className="text-slate-400" /> },
    { id: 'percent', label: 'Percentage', example: '25.00%', icon: <Percent size={14} className="text-slate-400" /> },
    { id: 'fraction', label: 'Fraction', example: '1/4', icon: <span className="font-mono text-[10px] font-bold">½</span> },
    { id: 'scientific', label: 'Scientific', example: '1.23E+03', icon: <span className="font-mono text-[10px] font-bold">E+</span> },
    { id: 'text', label: 'Text', example: 'abc', icon: <Type size={14} className="text-slate-400" /> },
];

const NumberFormatSelector: React.FC<NumberFormatSelectorProps> = ({ currentStyle, onToggleStyle, onOpenFormatDialog }) => {
    const [open, setOpen] = useState(false);
    const currentFormat = currentStyle.format || 'general';
    const currentLabel = FORMAT_OPTIONS.find(f => f.id === currentFormat)?.label || 'General';

    const handleSelect = (formatId: CellStyle['format']) => {
        onToggleStyle('format', formatId);
        
        // Apply sensible defaults for number formats
        if (formatId === 'currency' || formatId === 'accounting') {
            onToggleStyle('decimalPlaces', 2);
            if (!currentStyle.currencySymbol) {
                onToggleStyle('currencySymbol', 'USD');
            }
        } else if (formatId === 'percent' || formatId === 'number' || formatId === 'scientific' || formatId === 'comma') {
            onToggleStyle('decimalPlaces', 2);
        }

        setOpen(false);
    };

    return (
        <SmartDropdown
            open={open}
            onToggle={() => setOpen(!open)}
            contentWidth="w-64"
            triggerClassName="h-auto"
            trigger={
                <div className="w-32 md:w-36 h-6 bg-white border border-slate-300 rounded-md flex items-center justify-between px-2 text-[11px] text-slate-700 shadow-sm cursor-pointer hover:border-slate-400 hover:bg-slate-50 transition-colors">
                    <span className="truncate">{currentLabel}</span>
                    <ChevronDown size={10} className="opacity-50 flex-shrink-0 ml-1" />
                </div>
            }
        >
            <div className="flex flex-col py-1 max-h-[350px] overflow-y-auto">
                 <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50 mb-1 border-b border-slate-100">
                    Number Format
                 </div>
                 {FORMAT_OPTIONS.map(opt => (
                     <div 
                        key={opt.id}
                        onClick={() => handleSelect(opt.id)}
                        className={`flex items-center gap-3 px-3 py-2 text-xs cursor-pointer transition-colors ${currentFormat === opt.id ? 'bg-primary-50 text-emerald-800' : 'text-slate-700 hover:bg-slate-100'}`}
                     >
                        <div className="w-5 flex justify-center opacity-70">{opt.icon}</div>
                        <div className="flex-1 flex flex-col">
                            <span className="font-medium">{opt.label}</span>
                            <span className="text-[10px] text-slate-400">{opt.example}</span>
                        </div>
                     </div>
                 ))}
                 <div className="border-t border-slate-100 mt-1 pt-1">
                     <div 
                        className="px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 cursor-pointer flex items-center gap-3"
                        onClick={() => { setOpen(false); onOpenFormatDialog?.(); }}
                     >
                        <Calculator size={14} className="text-slate-400" />
                        <span>More Number Formats...</span>
                     </div>
                 </div>
            </div>
        </SmartDropdown>
    );
};

export default NumberFormatSelector;
