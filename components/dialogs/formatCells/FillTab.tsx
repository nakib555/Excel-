
import React, { useState } from 'react';
import { cn } from '../../../utils';
import { CellStyle } from '../../../types';
import GroupBox from './GroupBox';
import ModernSelect from './ModernSelect';

interface FillTabProps {
    style: CellStyle;
    onChange: (key: keyof CellStyle, val: any) => void;
    isMobile: boolean;
}

// Excel-like Theme Colors
const THEME_COLORS = [
    '#FFFFFF', '#000000', '#E7E6E6', '#44546A', '#5B9BD5', '#ED7D31', '#A5A5A5', '#FFC000', '#4472C4', '#70AD47',
    '#F2F2F2', '#7F7F7F', '#D0CECE', '#D6DCE4', '#DDEBF7', '#FCE4D6', '#EDEDED', '#FFF2CC', '#D9E1F2', '#E2EFDA',
    '#D9D9D9', '#595959', '#AEAAAA', '#ADB9CA', '#BDD7EE', '#F8CBAD', '#DBDBDB', '#FFE699', '#B4C6E7', '#C6E0B4',
    '#BFBFBF', '#404040', '#767171', '#8497B0', '#9BC2E6', '#F4B084', '#C9C9C9', '#FFD966', '#8EA9DB', '#A9D08E',
    '#A6A6A6', '#262626', '#3A3838', '#333F4F', '#2F75B5', '#C65911', '#7B7B7B', '#BF8F00', '#305496', '#548235',
    '#808080', '#0D0D0D', '#161616', '#222B35', '#1F4E78', '#833C0C', '#525252', '#806000', '#203764', '#375623'
];

const STANDARD_COLORS = [
    '#C00000', '#FF0000', '#FFC000', '#FFFF00', '#92D050', '#00B050', '#00B0F0', '#0070C0', '#002060', '#7030A0'
];

const PATTERN_STYLES = [
    { value: 'none', label: '' },
    { value: 'solid', label: 'Solid' },
    { value: '75_gray', label: '75% Gray' },
    { value: '50_gray', label: '50% Gray' },
    { value: '25_gray', label: '25% Gray' },
    { value: 'horiz_stripe', label: 'Horizontal Stripe' },
    { value: 'vert_stripe', label: 'Vertical Stripe' },
    { value: 'rev_diag_stripe', label: 'Reverse Diagonal Stripe' },
    { value: 'diag_stripe', label: 'Diagonal Stripe' },
    { value: 'diag_cross', label: 'Diagonal Crosshatch' },
    { value: 'thick_diag_cross', label: 'Thick Diagonal Crosshatch' },
    { value: 'thin_horiz_stripe', label: 'Thin Horizontal Stripe' },
    { value: 'thin_vert_stripe', label: 'Thin Vertical Stripe' },
    { value: 'thin_rev_diag_stripe', label: 'Thin Reverse Diagonal Stripe' },
    { value: 'thin_diag_stripe', label: 'Thin Diagonal Stripe' },
    { value: 'thin_horiz_cross', label: 'Thin Horizontal Crosshatch' },
    { value: 'thin_diag_cross', label: 'Thin Diagonal Crosshatch' },
];

const getPatternPreview = (style: string, color: string) => {
    // Simple CSS pattern approximations
    const c = color === 'automatic' ? '#000' : color;
    switch (style) {
        case 'solid': return { backgroundColor: c };
        case '75_gray': return { backgroundImage: `radial-gradient(${c} 1.5px, transparent 0)`, backgroundSize: '2px 2px' };
        case '50_gray': return { backgroundImage: `radial-gradient(${c} 1px, transparent 0)`, backgroundSize: '2px 2px' };
        case '25_gray': return { backgroundImage: `radial-gradient(${c} 1px, transparent 0)`, backgroundSize: '4px 4px' };
        case 'horiz_stripe': return { backgroundImage: `linear-gradient(0deg, ${c} 25%, transparent 25%, transparent 50%, ${c} 50%, ${c} 75%, transparent 75%, transparent)`, backgroundSize: '4px 4px' };
        case 'vert_stripe': return { backgroundImage: `linear-gradient(90deg, ${c} 25%, transparent 25%, transparent 50%, ${c} 50%, ${c} 75%, transparent 75%, transparent)`, backgroundSize: '4px 4px' };
        case 'rev_diag_stripe': return { backgroundImage: `repeating-linear-gradient(45deg, ${c}, ${c} 1px, transparent 1px, transparent 4px)` };
        case 'diag_stripe': return { backgroundImage: `repeating-linear-gradient(-45deg, ${c}, ${c} 1px, transparent 1px, transparent 4px)` };
        case 'diag_cross': return { backgroundImage: `linear-gradient(45deg, ${c} 25%, transparent 25%, transparent 75%, ${c} 75%, ${c}), linear-gradient(45deg, ${c} 25%, transparent 25%, transparent 75%, ${c} 75%, ${c})`, backgroundSize: '4px 4px' };
        // ... add more as needed, fallback to solid or none
        default: return {};
    }
};

