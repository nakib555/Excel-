import React, { useState } from 'react';
import { DollarSign, ChevronDown } from 'lucide-react';
import { RibbonButton, SmartDropdown, TabProps } from '../../shared';

interface CurrencyProps extends Pick<TabProps, 'currentStyle' | 'onToggleStyle' | 'onOpenFormatDialog'> {}

const CURRENCY_OPTIONS = [
    { code: 'USD', symbol: '$', label: 'English (United States)' },
    { code: 'GBP', symbol: '£', label: 'English (United Kingdom)' },
    { code: 'EUR', symbol: '€', label: 'Euro' },
    { code: 'CNY', symbol: '¥', label: 'Chinese (Simplified, China)' },
    { code: 'CHF', symbol: 'fr.', label: 'French (Switzerland)' },
];

const Currency: React.FC<CurrencyProps> = ({ currentStyle, onToggleStyle, onOpenFormatDialog }) => {
    const [open, setOpen] = useState(false);

    const handleSelect = (code: string) => {
        onToggleStyle('format', 'accounting');
        onToggleStyle('currencySymbol', code);
        setOpen(false);
    };

    const handleMainClick = () => {
        // Toggle Accounting format with current/default symbol
        if (currentStyle.format === 'accounting') {
            onToggleStyle('format', 'general');
        } else {
            onToggleStyle('format', 'accounting');
            if (!currentStyle.currencySymbol) {
                onToggleStyle('currencySymbol', 'USD');
            }
        }
    };

    return (
        <div className="flex items-center gap-0">
            {/* Split Button: Main Action */}
            <RibbonButton 
                variant="icon-only" 
                icon={<DollarSign size={14} className="text-slate-600" />} 
                active={currentStyle.format === 'accounting'}
                onClick={handleMainClick}
                title="Accounting Number Format" 
                className="w-5 px-0 rounded-r-none border-r border-transparent hover:border-slate-300"
            />
            
            {/* Split Button: Dropdown */}
            <SmartDropdown
                open={open}
                onToggle={() => setOpen(!open)}
                contentWidth="w-56"
                trigger={
                    <button 
                        onClick={() => setOpen(!open)}
                        className={`h-6 w-3 flex items-center justify-center rounded-r-[3px] hover:bg-slate-200 transition-colors ${open ? 'bg-slate-200' : ''}`}
                    >
                        <ChevronDown size={8} className="text-slate-600" />
                    </button>
                }
            >
                <div className="flex flex-col py-1">
                     <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase bg-slate-50 mb-1">
                        Accounting Formats
                     </div>
                     {CURRENCY_OPTIONS.map(opt => (
                         <button
                            key={opt.code}
                            onClick={() => handleSelect(opt.code)}
                            className="flex items-center justify-between px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 text-left transition-colors w-full"
                         >
                            <span className="flex items-center gap-2">
                                <span className="font-mono font-bold w-4 text-center">{opt.symbol}</span>
                                <span>{opt.label}</span>
                            </span>
                         </button>
                     ))}
                     <div className="border-t border-slate-100 mt-1 pt-1">
                         <button 
                            className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100"
                            onClick={() => { setOpen(false); onOpenFormatDialog?.(); }}
                         >
                             More Accounting Formats...
                         </button>
                     </div>
                </div>
            </SmartDropdown>
        </div>
    );
};

export default Currency;