
import React, { useState, useMemo } from 'react';
import { cn } from '../../../utils';
import { CellStyle } from '../../../types';
import GroupBox from './GroupBox';
import ModernSelect from './ModernSelect';
import { Ban, PaintBucket, Palette } from 'lucide-react';

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
    { value: 'none', label: 'Solid' },
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
    const c = color === 'automatic' ? '#000000' : color;
    switch (style) {
        case 'none': return {}; // Solid fill (no pattern overlay)
        case 'solid': return { backgroundColor: c };
        case '75_gray': return { backgroundImage: `radial-gradient(${c} 1.5px, transparent 0)`, backgroundSize: '2px 2px' };
        case '50_gray': return { backgroundImage: `radial-gradient(${c} 1px, transparent 0)`, backgroundSize: '2px 2px' };
        case '25_gray': return { backgroundImage: `radial-gradient(${c} 1px, transparent 0)`, backgroundSize: '4px 4px' };
        case 'horiz_stripe': return { backgroundImage: `linear-gradient(0deg, ${c} 25%, transparent 25%, transparent 50%, ${c} 50%, ${c} 75%, transparent 75%, transparent)`, backgroundSize: '4px 4px' };
        case 'vert_stripe': return { backgroundImage: `linear-gradient(90deg, ${c} 25%, transparent 25%, transparent 50%, ${c} 50%, ${c} 75%, transparent 75%, transparent)`, backgroundSize: '4px 4px' };
        case 'rev_diag_stripe': return { backgroundImage: `repeating-linear-gradient(45deg, ${c}, ${c} 1px, transparent 1px, transparent 4px)` };
        case 'diag_stripe': return { backgroundImage: `repeating-linear-gradient(-45deg, ${c}, ${c} 1px, transparent 1px, transparent 4px)` };
        case 'diag_cross': return { backgroundImage: `linear-gradient(45deg, ${c} 25%, transparent 25%, transparent 75%, ${c} 75%, ${c}), linear-gradient(-45deg, ${c} 25%, transparent 25%, transparent 75%, ${c} 75%, ${c})`, backgroundSize: '4px 4px' };
        case 'thick_diag_cross': return { backgroundImage: `linear-gradient(45deg, ${c} 35%, transparent 35%, transparent 65%, ${c} 65%, ${c}), linear-gradient(-45deg, ${c} 35%, transparent 35%, transparent 65%, ${c} 65%, ${c})`, backgroundSize: '6px 6px' };
        case 'thin_horiz_stripe': return { backgroundImage: `linear-gradient(0deg, ${c} 1px, transparent 1px)`, backgroundSize: '100% 3px' };
        case 'thin_vert_stripe': return { backgroundImage: `linear-gradient(90deg, ${c} 1px, transparent 1px)`, backgroundSize: '3px 100%' };
        case 'thin_rev_diag_stripe': return { backgroundImage: `repeating-linear-gradient(45deg, ${c}, ${c} 0.5px, transparent 0.5px, transparent 4px)` };
        case 'thin_diag_stripe': return { backgroundImage: `repeating-linear-gradient(-45deg, ${c}, ${c} 0.5px, transparent 0.5px, transparent 4px)` };
        case 'thin_horiz_cross': return { backgroundImage: `linear-gradient(${c} 1px, transparent 1px), linear-gradient(90deg, ${c} 1px, transparent 1px)`, backgroundSize: '4px 4px' };
        case 'thin_diag_cross': return { backgroundImage: `linear-gradient(45deg, ${c} 0.5px, transparent 0.5px), linear-gradient(-45deg, ${c} 0.5px, transparent 0.5px)`, backgroundSize: '6px 6px' };
        default: return {};
    }
};

