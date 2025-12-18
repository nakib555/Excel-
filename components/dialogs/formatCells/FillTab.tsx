
import React, { useState } from 'react';
import { cn } from '../../../utils';
import { CellStyle } from '../../../types';
import GroupBox from './GroupBox';
import ModernSelect from './ModernSelect';
import { Ban, PaintBucket, Palette, Grip } from 'lucide-react';

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

const getPatternCSS = (style: string, color: string) => {
    const c = color === 'automatic' ? '#000000' : color;
    switch (style) {
        case 'none': return {}; 
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
    // Local state for Pattern controls (which are not fully persisted in standard cell style usually, but we simulate it)
    // In a real app, style.fill.patternColor etc would be used.
    const [patternColor, setPatternColor] = useState('automatic');
    const [patternStyle, setPatternStyle] = useState('none');

    const handleBgColorSelect = (c: string | undefined) => {
        onChange('bg', c);
    };

    const currentBg = style.bg;

    // Custom Renderers for ModernSelect
    const renderColorOption = (option: any) => (
        <div className="flex items-center gap-3">
            <div 
                className="w-5 h-5 rounded-[4px] shadow-sm border border-slate-200 flex-shrink-0" 
                style={{ backgroundColor: option.value === 'automatic' ? '#000' : option.value }} 
            />
            <span className="font-medium text-[13px] text-slate-700 capitalize truncate">{option.label}</span>
        </div>
    );

    const renderPatternOption = (option: any) => (
        <div className="flex items-center gap-3 w-full">
            <div className="w-12 h-6 border border-slate-300 bg-white relative overflow-hidden rounded-[3px] shadow-sm flex-shrink-0">
                {/* Render the pattern inside the dropdown option */}
                <div className="absolute inset-0" style={getPatternCSS(option.value, patternColor === 'automatic' ? '#000' : patternColor)} />
            </div>
            <span className="text-[13px] font-medium text-slate-700 truncate">{option.label || 'None'}</span>
        </div>
    );

    return (
        <div className={cn("grid h-full w-full", isMobile ? "grid-cols-1 gap-6 pb-24" : "grid-cols-[1.6fr_1fr] gap-8")}>
            
            {/* LEFT PANE: Background Color Section */}
            <div className="flex flex-col gap-4 h-full overflow-hidden">
                <GroupBox label="Background Color" className="flex flex-col gap-4 h-full relative overflow-hidden min-h-[350px]">
                    
                    {/* 1. No Color Button */}
                    <button 
                        onClick={() => handleBgColorSelect(undefined)}
                        className={cn(
                            "w-full py-3 px-4 rounded-xl border flex items-center justify-center gap-2.5 transition-all duration-200 group relative overflow-hidden flex-shrink-0",
                            !currentBg 
                                ? "bg-slate-100 border-primary-500 shadow-inner ring-1 ring-primary-500/30" 
                                : "bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm"
                        )}
                    >
                        <div className={cn(
                            "w-6 h-6 rounded flex items-center justify-center transition-all",
                            !currentBg ? "bg-white shadow-sm" : "bg-slate-100"
                        )}>
                             <Ban size={14} className={cn("transition-colors", !currentBg ? "text-primary-600" : "text-slate-400")} />
                        </div>
                        <span className={cn(
                            "text-[13px] font-bold",
                            !currentBg ? "text-primary-700" : "text-slate-600 group-hover:text-slate-800"
                        )}>No Color</span>
                        
                        {!currentBg && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
                        )}
                    </button>

                    {/* 2. Colors Grid Area */}
                    <div className="flex-1 overflow-y-auto scrollbar-thin px-1 pb-1 flex flex-col gap-5">
                        {/* Theme Colors Grid */}
                        <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 flex items-center gap-1.5 sticky top-0 bg-white/95 backdrop-blur-sm py-1 z-10">
                                <Palette size={10} /> Theme Colors
                            </span>
                            <div className="grid grid-cols-10 gap-1.5">
                                {THEME_COLORS.map((c, i) => (
                                    <button
                                        key={`theme-${c}-${i}`}
                                        className={cn(
                                            "aspect-square rounded-[3px] border border-transparent transition-all relative outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-1",
                                            "hover:scale-125 hover:border-white hover:shadow-lg hover:z-20 hover:rounded-[4px]",
                                            currentBg === c && "ring-2 ring-primary-600 ring-offset-1 z-10 scale-110 shadow-md rounded-[3px]"
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
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 flex items-center gap-1.5 sticky top-0 bg-white/95 backdrop-blur-sm py-1 z-10">
                                <PaintBucket size={10} /> Standard Colors
                            </span>
                            <div className="grid grid-cols-10 gap-1.5">
                                {STANDARD_COLORS.map((c, i) => (
                                    <button
                                        key={`std-${c}-${i}`}
                                        className={cn(
                                            "aspect-square rounded-full border border-transparent transition-all relative outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-1",
                                            "hover:scale-125 hover:border-white hover:shadow-lg hover:z-20",
                                            currentBg === c && "ring-2 ring-primary-600 ring-offset-1 z-10 scale-110 shadow-md"
                                        )}
                                        style={{ backgroundColor: c }}
                                        onClick={() => handleBgColorSelect(c)}
                                        title={c}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                        
                    {/* 3. Bottom Actions */}
                    <div className={cn("grid gap-3 pt-3 border-t border-slate-100 mt-auto flex-shrink-0", isMobile ? "grid-cols-1" : "grid-cols-2")}>
                            <button className="py-2.5 bg-white hover:bg-slate-50 text-[12px] font-bold text-slate-600 rounded-xl transition-all border border-slate-200 shadow-sm hover:shadow active:scale-95">
                                More Colors...
                            </button>
                            <button className="py-2.5 bg-gradient-to-r from-white to-slate-50 hover:to-slate-100 text-[12px] font-bold text-slate-600 rounded-xl transition-all border border-slate-200 shadow-sm hover:shadow active:scale-95 flex items-center justify-center gap-2">
                                <span>Fill Effects...</span>
                            </button>
                    </div>
                </GroupBox>
            </div>

            {/* RIGHT PANE: Pattern & Sample */}
            <div className="flex flex-col gap-6 h-full">
                
                {/* Pattern Controls */}
                <GroupBox label="Pattern" className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center px-1">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pattern Color</span>
                        </div>
                        <ModernSelect 
                            value={patternColor}
                            onChange={setPatternColor}
                            options={[
                                { value: 'automatic', label: 'Automatic' },
                                ...STANDARD_COLORS.map(c => ({ value: c, label: c })),
                                ...THEME_COLORS.slice(0, 20).map(c => ({ value: c, label: c }))
                            ]}
                            renderOption={renderColorOption}
                            placeholder="Automatic"
                            className="z-20"
                        />
                    </div>
                    
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center px-1">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pattern Style</span>
                        </div>
                        <ModernSelect 
                            value={patternStyle}
                            onChange={setPatternStyle}
                            options={PATTERN_STYLES}
                            renderOption={renderPatternOption}
                            className="z-10"
                            placeholder="Solid"
                        />
                    </div>
                </GroupBox>

                {/* Sample Preview */}
                <GroupBox label="Sample" className="flex-1 min-h-[140px] flex flex-col justify-center bg-slate-50/50">
                    <div className="w-full flex-1 flex flex-col gap-2">
                        <div className="w-full flex-1 border-2 border-slate-300 rounded-lg relative overflow-hidden bg-white shadow-inner group">
                            
                            {/* Checkerboard background for transparency reference */}
                            <div className="absolute inset-0 opacity-20" 
                                style={{ 
                                    backgroundImage: `linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)`,
                                    backgroundSize: '20px 20px',
                                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                                }} 
                            />

                            {/* Content Container */}
                            <div className="absolute inset-0 flex items-center justify-center p-4">
                                {/* The Actual Cell Preview */}
                                <div className="w-full h-full relative border border-slate-400 shadow-md">
                                    {/* Background Color Layer */}
                                    <div 
                                        className="absolute inset-0 transition-colors duration-300 ease-out"
                                        style={{ backgroundColor: currentBg || 'transparent' }}
                                    />
                                    
                                    {/* Pattern Layer */}
                                    {patternStyle !== 'none' && (
                                        <div 
                                            className="absolute inset-0 opacity-90 mix-blend-multiply transition-all duration-300"
                                            style={getPatternCSS(patternStyle, patternColor === 'automatic' ? '#000' : patternColor)}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <div className="px-2 text-center flex items-center justify-center gap-2">
                             <p className="text-[10px] text-slate-400">
                                {currentBg ? (
                                    <>Fill: <span className="font-mono font-bold text-slate-600">{currentBg}</span></>
                                ) : 'No Fill Color'}
                             </p>
                             {patternStyle !== 'none' && (
                                <div className="flex items-center gap-1 text-[10px] text-slate-400 border-l border-slate-200 pl-2">
                                    <Grip size={10} />
                                    <span className="font-bold text-slate-600">{PATTERN_STYLES.find(p => p.value === patternStyle)?.label}</span>
                                </div>
                             )}
                        </div>
                    </div>
                </GroupBox>
            </div>
        </div>
    );
};

export default FillTab;
