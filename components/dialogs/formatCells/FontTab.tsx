
import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../../utils';
import { CellStyle } from '../../../types';
import ModernSelect from './ModernSelect';
import ScrollableList from './ScrollableList';
import GroupBox from './GroupBox';

interface FontTabProps {
    style: CellStyle;
    onChange: (key: keyof CellStyle, val: any) => void;
    isMobile: boolean;
}

const FontTab: React.FC<FontTabProps> = ({ style, onChange, isMobile }) => (
    <div className="flex flex-col h-full gap-6 pb-4">
        {/* Top Section: Font, Style, Size */}
        <div className={cn("grid gap-4", isMobile ? "grid-cols-1" : "grid-cols-[1fr_160px_100px]")}>
            {/* Font Family */}
            <div className="flex flex-col gap-2">
                <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider px-1">Typeface</span>
                <div className="border border-slate-200 rounded-xl bg-slate-50/50 p-1 flex flex-col flex-1 min-h-[160px] max-h-[200px]">
                    <input 
                        type="text" 
                        value={style.fontFamily || 'Inter'} 
                        onChange={(e) => onChange('fontFamily', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium mb-1 focus:ring-2 focus:ring-primary-100 outline-none"
                    />
                    <ScrollableList 
                        items={['Inter', 'Arial', 'Calibri', 'Times New Roman', 'Courier New', 'Verdana', 'Georgia', 'Trebuchet MS', 'Comic Sans MS']}
                        selected={style.fontFamily || 'Inter'}
                        onSelect={(val) => onChange('fontFamily', val)}
                        className="flex-1 border-0 bg-transparent shadow-none"
                        itemStyle={(font) => ({ fontFamily: font as string })}
                    />
                </div>
            </div>

            {/* Font Style */}
            <div className="flex flex-col gap-2">
                <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider px-1">Style</span>
                <div className="border border-slate-200 rounded-xl bg-slate-50/50 p-1 flex flex-col flex-1 min-h-[160px] max-h-[200px]">
                    <input 
                        type="text" 
                        value={style.bold && style.italic ? 'Bold Italic' : style.bold ? 'Bold' : style.italic ? 'Italic' : 'Regular'} 
                        readOnly
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium mb-1 focus:outline-none text-slate-500"
                    />
                    <ScrollableList 
                        items={['Regular', 'Italic', 'Bold', 'Bold Italic']}
                        selected={style.bold && style.italic ? 'Bold Italic' : style.bold ? 'Bold' : style.italic ? 'Italic' : 'Regular'}
                        onSelect={(s) => { onChange('bold', s.includes('Bold')); onChange('italic', s.includes('Italic')); }}
                        className="flex-1 border-0 bg-transparent shadow-none"
                        itemStyle={(s) => ({ 
                            fontWeight: s.includes('Bold') ? 'bold' : 'normal', 
                            fontStyle: s.includes('Italic') ? 'italic' : 'normal' 
                        })}
                    />
                </div>
            </div>

            {/* Font Size */}
            <div className="flex flex-col gap-2">
                <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider px-1">Size</span>
                <div className="border border-slate-200 rounded-xl bg-slate-50/50 p-1 flex flex-col flex-1 min-h-[160px] max-h-[200px]">
                    <input 
                        type="number" 
                        value={style.fontSize || 11} 
                        onChange={(e) => onChange('fontSize', parseInt(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium mb-1 focus:ring-2 focus:ring-primary-100 outline-none"
                    />
                    <ScrollableList 
                        items={[8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72]}
                        selected={style.fontSize || 11}
                        onSelect={(val) => onChange('fontSize', val)}
                        className="flex-1 border-0 bg-transparent shadow-none"
                    />
                </div>
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

export default FontTab;
