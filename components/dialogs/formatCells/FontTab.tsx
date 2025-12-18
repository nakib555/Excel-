
import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../../utils';
import { CellStyle } from '../../../types';
import ModernSelect from './ModernSelect';
import GroupBox from './GroupBox';

interface FontTabProps {
    style: CellStyle;
    onChange: (key: keyof CellStyle, val: any) => void;
    isMobile: boolean;
}

const FontTab: React.FC<FontTabProps> = ({ style, onChange, isMobile }) => {
    
    // Data Sources
    const FONT_FAMILIES = ['Inter', 'Arial', 'Calibri', 'Times New Roman', 'Courier New', 'Verdana', 'Georgia', 'Trebuchet MS', 'Comic Sans MS'];
    
    const FONT_STYLES = [
        { value: 'Regular', label: 'Regular', bold: false, italic: false },
        { value: 'Italic', label: 'Italic', bold: false, italic: true },
        { value: 'Bold', label: 'Bold', bold: true, italic: false },
        { value: 'Bold Italic', label: 'Bold Italic', bold: true, italic: true }
    ];

    const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72];

    // Determine current style value string
    const currentStyleVal = style.bold && style.italic ? 'Bold Italic' : style.bold ? 'Bold' : style.italic ? 'Italic' : 'Regular';

    return (
        <div className="flex flex-col h-full gap-6 pb-4">
            {/* Top Section: Font, Style, Size */}
            <div className={cn("grid gap-4 items-start", isMobile ? "grid-cols-1" : "grid-cols-[2fr_1.5fr_1fr]")}>
                
                {/* Font Family */}
                <div className="flex flex-col gap-2">
                    <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider px-1">Typeface</span>
                    <ModernSelect 
                        searchable
                        value={style.fontFamily || 'Inter'}
                        onChange={(val) => onChange('fontFamily', val)}
                        options={FONT_FAMILIES.map(f => ({ value: f, label: <span style={{ fontFamily: f }}>{f}</span> }))}
                        placeholder="Select Font"
                    />
                </div>

                {/* Font Style */}
                <div className="flex flex-col gap-2">
                    <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider px-1">Style</span>
                    <ModernSelect 
                        value={currentStyleVal}
                        onChange={(val) => {
                            const match = FONT_STYLES.find(s => s.value === val);
                            if (match) {
                                onChange('bold', match.bold);
                                onChange('italic', match.italic);
                            }
                        }}
                        options={FONT_STYLES.map(s => ({ 
                            value: s.value, 
                            label: <span style={{ fontWeight: s.bold ? 'bold' : 'normal', fontStyle: s.italic ? 'italic' : 'normal' }}>{s.label}</span> 
                        }))}
                        placeholder="Select Style"
                    />
                </div>

                {/* Font Size */}
                <div className="flex flex-col gap-2">
                    <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider px-1">Size</span>
                    <ModernSelect 
                        value={style.fontSize || 11}
                        onChange={(val) => onChange('fontSize', Number(val))}
                        options={FONT_SIZES.map(s => ({ value: s, label: s }))}
                        placeholder="Size"
                    />
                </div>
            </div>

            {/* Middle Section: Underline & Color & Effects */}
            <div className={cn("grid gap-6", isMobile ? "grid-cols-1" : "grid-cols-2")}>
                
                <div className="flex flex-col gap-4">
                    {/* Underline */}
                    <div className="flex flex-col gap-2">
                        <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider px-1">Underline</span>
                        <ModernSelect 
                            value={style.underline ? 'single' : 'none'} 
                            options={[
                                { value: 'none', label: 'None' },
                                { value: 'single', label: 'Single' },
                                { value: 'double', label: 'Double' },
                                { value: 'single_acc', label: 'Single Accounting' },
                                { value: 'double_acc', label: 'Double Accounting' }
                            ]}
                            onChange={(val) => onChange('underline', val !== 'none')}
                        />
                    </div>

                    {/* Color */}
                    <div className="flex flex-col gap-2">
                        <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider px-1">Color</span>
                        <div className="relative">
                            <ModernSelect 
                                value={style.color || '#000000'}
                                options={[{value: style.color || '#000000', label: 'Current Color'}]} 
                                onChange={() => {}}
                                className="pointer-events-none opacity-90"
                            />
                            {/* Custom Color Trigger Overlay */}
                            <div className="absolute inset-0 z-10 opacity-0 cursor-pointer">
                                <input 
                                    type="color" 
                                    className="w-full h-full cursor-pointer"
                                    value={style.color || '#000000'}
                                    onChange={(e) => onChange('color', e.target.value)}
                                />
                            </div>
                            {/* Visual Indicator */}
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md border border-slate-200 shadow-sm pointer-events-none" style={{ backgroundColor: style.color || '#000000' }} />
                        </div>
                    </div>
                </div>

                {/* Effects & Preview */}
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider px-1">Effects</span>
                        <div className="flex flex-col gap-3 py-1">
                            <label className="flex items-center gap-3 cursor-pointer group select-none">
                                <div className={cn("w-5 h-5 rounded border-2 flex items-center justify-center transition-all", style.strikethrough ? "bg-primary-600 border-primary-600" : "bg-white border-slate-300 group-hover:border-primary-400")}>
                                    {style.strikethrough && <Check size={12} className="text-white stroke-[4]" />}
                                </div>
                                <span className="text-sm text-slate-700 font-medium">Strikethrough</span>
                                <input type="checkbox" className="hidden" checked={!!style.strikethrough} onChange={(e) => onChange('strikethrough', e.target.checked)} />
                            </label>
                            
                            <label className="flex items-center gap-3 cursor-not-allowed opacity-50 group select-none" title="Not available">
                                <div className="w-5 h-5 rounded border-2 border-slate-200 bg-slate-50 flex items-center justify-center"></div>
                                <span className="text-sm text-slate-500 font-medium">Superscript</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-not-allowed opacity-50 group select-none" title="Not available">
                                <div className="w-5 h-5 rounded border-2 border-slate-200 bg-slate-50 flex items-center justify-center"></div>
                                <span className="text-sm text-slate-500 font-medium">Subscript</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Preview Box */}
            <GroupBox label="Preview" className="mt-auto">
                <div className="h-16 flex items-center justify-center overflow-hidden">
                    <span style={{ 
                        fontFamily: style.fontFamily || 'Inter',
                        fontSize: `${Math.min(32, (style.fontSize || 11) * 1.5)}px`,
                        fontWeight: style.bold ? 'bold' : 'normal',
                        fontStyle: style.italic ? 'italic' : 'normal',
                        textDecoration: [
                            style.underline ? 'underline' : '',
                            style.strikethrough ? 'line-through' : ''
                        ].filter(Boolean).join(' '),
                        color: style.color || '#000000'
                    }}>
                        AaBbCcYyZz
                    </span>
                </div>
            </GroupBox>
        </div>
    );
};

export default FontTab;
