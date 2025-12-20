
import React, { useState } from 'react';
import { Palette, ChevronRight, Plus, Layers } from 'lucide-react';
import { RibbonButton, SmartDropdown } from '../../shared';
import { CellStyle } from '../../../types';
import { cn } from '../../utils';

interface CellStylesProps {
    onApplyStyle?: (style: CellStyle) => void;
}

interface StylePreset {
    name: string;
    style: CellStyle;
}

// Mimic Excel's Default Styles
const PRESETS: { category: string; styles: StylePreset[] }[] = [
    {
        category: "Good, Bad and Neutral",
        styles: [
            { name: "Normal", style: { bg: '#ffffff', color: '#0f172a', bold: false, italic: false, underline: false, borders: {} } },
            { name: "Bad", style: { bg: '#ffc7ce', color: '#9c0006' } },
            { name: "Good", style: { bg: '#c6efce', color: '#006100' } },
            { name: "Neutral", style: { bg: '#ffeb9c', color: '#9c5700' } }
        ]
    },
    {
        category: "Data and Model",
        styles: [
            { name: "Calculation", style: { bg: '#f2f2f2', color: '#fa7d00', border: '1px solid #7f7f7f' } as any }, 
            { name: "Check Cell", style: { bg: '#a5a5a5', color: '#ffffff', bold: true, border: '3px double #ffffff', borderStyle: 'double' } as any },
            { name: "Explanatory", style: { color: '#7f7f7f', italic: true } },
            { name: "Input", style: { bg: '#ffcc99', color: '#3f3f76', border: '1px solid #7f7f7f' } as any },
            { name: "Linked Cell", style: { borderBottom: '3px double #ff8001', color: '#fa7d00' } as any },
            { name: "Note", style: { bg: '#ffffcc', border: '1px solid #b2b2b2' } as any },
            { name: "Output", style: { bg: '#f2f2f2', border: '1px solid #3f3f3f', bold: true } as any },
            { name: "Warning Text", style: { color: '#ff0000' } }
        ]
    },
    {
        category: "Titles and Headings",
        styles: [
            { name: "Heading 1", style: { fontSize: 15, bold: true, color: '#2f75b5', borderBottom: '2px solid #2f75b5' } as any },
            { name: "Heading 2", style: { fontSize: 13, bold: true, color: '#2f75b5', borderBottom: '2px solid #a9d08e' } as any },
            { name: "Heading 3", style: { fontSize: 11, bold: true, color: '#2f75b5', borderBottom: '1px solid #a9d08e' } as any },
            { name: "Heading 4", style: { fontSize: 11, bold: true, color: '#2f75b5' } },
            { name: "Title", style: { fontSize: 18, bold: true, color: '#1f497d' } },
            { name: "Total", style: { borderTop: '1px solid #1f497d', borderBottom: '3px double #1f497d', bold: true } as any }
        ]
    },
    {
        category: "Themed Cell Styles",
        styles: [
            { name: "20% - Accent1", style: { bg: '#d9e1f2', color: '#000' } },
            { name: "40% - Accent1", style: { bg: '#b4c6e7', color: '#000' } },
            { name: "60% - Accent1", style: { bg: '#8ea9db', color: '#fff' } },
            { name: "Accent1", style: { bg: '#4472c4', color: '#fff' } },
            { name: "20% - Accent2", style: { bg: '#fce4d6', color: '#000' } },
            { name: "40% - Accent2", style: { bg: '#f8cbad', color: '#000' } },
            { name: "60% - Accent2", style: { bg: '#f4b084', color: '#fff' } },
            { name: "Accent2", style: { bg: '#ed7d31', color: '#fff' } },
            { name: "20% - Accent3", style: { bg: '#ededed', color: '#000' } },
            { name: "40% - Accent3", style: { bg: '#dbdbdb', color: '#000' } },
            { name: "60% - Accent3", style: { bg: '#c9c9c9', color: '#fff' } },
            { name: "Accent3", style: { bg: '#a5a5a5', color: '#fff' } },
        ]
    },
    {
        category: "Number Format",
        styles: [
            { name: "Comma", style: { format: 'comma' } },
            { name: "Comma [0]", style: { format: 'comma', decimalPlaces: 0 } },
            { name: "Currency", style: { format: 'currency' } },
            { name: "Currency [0]", style: { format: 'currency', decimalPlaces: 0 } },
            { name: "Percent", style: { format: 'percent' } }
        ]
    }
];

