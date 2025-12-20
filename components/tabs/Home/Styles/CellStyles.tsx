
import React, { useState } from 'react';
import { Palette, ChevronDown } from 'lucide-react';
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
            { name: "Calculation", style: { bg: '#f2f2f2', color: '#fa7d00', border: '1px solid #7f7f7f' } as any }, // simplified border for demo
            { name: "Check Cell", style: { bg: '#a5a5a5', color: '#ffffff', bold: true, border: 'double' } as any },
            { name: "Explanatory...", style: { color: '#7f7f7f', italic: true } },
            { name: "Input", style: { bg: '#ffcc99', color: '#3f3f76', border: '1px solid #7f7f7f' } as any },
            { name: "Linked Cell", style: { borderBottom: 'double #ff8001', color: '#fa7d00' } as any },
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
            { name: "Total", style: { borderTop: '1px solid #1f497d', borderBottom: 'double #1f497d', bold: true } as any }
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
    const s = preset.style as any; // Using any for quick CSS extraction from simplified object
    
    // Simulate specific borders if defined in simplified object (like 'borderBottom') 
    // or convert standard border object if robust logic existed.
    // For this gallery we use simplified inline styles for visual approximation.
    const style: React.CSSProperties = {
        backgroundColor: s.bg || '#fff',
        color: s.color || '#000',
        fontWeight: s.bold ? 'bold' : 'normal',
        fontStyle: s.italic ? 'italic' : 'normal',
        textDecoration: s.underline ? 'underline' : 'none',
        border: s.border,
        borderBottom: s.borderBottom || (s.border ? undefined : '1px solid #e2e8f0'), // Default border for grid
        borderTop: s.borderTop,
        borderRight: '1px solid #e2e8f0', // Grid like
        borderLeft: '1px solid #e2e8f0',
        fontSize: s.fontSize ? `${Math.max(10, s.fontSize * 0.8)}px` : '11px', // Scale down slightly
    };

    return (
        <button 
            className="flex flex-col items-center gap-1 group w-full"
            onClick={onClick}
        >
            <div 
                className="w-full h-8 flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105 group-hover:shadow-md"
                style={style}
            >
                <span className="truncate px-1">{preset.name}</span>
            </div>
            <span className="text-[9px] text-slate-500 group-hover:text-slate-800 truncate max-w-full">{preset.name}</span>
        </button>
    );
};

const CellStyles: React.FC<CellStylesProps> = ({ onApplyStyle }) => {
    const [open, setOpen] = useState(false);

    const handleSelect = (preset: StylePreset) => {
        if (onApplyStyle) {
            // Need to convert simplified style props from PRESETS to valid CellStyle if necessary
            // For now, we assume PRESETS generally match CellStyle structure or standard React CSS where feasible.
            // Adjust borders: 
            const finalStyle: CellStyle = { ...preset.style };
            
            // Map simplified string borders to object if needed, 
            // but our App supports extensive styles. 
            // For MVP let's assume direct mapping works or ignore complex borders in gallery apply for now.
            // To make "Normal" work as reset:
            if (preset.name === "Normal") {
                // We might want to clear everything.
                // We'll pass a style that resets common things.
                // The App's handleApplyFullStyle performs a merge. 
                // To clear, we explicitly set values to undefined or defaults.
                Object.assign(finalStyle, {
                    bg: undefined, color: undefined, bold: false, italic: false, underline: false,
                    borders: undefined, fontSize: 11, fontFamily: 'Inter'
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
            contentWidth="w-[320px] md:w-[480px]"
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
            <div className="flex flex-col max-h-[500px] overflow-y-auto p-1 bg-[#f8f9fa]">
                {PRESETS.map((cat) => (
                    <div key={cat.category} className="mb-4">
                        <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                            {cat.category}
                        </div>
                        <div className="grid grid-cols-4 gap-x-2 gap-y-3 px-2">
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
                
                <div className="border-t border-slate-200 mt-2 pt-2 pb-1 px-2 flex flex-col gap-1">
                    <button className="text-left px-2 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 rounded">
                        New Cell Style...
                    </button>
                    <button className="text-left px-2 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 rounded">
                        Merge Styles...
                    </button>
                </div>
            </div>
        </SmartDropdown>
    );
};

export default CellStyles;
