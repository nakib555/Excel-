
import React, { useState } from 'react';
import { cn } from '../../../utils';
import { CellStyle } from '../../../types';
import ModernSelect from './ModernSelect';
import GroupBox from './GroupBox';
import { COLORS } from './constants';
import { Ban, Square } from 'lucide-react';

interface BorderTabProps {
    style: CellStyle;
    onChange: (key: keyof CellStyle, val: any) => void;
    isMobile: boolean;
}

const BorderTab: React.FC<BorderTabProps> = ({ style, onChange, isMobile }) => {
    // Default Line Settings
    const [lineStyle, setLineStyle] = useState<'thin' | 'medium' | 'thick' | 'dashed' | 'dotted' | 'double' | 'none'>('thin');
    const [lineColor, setLineColor] = useState<string>('#000000');

    // Mappings for visual rendering
    const lineStyles = [
        { id: 'none', label: 'None', css: 'border-none' },
        { id: 'thin', label: 'Thin', css: 'border-b border-slate-800' },
        { id: 'medium', label: 'Medium', css: 'border-b-[2px] border-slate-800' },
        { id: 'thick', label: 'Thick', css: 'border-b-[4px] border-slate-800' },
        { id: 'dashed', label: 'Dashed', css: 'border-b-[2px] border-dashed border-slate-800' },
        { id: 'dotted', label: 'Dotted', css: 'border-b-[2px] border-dotted border-slate-800' },
        { id: 'double', label: 'Double', css: 'border-b-[4px] border-double border-slate-800' },
    ];

    const currentBorders = style.borders || {};

    const toggleBorder = (side: keyof NonNullable<CellStyle['borders']>) => {
        const current = currentBorders[side];
        // Remove if active and same style, otherwise apply
        if (current && current.style === lineStyle && current.color === lineColor) {
            const next = { ...currentBorders };
            delete next[side];
            onChange('borders', next);
        } else {
            const next = { 
                ...currentBorders, 
                [side]: { style: lineStyle, color: lineColor } 
            };
            onChange('borders', next);
        }
    };

    const applyPreset = (type: 'none' | 'outline' | 'inside') => {
        let next = { ...currentBorders };
        const b = { style: lineStyle, color: lineColor };
        
        if (type === 'none') {
            next = {};
        } else if (type === 'outline') {
            next.top = b;
            next.bottom = b;
            next.left = b;
            next.right = b;
        } else if (type === 'inside') {
            // "Inside" usually implies cross borders for single cell selection in this simplified UI
            // Or clears inside borders if multi-select logic was present
        }
        onChange('borders', next);
    };

    // Helper to generate dynamic inline styles for the preview box borders
    const getBorderStyle = (side: keyof NonNullable<CellStyle['borders']>) => {
        const b = currentBorders[side];
        if (!b || b.style === 'none') return 'none';
        
        const width = b.style === 'thick' || b.style === 'double' ? '3px' : b.style === 'medium' ? '2px' : '1px';
        const s = b.style === 'double' ? 'double' : b.style === 'dashed' ? 'dashed' : b.style === 'dotted' ? 'dotted' : 'solid';
        const c = b.color;
        
        return `${width} ${s} ${c}`;
    };

    // Helper to check if a specific border is active for UI highlighting
    const isBorderActive = (side: keyof NonNullable<CellStyle['borders']>) => {
        const b = currentBorders[side];
        return b && b.style !== 'none';
    };

    return (
        <div className={cn("grid h-full", isMobile ? "grid-cols-1 gap-6 pb-20" : "grid-cols-[240px_1fr] gap-8")}>
            {/* Left Column: Line Style & Color */}
            <div className="flex flex-col gap-4">
                <GroupBox label="Line" className="flex flex-col gap-4 h-full">
                    <div className="flex flex-col gap-2 flex-1">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">Style</span>
                        <ModernSelect
                            value={lineStyle}
                            onChange={(val) => setLineStyle(val)}
                            options={lineStyles.map(s => ({
                                value: s.id,
                                label: s.id === 'none' 
                                    ? <span className="text-slate-500 italic">None</span> 
                                    : <div className={cn("w-full transition-colors", s.css)} />
                            }))}
                        />
                    </div>
                    
                    <div className="flex flex-col gap-2">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">Color</span>
                        <ModernSelect 
                            value={lineColor}
                            options={COLORS.map(c => ({ 
                                value: c, 
                                label: (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-[2px] shadow-sm border border-slate-200" style={{backgroundColor: c}}/>
                                        <span className="font-mono text-xs">{c === '#000000' ? 'Automatic' : c}</span>
                                    </div>
                                ) 
                            }))} 
                            onChange={setLineColor}
                        />
                    </div>
                </GroupBox>
            </div>

            {/* Right Column: Presets & Diagram */}
            <div className="flex flex-col gap-4">
                {/* Presets */}
                <GroupBox label="Presets" className="pb-4">
                    <div className="flex items-center gap-4 justify-center">
                        <button onClick={() => applyPreset('none')} className="flex flex-col items-center gap-2 p-3 hover:bg-slate-50 rounded-xl group transition-all">
                            <div className="w-10 h-10 border border-slate-200 rounded-lg flex items-center justify-center bg-white group-hover:border-red-300 group-hover:bg-red-50 group-hover:shadow-sm transition-all">
                                <Ban size={16} className="text-slate-300 group-hover:text-red-500" />
                            </div>
                            <span className="text-[11px] font-bold text-slate-500 group-hover:text-slate-700">None</span>
                        </button>
                        <button onClick={() => applyPreset('outline')} className="flex flex-col items-center gap-2 p-3 hover:bg-slate-50 rounded-xl group transition-all">
                            <div className="w-10 h-10 border border-slate-200 rounded-lg flex items-center justify-center bg-white group-hover:border-blue-300 group-hover:bg-blue-50 group-hover:shadow-sm transition-all">
                                <Square size={18} className="text-slate-800 stroke-[3] group-hover:text-blue-600" />
                            </div>
                            <span className="text-[11px] font-bold text-slate-500 group-hover:text-slate-700">Outline</span>
                        </button>
                    </div>
                </GroupBox>

                {/* Interactive Diagram */}
                <GroupBox label="Border" className="flex-1 flex flex-col justify-center items-center relative min-h-[260px]">
                    <div className="relative p-8">
                        {/* Central Preview Box */}
                        <div className="w-32 h-32 md:w-44 md:h-44 relative flex items-center justify-center">
                            
                            {/* Top Toggle Button */}
                            <button 
                                onClick={() => toggleBorder('top')}
                                className={cn(
                                    "absolute -top-8 left-1/2 -translate-x-1/2 w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-slate-100 border border-transparent",
                                    isBorderActive('top') ? "bg-primary-50 text-primary-600 border-primary-200" : "text-slate-300"
                                )}
                                title="Top Border"
                            >
                                <div className="w-4 h-[2px] bg-current" />
                            </button>

                            {/* Bottom Toggle Button */}
                            <button 
                                onClick={() => toggleBorder('bottom')}
                                className={cn(
                                    "absolute -bottom-8 left-1/2 -translate-x-1/2 w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-slate-100 border border-transparent",
                                    isBorderActive('bottom') ? "bg-primary-50 text-primary-600 border-primary-200" : "text-slate-300"
                                )}
                                title="Bottom Border"
                            >
                                <div className="w-4 h-[2px] bg-current" />
                            </button>

                            {/* Left Toggle Button */}
                            <button 
                                onClick={() => toggleBorder('left')}
                                className={cn(
                                    "absolute top-1/2 -left-8 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-slate-100 border border-transparent",
                                    isBorderActive('left') ? "bg-primary-50 text-primary-600 border-primary-200" : "text-slate-300"
                                )}
                                title="Left Border"
                            >
                                <div className="h-4 w-[2px] bg-current" />
                            </button>

                            {/* Right Toggle Button */}
                            <button 
                                onClick={() => toggleBorder('right')}
                                className={cn(
                                    "absolute top-1/2 -right-8 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-slate-100 border border-transparent",
                                    isBorderActive('right') ? "bg-primary-50 text-primary-600 border-primary-200" : "text-slate-300"
                                )}
                                title="Right Border"
                            >
                                <div className="h-4 w-[2px] bg-current" />
                            </button>

                            {/* Diagonal Up Toggle (Corner) */}
                            <button
                                onClick={() => toggleBorder('diagonalUp')}
                                className={cn(
                                    "absolute -bottom-8 -left-8 w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-slate-100 border border-transparent",
                                    isBorderActive('diagonalUp') ? "bg-primary-50 text-primary-600 border-primary-200" : "text-slate-300"
                                )}
                                title="Diagonal Up"
                            >
                                <div className="w-4 h-[2px] bg-current -rotate-45" />
                            </button>

                            {/* Diagonal Down Toggle (Corner) */}
                            <button
                                onClick={() => toggleBorder('diagonalDown')}
                                className={cn(
                                    "absolute -bottom-8 -right-8 w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-slate-100 border border-transparent",
                                    isBorderActive('diagonalDown') ? "bg-primary-50 text-primary-600 border-primary-200" : "text-slate-300"
                                )}
                                title="Diagonal Down"
                            >
                                <div className="w-4 h-[2px] bg-current rotate-45" />
                            </button>


                            {/* The Actual Box Render */}
                            <div 
                                className="w-full h-full bg-white relative flex items-center justify-center overflow-hidden shadow-sm"
                                style={{
                                    borderTop: getBorderStyle('top'),
                                    borderBottom: getBorderStyle('bottom'),
                                    borderLeft: getBorderStyle('left'),
                                    borderRight: getBorderStyle('right'),
                                }}
                            >
                                {/* Diagonals - Rendered inside to overlap content area correctly */}
                                {isBorderActive('diagonalUp') && (
                                    <div 
                                        className="absolute w-[142%] h-0 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none origin-center -rotate-45 border-t"
                                        style={{ 
                                            borderTop: getBorderStyle('diagonalUp'),
                                            borderTopWidth: currentBorders.diagonalUp?.style === 'thick' ? '3px' : currentBorders.diagonalUp?.style === 'medium' ? '2px' : '1px'
                                        }} 
                                    />
                                )}
                                {isBorderActive('diagonalDown') && (
                                    <div 
                                        className="absolute w-[142%] h-0 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none origin-center rotate-45 border-t"
                                        style={{ 
                                            borderTop: getBorderStyle('diagonalDown'),
                                            borderTopWidth: currentBorders.diagonalDown?.style === 'thick' ? '3px' : currentBorders.diagonalDown?.style === 'medium' ? '2px' : '1px'
                                        }} 
                                    />
                                )}

                                {/* Inner Cross Guides (Faint guides typical of Excel dialog) */}
                                <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 pointer-events-none opacity-50">
                                    <div className="border-r border-b border-slate-200" />
                                    <div className="border-b border-slate-200" />
                                    <div className="border-r border-slate-200" />
                                    <div />
                                </div>

                                <span className="relative z-10 text-slate-400 font-medium text-sm select-none">Text</span>
                                
                                {/* Clickable Hotspots for Direct Interaction with visual feedback */}
                                <div className="absolute inset-0 z-20">
                                    {/* Top Area */}
                                    <div className="absolute top-0 left-0 right-0 h-6 cursor-pointer hover:bg-primary-500/5 transition-colors" onClick={() => toggleBorder('top')} title="Toggle Top Border" />
                                    {/* Bottom Area */}
                                    <div className="absolute bottom-0 left-0 right-0 h-6 cursor-pointer hover:bg-primary-500/5 transition-colors" onClick={() => toggleBorder('bottom')} title="Toggle Bottom Border" />
                                    {/* Left Area */}
                                    <div className="absolute top-0 bottom-0 left-0 w-6 cursor-pointer hover:bg-primary-500/5 transition-colors" onClick={() => toggleBorder('left')} title="Toggle Left Border" />
                                    {/* Right Area */}
                                    <div className="absolute top-0 bottom-0 right-0 w-6 cursor-pointer hover:bg-primary-500/5 transition-colors" onClick={() => toggleBorder('right')} title="Toggle Right Border" />
                                </div>
                            </div>

                            {/* Corner Guides (Outer Reference Points) */}
                            <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-slate-300" />
                            <div className="absolute -top-1 -right-1 w-2 h-2 border-t border-r border-slate-300" />
                            <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b border-l border-slate-300" />
                            <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-slate-300" />
                        </div>
                    </div>
                    
                    <p className="text-[10px] text-slate-400 text-center max-w-[240px] mt-2">
                        Click on diagram or use buttons to apply borders
                    </p>
                </GroupBox>
            </div>
        </div>
    );
};

export default BorderTab;