const StylePreviewBox: React.FC<{ preset: StylePreset; onClick: () => void }> = ({ preset, onClick }) => {
    // Helper to extract border styles for CSS
    const s = preset.style as any; 
    
    const style: React.CSSProperties = {
        backgroundColor: s.bg || '#ffffff',
        color: s.color || '#0f172a',
        fontWeight: s.bold ? '600' : '400',
        fontStyle: s.italic ? 'italic' : 'normal',
        textDecoration: s.underline ? 'underline' : 'none',
        // Fallbacks for specific borders vs simplified "border" prop
        borderTop: s.borderTop || s.border || '1px solid #e2e8f0',
        borderBottom: s.borderBottom || s.border || '1px solid #e2e8f0',
        borderLeft: s.borderLeft || s.border || '1px solid #e2e8f0',
        borderRight: s.borderRight || s.border || '1px solid #e2e8f0',
        fontSize: s.fontSize ? `${Math.max(11, s.fontSize * 0.85)}px` : '12px',
        fontFamily: 'Inter, sans-serif',
    };

    return (
        <button 
            className="group w-full relative outline-none focus:outline-none"
            onClick={onClick}
            title={preset.name}
        >
            <div 
                className="w-full h-10 flex items-center justify-center overflow-hidden transition-all duration-200 rounded-md group-hover:scale-[1.05] group-hover:shadow-lg group-hover:z-10 relative bg-white"
                style={style}
            >
                <span className="truncate px-2 w-full text-center leading-none select-none">{preset.name}</span>
            </div>
            {/* Hover Outline */}
            <div className="absolute inset-0 border-2 border-primary-500/0 group-hover:border-primary-500 rounded-md pointer-events-none transition-colors -m-[1px]" />
        </button>
    );
};

const CellStyles: React.FC<CellStylesProps> = ({ onApplyStyle }) => {
    const [open, setOpen] = useState(false);

    const handleSelect = (preset: StylePreset) => {
        if (onApplyStyle) {
            const finalStyle: CellStyle = { ...preset.style };
            
            // "Normal" acts as a reset
            if (preset.name === "Normal") {
                Object.assign(finalStyle, {
                    bg: undefined, color: undefined, bold: false, italic: false, underline: false,
                    borders: undefined, fontSize: 13, fontFamily: 'Inter'
                });
            }

            onApplyStyle(finalStyle);
        }
        setOpen(false);
    };

    return (
        <SmartDropdown
            open={open}
            onToggle={() => setOpen(!open)}
            contentWidth="w-[340px] md:w-[520px]"
            triggerClassName="h-full"
            trigger={
                <RibbonButton 
                    variant="large" 
                    icon={<Palette size={20} className="text-purple-500" />} 
                    label="Cell" 
                    subLabel="Styles" 
                    hasDropdown 
                    onClick={() => {}} 
                    active={open}
                />
            }
        >
            {/* NOTE: No max-h or overflow here to prevent double scrollbars. SmartDropdown handles scrolling. */}
            <div className="flex flex-col p-4 bg-white gap-6">
                {PRESETS.map((cat) => (
                    <div key={cat.category} className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{cat.category}</span>
                            <div className="h-[1px] flex-1 bg-slate-100"></div>
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                            {cat.styles.map((preset) => (
                                <StylePreviewBox 
                                    key={preset.name} 
                                    preset={preset} 
                                    onClick={() => handleSelect(preset)} 
                                />
                            ))}
                        </div>
                    </div>
                ))}
                
                <div className="border-t border-slate-100 pt-4 flex flex-col gap-3 pb-2">
                    <button className="group relative w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-white hover:border-emerald-200 hover:shadow-md hover:shadow-emerald-900/5 transition-all duration-200">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-600 transition-all duration-200 shadow-sm">
                                <Plus size={18} strokeWidth={2.5} />
                            </div>
                            <div className="flex flex-col items-start">
                                <span className="text-[13px] font-bold text-slate-700 group-hover:text-emerald-950 transition-colors">New Cell Style</span>
                                <span className="text-[10px] font-medium text-slate-400 group-hover:text-emerald-600/70 transition-colors">Create from current selection</span>
                            </div>
                        </div>
                        <ChevronRight size={16} className="text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
                    </button>

                    <button className="group relative w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-white hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-900/5 transition-all duration-200">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-500 group-hover:text-white group-hover:border-indigo-600 transition-all duration-200 shadow-sm">
                                <Layers size={18} strokeWidth={2.5} />
                            </div>
                            <div className="flex flex-col items-start">
                                <span className="text-[13px] font-bold text-slate-700 group-hover:text-indigo-950 transition-colors">Merge Styles</span>
                                <span className="text-[10px] font-medium text-slate-400 group-hover:text-indigo-600/70 transition-colors">Copy from another workbook</span>
                            </div>
                        </div>
                        <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
                    </button>
                </div>
            </div>
        </SmartDropdown>
    );
};

export default CellStyles;