const FillTab: React.FC<FillTabProps> = ({ style, onChange, isMobile }) => {
    const [patternColor, setPatternColor] = useState('automatic');
    const [patternStyle, setPatternStyle] = useState('none');

    const handleBgColorSelect = (c: string | undefined) => {
        onChange('bg', c);
    };

    const currentBg = style.bg;

    const renderColorOption = (option: any) => (
        <div className="flex items-center gap-2">
            <div 
                className="w-4 h-4 rounded-[2px] shadow-sm border border-slate-200" 
                style={{ backgroundColor: option.value === 'automatic' ? '#000' : option.value }} 
            />
            <span className="font-medium text-xs capitalize">{option.label}</span>
        </div>
    );

    const renderPatternOption = (option: any) => (
        <div className="flex items-center gap-3 w-full">
            <div className="w-10 h-5 border border-slate-200 bg-white relative overflow-hidden rounded-sm shadow-sm">
                <div className="absolute inset-0" style={getPatternPreview(option.value, '#000')} />
            </div>
            <span className="text-xs font-medium text-slate-700">{option.label || 'None'}</span>
        </div>
    );

    return (
        <div className={cn("grid h-full", isMobile ? "grid-cols-1 gap-6 pb-20" : "grid-cols-[2fr_1.3fr] gap-8")}>
            
            {/* LEFT PANE: Background Color */}
            <div className="flex flex-col gap-4 h-full overflow-y-auto pr-2">
                <GroupBox label="Background Color" className="flex flex-col gap-5 h-full">
                    
                    {/* No Color Button */}
                    <button 
                        onClick={() => handleBgColorSelect(undefined)}
                        className={cn(
                            "w-full py-3 px-4 rounded-xl border flex items-center justify-center gap-3 transition-all duration-200 group relative overflow-hidden",
                            !currentBg 
                                ? "bg-slate-100 border-primary-500 shadow-inner ring-1 ring-primary-500/30" 
                                : "bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm"
                        )}
                    >
                        <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                            !currentBg ? "bg-white shadow-sm" : "bg-slate-100"
                        )}>
                             <Ban size={16} className={cn("transition-colors", !currentBg ? "text-primary-600" : "text-slate-400")} />
                        </div>
                        <span className={cn(
                            "text-[13px] font-bold",
                            !currentBg ? "text-primary-700" : "text-slate-600 group-hover:text-slate-800"
                        )}>No Background Color</span>
                        
                        {!currentBg && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                        )}
                    </button>

                    <div className="flex-1 flex flex-col gap-5">
                        {/* Theme Colors Grid */}
                        <div className="flex flex-col gap-2">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                                <Palette size={12} /> Theme Colors
                            </span>
                            <div className="grid grid-cols-10 gap-1.5 p-1">
                                {THEME_COLORS.map((c, i) => (
                                    <button
                                        key={`${c}-${i}`}
                                        className={cn(
                                            "aspect-square rounded-[3px] border border-transparent transition-all relative outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2",
                                            "hover:scale-125 hover:border-white hover:shadow-md hover:z-10",
                                            currentBg === c && "ring-2 ring-primary-600 ring-offset-1 z-10 scale-110 shadow-sm"
                                        )}
                                        style={{ backgroundColor: c }}
                                        onClick={() => handleBgColorSelect(c)}
                                        title={c}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Standard Colors Grid */}
                        <div className="flex flex-col gap-2">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                                <PaintBucket size={12} /> Standard Colors
                            </span>
                            <div className="grid grid-cols-10 gap-1.5 p-1">
                                {STANDARD_COLORS.map((c, i) => (
                                    <button
                                        key={`${c}-${i}`}
                                        className={cn(
                                            "aspect-square rounded-full border border-transparent transition-all relative outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2",
                                            "hover:scale-125 hover:border-white hover:shadow-md hover:z-10",
                                            currentBg === c && "ring-2 ring-primary-600 ring-offset-1 z-10 scale-110 shadow-sm"
                                        )}
                                        style={{ backgroundColor: c }}
                                        onClick={() => handleBgColorSelect(c)}
                                        title={c}
                                    />
                                ))}
                            </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="grid grid-cols-2 gap-3 mt-auto pt-2">
                             <button className="py-2.5 bg-white hover:bg-slate-50 text-[12px] font-bold text-slate-600 rounded-xl transition-all border border-slate-200 shadow-sm hover:shadow active:scale-95">
                                 More Colors...
                             </button>
                             <button className="py-2.5 bg-gradient-to-r from-white to-slate-50 hover:to-slate-100 text-[12px] font-bold text-slate-600 rounded-xl transition-all border border-slate-200 shadow-sm hover:shadow active:scale-95">
                                 Fill Effects...
                             </button>
                        </div>
                    </div>
                </GroupBox>
            </div>

            {/* RIGHT PANE: Pattern & Sample */}
            <div className="flex flex-col gap-6">
                
                {/* Pattern Color & Style */}
                <GroupBox label="Pattern" className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">Pattern Color</span>
                        <ModernSelect 
                            value={patternColor}
                            onChange={setPatternColor}
                            options={[
                                { value: 'automatic', label: 'Automatic' },
                                ...THEME_COLORS.slice(0, 10).map(c => ({ value: c, label: c }))
                            ]}
                            renderOption={renderColorOption}
                            placeholder="Select Color"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">Pattern Style</span>
                        <ModernSelect 
                            value={patternStyle}
                            onChange={setPatternStyle}
                            options={PATTERN_STYLES}
                            renderOption={renderPatternOption}
                            className="max-h-60"
                            placeholder="Select Pattern"
                        />
                    </div>
                </GroupBox>

                {/* Sample Preview */}
                <GroupBox label="Sample" className="flex-1 min-h-[160px] flex flex-col">
                    <div className="flex-1 border-2 border-slate-200 rounded-xl relative overflow-hidden bg-white shadow-inner m-1 group">
                        {/* Checkerboard background for transparency reference */}
                        <div className="absolute inset-0 opacity-20" 
                             style={{ 
                                 backgroundImage: `linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)`,
                                 backgroundSize: '20px 20px',
                                 backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                             }} 
                        />

                        {/* Background Color Layer */}
                        <div 
                            className="absolute inset-0 transition-colors duration-300 ease-out"
                            style={{ backgroundColor: currentBg || 'transparent' }}
                        />
                        
                        {/* Pattern Layer */}
                        {patternStyle !== 'none' && (
                            <div 
                                className="absolute inset-0 opacity-90 mix-blend-multiply transition-all duration-300"
                                style={getPatternPreview(patternStyle, patternColor === 'automatic' ? '#000' : patternColor)}
                            />
                        )}

                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="text-slate-900/10 font-black text-4xl select-none tracking-widest uppercase transform -rotate-12 group-hover:scale-110 transition-transform duration-500">Preview</span>
                        </div>
                    </div>
                    <div className="mt-4 text-center px-4">
                        <p className="text-[11px] text-slate-500 font-medium">
                            {currentBg ? (
                                <span className="flex items-center justify-center gap-1.5">
                                    <span className="w-3 h-3 rounded-full border border-slate-300 shadow-sm" style={{ backgroundColor: currentBg }} />
                                    {currentBg}
                                </span>
                            ) : "No Background Color"} 
                        </p>
                        {patternStyle !== 'none' && (
                            <p className="text-[