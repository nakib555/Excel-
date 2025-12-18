
import React, { useState, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { CellStyle } from '../../../types';
import ModernSelect from './ModernSelect';

interface NumberTabProps {
    style: CellStyle;
    onChange: (key: keyof CellStyle, val: any) => void;
    isMobile: boolean;
}

const NumberTab: React.FC<NumberTabProps> = ({ style, onChange, isMobile }) => {
    // Determine category from style
    const getCategory = () => {
        const f = style.format || 'general';
        if (f === 'shortDate' || f === 'longDate') return 'Date';
        if (f === 'comma') return 'Number';
        const map: Record<string, string> = {
            general: 'General', number: 'Number', currency: 'Currency', accounting: 'Accounting',
            time: 'Time', percent: 'Percentage', fraction: 'Fraction', scientific: 'Scientific',
            text: 'Text', custom: 'Custom'
        };
        return map[f] || 'Custom';
    };

    const [category, setCategory] = useState(getCategory());
    
    // Constants for categories
    const CATEGORIES = [
        'General', 'Number', 'Currency', 'Accounting', 'Date', 'Time', 
        'Percentage', 'Fraction', 'Scientific', 'Text', 'Special', 'Custom'
    ];

    // Update local state if external style changes
    useEffect(() => {
        const newCat = getCategory();
        if (newCat !== category && newCat !== 'Custom') { // Prevent loop if custom
             setCategory(newCat);
        }
    }, [style.format]);

    const handleCategorySelect = (newCat: string) => {
        setCategory(newCat);
        // Set defaults
        switch(newCat) {
            case 'General': onChange('format', 'general'); break;
            case 'Number': onChange('format', 'number'); break;
            case 'Currency': onChange('format', 'currency'); onChange('currencySymbol', '$'); break;
            case 'Accounting': onChange('format', 'accounting'); onChange('currencySymbol', '$'); break;
            case 'Date': onChange('format', 'shortDate'); break;
            case 'Time': onChange('format', 'time'); break;
            case 'Percentage': onChange('format', 'percent'); break;
            case 'Fraction': onChange('format', 'fraction'); break;
            case 'Scientific': onChange('format', 'scientific'); break;
            case 'Text': onChange('format', 'text'); break;
            default: onChange('format', 'custom'); break;
        }
    };

    const renderRightPane = () => {
        switch (category) {
            case 'General':
                return (
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 flex flex-col gap-2">
                        <span className="text-[13px] text-slate-700 leading-relaxed">
                            General format cells have no specific number format.
                        </span>
                    </div>
                );
            case 'Number':
                return (
                    <div className="flex flex-col gap-5">
                        <div className="flex items-center justify-between md:justify-start md:gap-8">
                            <span className="text-[13px] text-slate-600">Decimal places:</span>
                            <div className="flex items-center w-24 bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
                                <input 
                                    type="number" 
                                    value={style.decimalPlaces ?? 2} 
                                    onChange={(e) => onChange('decimalPlaces', Math.max(0, parseInt(e.target.value) || 0))}
                                    className="w-full h-8 px-3 text-[13px] bg-transparent outline-none text-slate-800 font-mono"
                                />
                                <div className="flex flex-col border-l border-slate-200">
                                    <button onClick={() => onChange('decimalPlaces', (style.decimalPlaces ?? 2) + 1)} className="h-4 w-6 flex items-center justify-center hover:bg-slate-200 text-slate-500">
                                        <ChevronDown size={10} className="rotate-180" />
                                    </button>
                                    <button onClick={() => onChange('decimalPlaces', Math.max(0, (style.decimalPlaces ?? 2) - 1))} className="h-4 w-6 flex items-center justify-center hover:bg-slate-200 text-slate-500">
                                        <ChevronDown size={10} />
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <label className="flex items-center gap-3 cursor-pointer select-none">
                            <div className="relative flex items-center">
                                <input type="checkbox" className="peer w-4 h-4 appearance-none rounded border border-slate-300 bg-white checked:bg-primary-600 checked:border-primary-600 focus:ring-2 focus:ring-primary-100 transition-all" />
                                <Check size={10} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" strokeWidth={4} />
                            </div>
                            <span className="text-[13px] text-slate-700">Use 1000 Separator (,)</span>
                        </label>

                        <div className="flex flex-col gap-2">
                            <span className="text-[13px] text-slate-600">Negative numbers:</span>
                            <div className="border border-slate-200 rounded-lg h-[120px] overflow-y-auto p-1 bg-white scrollbar-thin">
                                <div className="px-3 py-1.5 text-[13px] text-slate-800 hover:bg-primary-50 hover:text-primary-700 cursor-pointer rounded transition-colors">-1,234.10</div>
                                <div className="px-3 py-1.5 text-[13px] text-red-600 hover:bg-primary-50 cursor-pointer rounded transition-colors">1,234.10</div>
                                <div className="px-3 py-1.5 text-[13px] text-slate-800 hover:bg-primary-50 hover:text-primary-700 cursor-pointer rounded transition-colors">(-1,234.10)</div>
                                <div className="px-3 py-1.5 text-[13px] text-red-600 hover:bg-primary-50 cursor-pointer rounded transition-colors">(-1,234.10)</div>
                            </div>
                        </div>
                    </div>
                );
            case 'Currency':
            case 'Accounting':
                return (
                    <div className="flex flex-col gap-5">
                        <div className="flex items-center justify-between md:justify-start md:gap-8">
                            <span className="text-[13px] text-slate-600 w-24">Decimal places:</span>
                            <div className="flex items-center w-20 bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
                                <input 
                                    type="number" 
                                    value={style.decimalPlaces ?? 2} 
                                    onChange={(e) => onChange('decimalPlaces', Math.max(0, parseInt(e.target.value) || 0))}
                                    className="w-full h-8 px-2 text-[13px] bg-transparent outline-none text-slate-800 font-mono"
                                />
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-between md:justify-start md:gap-8">
                            <span className="text-[13px] text-slate-600 w-24">Symbol:</span>
                            <div className="w-48">
                                <ModernSelect 
                                    value={style.currencySymbol || '$'}
                                    options={[
                                        { value: 'None', label: 'None' },
                                        { value: '$', label: '$ English (USA)' },
                                        { value: '£', label: '£ English (UK)' },
                                        { value: '€', label: '€ Euro' },
                                        { value: '¥', label: '¥ Chinese (PRC)' },
                                    ]}
                                    onChange={(val) => onChange('currencySymbol', val === 'None' ? '' : val)}
                                />
                            </div>
                        </div>

                        {category === 'Currency' && (
                            <div className="flex flex-col gap-2 mt-2">
                                <span className="text-[13px] text-slate-600">Negative numbers:</span>
                                <div className="border border-slate-200 rounded-lg h-[100px] overflow-y-auto p-1 bg-white scrollbar-thin">
                                    <div className="px-3 py-1.5 text-[13px] text-slate-800 hover:bg-primary-50 cursor-pointer rounded flex justify-between"><span>-1,234.10</span></div>
                                    <div className="px-3 py-1.5 text-[13px] text-red-600 hover:bg-primary-50 cursor-pointer rounded flex justify-between"><span>1,234.10</span></div>
                                    <div className="px-3 py-1.5 text-[13px] text-slate-800 hover:bg-primary-50 cursor-pointer rounded flex justify-between"><span>(1,234.10)</span></div>
                                    <div className="px-3 py-1.5 text-[13px] text-red-600 hover:bg-primary-50 cursor-pointer rounded flex justify-between"><span>(1,234.10)</span></div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            case 'Date':
            case 'Time':
                return (
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <span className="text-[13px] text-slate-600">Type:</span>
                            <div className="border border-slate-200 rounded-lg h-[160px] overflow-y-auto p-1 bg-white scrollbar-thin">
                                {[
                                    { l: '3/14/2012', v: 'shortDate' },
                                    { l: 'Wednesday, March 14, 2012', v: 'longDate' },
                                    { l: '3/14', v: 'shortDate' },
                                    { l: '3/14/12 1:30 PM', v: 'custom' },
                                    { l: '13:30', v: 'time' },
                                    { l: '1:30:55 PM', v: 'time' },
                                ].map((opt, i) => (
                                    <div 
                                        key={i} 
                                        onClick={() => onChange('format', opt.v as any)}
                                        className={`
                                            px-3 py-2 text-[13px] cursor-pointer rounded transition-colors
                                            ${style.format === opt.v ? "bg-primary-600 text-white" : "text-slate-700 hover:bg-slate-50"}
                                        `}
                                    >
                                        {opt.l}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[13px] text-slate-600">Locale (location):</span>
                            <ModernSelect 
                                value="en-US" 
                                options={[{value: 'en-US', label: 'English (United States)'}, {value: 'en-UK', label: 'English (United Kingdom)'}]} 
                                onChange={() => {}} 
                            />
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 flex flex-col gap-2">
                        <span className="text-[13px] text-slate-700 leading-relaxed">
                            No additional settings for this format.
                        </span>
                    </div>
                );
        }
    }

    return (
        <div className={`flex h-full ${isMobile ? "flex-col gap-4" : "gap-6"}`}>
            {/* Category List */}
            <div className={`flex flex-col gap-2 ${isMobile ? "w-full" : "w-[160px]"}`}>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">Category</span>
                <div className={`bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex ${isMobile ? "flex-row overflow-x-auto no-scrollbar p-1" : "flex-col h-[320px] overflow-y-auto p-1 scrollbar-thin"}`}>
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => handleCategorySelect(cat)}
                            className={`
                                text-left px-4 py-2.5 text-[13px] transition-all rounded-lg flex-shrink-0 whitespace-nowrap
                                ${category === cat 
                                    ? "bg-primary-50 text-primary-700 font-semibold" 
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}
                            `}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Pane */}
            <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-1 pb-4">
                {/* Sample Preview */}
                <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Sample</span>
                    <div className="text-[15px] font-mono text-slate-800 font-medium truncate">
                        {category === 'Currency' || category === 'Accounting' ? `${style.currencySymbol || '$'}1,234.56` : '1234.56'}
                    </div>
                </div>

                {/* Dynamic Settings */}
                <div className="flex-1">
                    {renderRightPane()}
                </div>
            </div>
        </div>
    );
};

export default NumberTab;