const FillTab: React.FC<FillTabProps> = ({ style, onChange, isMobile }) => {
    const [patternColor, setPatternColor] = useState('automatic');
    const [patternStyle, setPatternStyle] = useState('none');

    const handleColorSelect = (c: string | undefined) => {
        onChange('bg', c);
    };

    const currentBg = style.bg;

    // Helper to render color options in ModernSelect
    const renderColorOption = (option: any) => (
        <div className="flex items-center gap-2">
            <div 
                className="w-4 h-4 rounded-[2px] shadow-sm border border-slate-200" 
                style={{ backgroundColor: option.value === 'automatic' ? '#000' : option.value }} 
            />
            <span className="font-mono text-xs capitalize">{option.label}</span>
        </div>
    );

    // Helper to render pattern options in ModernSelect
    const renderPatternOption = (option: any) => (
        <div className="flex items-center gap-2 w-full">
            <div className="w-8 h-4 border border-slate-200 bg-white relative overflow-hidden">
                <div className="absolute inset-0" style={getPatternPreview(option.value, '#000')} />
            </div>
            <span className="text-xs">{option.label || 'None'}</span>
        </div>
    );

    return (
        <div className={cn("grid h-full", isMobile ? "grid-cols-1 gap-6 pb-20" : "grid-cols-[1.8fr_1.2fr] gap-8")}>
            
            {/* Left Column: Background Color */}
            <div className="flex flex-col gap-4">
                <GroupBox label="Background Color" className="flex flex-col gap-4 h-full">
                    
                    {/* No Color Button */}
                    <button 
                        onClick={() => handleColorSelect(undefined)}
                        className={cn(
                            "w-full py-2 px-4 rounded-lg border border-slate-200 flex items-center justify-center gap-2 transition-all hover:bg-slate-50",
                            !currentBg && "bg-slate-100 ring-2 ring-primary-500/20 border-primary-500"
                        )}
                    >
                        <div className="w-6 h-6 border border-slate-300 bg-white relative rounded-md overflow-hidden">
                             {/* Red diagonal line to indicate 'no color' */}
                             {/* Using CSS logic for 'no fill' icon look */}
                        </div>
                        <span className="text-[13px] font-semibold text-slate-700">No Color</span>
                    </button>

                    <div className="flex-1 flex flex-col gap-4">
                        {/* Theme Colors Grid */}
                        <div className="flex flex-col gap-1">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">Theme Colors</span>
                            <div className="grid grid-cols-10 gap-1 p-1">
                                {THEME_COLORS.map((c, i) => (
                                    <button
                                        key={`${c}-${i}`}
                                        className={cn(
                                            "aspect-square rounded-[2px] border border-transparent hover:border-slate-400 hover:scale-110 transition-transform relative z-0 hover:z-10",
                                            currentBg === c && "ring-2 ring-primary-500 ring-offset-1 z-10"
                                        )}
                                        style={{ backgroundColor: c }}
                                        onClick={() => handleColorSelect(c)}
                                        title={c}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Standard Colors Grid */}
                        <div className="flex flex-col gap-1">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">Standard Colors</span>
                            <div className="grid grid-cols-10 gap-1 p-1">
                                {STANDARD_COLORS.map((c, i) => (
                                    <button
                                        key={`${c}-${i}`}
                                        className={cn(
                                            "aspect-square rounded-[2px] border border-transparent hover:border-slate-400 hover:scale-110 transition-transform relative z-0 hover:z-10",
                                            currentBg === c && "ring-2 ring-primary-500 ring-offset-1 z-10"
                                        )}
                                        style={{ backgroundColor: c }}
                                        onClick={() => handleColorSelect(c)}
                                        title={c}
                                    />
                                ))}
                            </div>
                        </div>
                        
                        <div className="mt-auto pt-2">
                             <button className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-[12px] font-semibold text-slate-600 rounded-lg transition-colors border border-slate-200">
                                 More Colors...
                             </button>
                        </div>
                    </div>
                </GroupBox>
            </div>

            {/* Right Column: Pattern & Sample */}
            <div className="flex flex-col gap-4">
                
                {/* Pattern Color & Style */}
                <GroupBox label="Pattern Color" className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">Pattern Color</span>
                        <ModernSelect 
                            value={patternColor}
                            onChange={setPatternColor}
                            options={[
                                { value: 'automatic', label: 'Automatic' },
                                ...THEME_COLORS.slice(0, 10).map(c => ({ value: c, label: c }))
                            ]}
                            renderOption={renderColorOption}
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">Pattern Style</span>
                        <ModernSelect 
                            value={patternStyle}
                            onChange={setPatternStyle}
                            options={PATTERN_STYLES}
                            renderOption={renderPatternOption}
                            className="max-h-48"
                        />
                    </div>
                </GroupBox>

                {/* Fill Effects */}
                <button className="w-full py-2.5 bg-gradient-to-b from-white to-slate-50 hover:from-slate-50 hover:to-slate-100 text-[13px] font-semibold text-slate-700 rounded-xl transition-all border border-slate-200 shadow-sm">
                    Fill Effects...
                </button>

                {/* Sample Preview */}
                <GroupBox label="Sample" className="flex-1 min-h-[140px] flex flex-col">
                    <div className="flex-1 border border-slate-300 rounded-lg relative overflow-hidden bg-white shadow-inner m-1">
                        {/* Background Color Layer */}
                        <div 
                            className="absolute inset-0 transition-colors duration-200"
                            style={{ backgroundColor: currentBg || 'transparent' }}
                        />
                        
                        {/* Pattern Layer */}
                        {patternStyle !== 'none' && (
                            <div 
                                className="absolute inset-0 opacity-100 mix-blend-multiply"
                                style={getPatternPreview(patternStyle, patternColor === 'automatic' ? '#000' : patternColor)}
                            />
                        )}

                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="text-slate-900/40 font-bold text-lg select-none mix-blend-hard-light">Sample</span>
                        </div>
                    </div>
                    <div className="mt-3 text-center">
                        <span className="text-[10px] text-slate-400">
                            {currentBg ? "Solid color fill" : "No Background Color"} 
                            {patternStyle !== 'none' ? ` with ${PATTERN_STYLES.find(p => p.value === patternStyle)?.label}` : ""}
                        </span>
                    </div>
                </GroupBox>
            </div>
        </div>
    );
};

export default FillTab;
