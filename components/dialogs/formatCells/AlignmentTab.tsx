
import React, { useRef, useEffect, useState } from 'react';
import { Check, RotateCw, AlignLeft, AlignCenter, AlignRight, AlignJustify, AlignHorizontalDistributeCenter, AlignVerticalJustifyStart, AlignVerticalJustifyCenter, AlignVerticalJustifyEnd, AlignVerticalDistributeCenter, ArrowLeftRight, Maximize, LayoutList } from 'lucide-react';
import { cn } from '../../../utils';
import { CellStyle } from '../../../types';
import ModernSelect from './ModernSelect';
import GroupBox from './GroupBox';
import { Tooltip } from '../../shared';

interface AlignmentTabProps {
    style: CellStyle;
    onChange: (key: keyof CellStyle, val: any) => void;
    isMobile: boolean;
}

const AlignmentTab: React.FC<AlignmentTabProps> = ({ style, onChange, isMobile }) => {
    const indentEnabled = style.align === 'left' || style.align === 'right' || style.align === 'distributed';
    const clockRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const calculateAngle = (e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent) => {
        if (!clockRef.current) return 0;
        const rect = clockRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        let clientX, clientY;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as MouseEvent).clientX;
            clientY = (e as MouseEvent).clientY;
        }

        // Angle relative to center-right (0 deg in math)
        // dx, dy coordinates where y increases downwards
        const dx = clientX - centerX;
        const dy = centerY - clientY; // Invert Y so up is positive

        // Atan2(y, x) -> returns angle from X axis.
        // Clockwise in CSS is negative for this calculation context if we want +90 to be Top.
        // Wait, standard unit circle: 0 is Right, 90 is Top.
        // Our Clock UI: 0 is right. +90 is Top. -90 is Bottom.
        
        let angleRad = Math.atan2(dy, dx);
        let angleDeg = Math.round(angleRad * (180 / Math.PI));
        
        // Clamp to -90 to 90 (right semi-circle)
        // If angle is > 90 (left side), we flip it or clamp it?
        // Excel orientation usually goes -90 to 90.
        // If user drags to left side, it usually flips or clamps.
        
        if (angleDeg > 90) angleDeg = 90;
        if (angleDeg < -90) angleDeg = -90;

        return angleDeg;
    };

    const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault(); // Prevent scrolling on touch
        setIsDragging(true);
        const angle = calculateAngle(e);
        onChange('textRotation', angle);
        onChange('verticalText', false);
    };

    useEffect(() => {
        const handleMove = (e: MouseEvent | TouchEvent) => {
            if (!isDragging) return;
            const angle = calculateAngle(e);
            // Throttle slightly if needed, but react state updates are usually fast enough here
            onChange('textRotation', angle);
        };

        const handleEnd = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMove);
            window.addEventListener('touchmove', handleMove, { passive: false });
            window.addEventListener('mouseup', handleEnd);
            window.addEventListener('touchend', handleEnd);
        }

        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('mouseup', handleEnd);
            window.removeEventListener('touchend', handleEnd);
        };
    }, [isDragging, onChange]);

    const HORIZONTAL_OPTIONS = [
        { value: 'general', label: 'General', icon: <LayoutList size={14} className="text-slate-500" /> },
        { value: 'left', label: 'Left (Indent)', icon: <AlignLeft size={14} className="text-blue-500" /> },
        { value: 'center', label: 'Center', icon: <AlignCenter size={14} className="text-purple-500" /> },
        { value: 'right', label: 'Right (Indent)', icon: <AlignRight size={14} className="text-green-500" /> },
        { value: 'fill', label: 'Fill', icon: <Maximize size={14} className="text-orange-500" /> },
        { value: 'justify', label: 'Justify', icon: <AlignJustify size={14} className="text-red-500" /> },
        { value: 'centerAcross', label: 'Center Across Selection', icon: <ArrowLeftRight size={14} className="text-cyan-500" /> },
        { value: 'distributed', label: 'Distributed (Indent)', icon: <AlignHorizontalDistributeCenter size={14} className="text-pink-500" /> },
    ];

    const VERTICAL_OPTIONS = [
        { value: 'top', label: 'Top', icon: <AlignVerticalJustifyStart size={14} className="text-blue-500 rotate-180" /> },
        { value: 'middle', label: 'Center', icon: <AlignVerticalJustifyCenter size={14} className="text-purple-500" /> },
        { value: 'bottom', label: 'Bottom', icon: <AlignVerticalJustifyEnd size={14} className="text-green-500 rotate-180" /> },
        { value: 'justify', label: 'Justify', icon: <AlignJustify size={14} className="text-red-500 rotate-90" /> },
        { value: 'distributed', label: 'Distributed', icon: <AlignVerticalDistributeCenter size={14} className="text-pink-500" /> },
    ];

    const renderOptionWithIcon = (option: any) => (
        <div className="flex items-center gap-3">
            <div className="w-5 flex justify-center items-center">{option.icon}</div>
            <span>{option.label}</span>
        </div>
    );

    return (
        <div className={cn("grid h-full", isMobile ? "grid-cols-1 gap-6 pb-20" : "grid-cols-[1fr_260px] gap-10")}>
            <div className="flex flex-col gap-6">
                <GroupBox label="Text alignment">
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between px-1">
                                <span className="text-[12px] text-slate-500 font-semibold uppercase tracking-wider">Horizontal</span>
                                {indentEnabled && (
                                    <div className="flex items-center gap-3">
                                        <span className="text-[11px] text-slate-400 font-bold">INDENT</span>
                                        <input 
                                            type="number" 
                                            className="w-16 h-8 bg-slate-50 border border-slate-200 rounded-lg px-2 text-[13px] font-mono font-bold text-slate-700 outline-none"
                                            value={style.indent || 0}
                                            onChange={(e) => onChange('indent', Math.max(0, parseInt(e.target.value) || 0))}
                                            min={0}
                                        />
                                    </div>
                                )}
                            </div>
                            <ModernSelect 
                                value={style.align || 'general'}
                                options={HORIZONTAL_OPTIONS}
                                onChange={(val) => onChange('align', val)}
                                renderOption={renderOptionWithIcon}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="text-[12px] text-slate-500 font-semibold uppercase tracking-wider px-1">Vertical</span>
                            <ModernSelect 
                                value={style.verticalAlign || 'bottom'}
                                options={VERTICAL_OPTIONS}
                                onChange={(val) => onChange('verticalAlign', val)}
                                renderOption={renderOptionWithIcon}
                            />
                        </div>
                    </div>
                </GroupBox>

                <GroupBox label="Text control">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-8 py-1">
                        {[
                            { key: 'wrapText', label: 'Wrap text', desc: 'Auto-adjust row height', color: 'bg-emerald-500 border-emerald-500' },
                            { key: 'shrinkToFit', label: 'Shrink to fit', desc: 'Downscale text size', color: 'bg-blue-500 border-blue-500' },
                            { key: 'mergeCells', label: 'Merge cells', desc: 'Combine selected', color: 'bg-indigo-500 border-indigo-500' }
                        ].map(item => (
                            <label key={item.key} className="flex items-center gap-4 cursor-pointer group">
                                <div className={cn(
                                    "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300",
                                    !!(style as any)[item.key] ? `${item.color} shadow-md` : "bg-white border-slate-200"
                                )}>
                                    {!!(style as any)[item.key] && <Check size={14} className="text-white stroke-[3]" />}
                                    <input 
                                        type="checkbox" 
                                        className="sr-only" 
                                        checked={!!(style as any)[item.key]} 
                                        onChange={(e) => {
                                            if (item.key === 'wrapText' && e.target.checked) onChange('shrinkToFit', false);
                                            if (item.key === 'shrinkToFit' && e.target.checked) onChange('wrapText', false);
                                            onChange(item.key as any, e.target.checked);
                                        }} 
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[14px] font-bold text-slate-700">{item.label}</span>
                                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">{item.desc}</span>
                                </div>
                            </label>
                        ))}
                    </div>
                </GroupBox>
            </div>

            <div className="flex flex-col gap-6">
                <GroupBox label="Orientation" className="flex-1 flex flex-col min-h-[360px]">
                    <div className="flex-1 flex flex-col items-center justify-between py-2 gap-8">
                        <div 
                            ref={clockRef}
                            onMouseDown={handleStart}
                            onTouchStart={handleStart}
                            className={cn(
                                "relative w-40 h-40 md:w-44 md:h-44 rounded-full border-4 border-slate-100 bg-white shadow-soft flex items-center justify-center select-none touch-none",
                                isDragging ? "cursor-grabbing" : "cursor-grab"
                            )}
                        >
                            {[...Array(12)].map((_, i) => (
                                <div key={i} className="absolute h-full w-[1.5px] pointer-events-none" style={{ transform: `rotate(${i * 30}deg)` }}>
                                    <div className={cn(
                                        "w-full rounded-full transition-all", 
                                        i % 3 === 0 ? "h-3 bg-slate-300" : "h-1.5 bg-slate-100"
                                    )} />
                                </div>
                            ))}
                            <div className={cn(
                                "absolute inset-0 flex items-center justify-center transition-all duration-500 pointer-events-none",
                                style.verticalText ? "opacity-100 scale-100" : "opacity-10 scale-90"
                            )}>
                                <div className={cn(
                                    "w-10 h-[70%] border-2 rounded-xl flex flex-col items-center justify-center gap-1.5 font-mono text-[9px] font-black tracking-widest",
                                    style.verticalText ? "border-primary-500 text-primary-600 bg-primary-50" : "border-slate-300 text-slate-400"
                                )}>
                                    <span>T</span><span>E</span><span>X</span><span>T</span>
                                </div>
                            </div>
                            <div 
                                className="absolute h-[4px] w-[46%] bg-gradient-to-r from-primary-400 to-primary-600 origin-left top-1/2 left-1/2 transition-transform duration-100 ease-linear shadow-md rounded-full z-20 pointer-events-none"
                                style={{ transform: `rotate(${(style.textRotation || 0) * -1}deg)` }}
                            >
                                <div className="absolute -right-3 -top-2.5 w-6 h-6 bg-white border-4 border-primary-600 rounded-full shadow-xl" />
                            </div>
                            <div className="w-4 h-4 bg-white rounded-full z-30 border-4 border-slate-300 pointer-events-none" />
                        </div>

                        <div className="w-full flex flex-col gap-4">
                             <div className="flex items-center gap-4 bg-slate-900 rounded-2xl p-2 pl-5 border border-slate-800">
                                <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] flex-1">Degrees</span>
                                <div className="flex items-center gap-1 bg-slate-800 rounded-xl p-1 pr-3">
                                    <input 
                                        type="number" 
                                        className="w-12 h-10 bg-transparent text-center text-lg font-mono font-black text-white outline-none"
                                        value={style.textRotation || 0}
                                        onChange={(e) => {
                                            const deg = Math.max(-90, Math.min(90, parseInt(e.target.value) || 0));
                                            onChange('textRotation', deg);
                                            onChange('verticalText', false);
                                        }}
                                        min={-90} max={90}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => { 
                                        const isVertical = !style.verticalText;
                                        onChange('verticalText', isVertical); 
                                        if(isVertical) onChange('textRotation', 0); 
                                    }}
                                    className={cn(
                                        "flex-1 h-12 rounded-xl flex items-center justify-center gap-2 text-[12px] font-bold transition-all border-2",
                                        style.verticalText ? "bg-primary-600 border-primary-600 text-white shadow-lg" : "bg-white border-slate-100 text-slate-500"
                                    )}
                                >
                                    <span className="font-black">Vertical</span>
                                </button>
                                <Tooltip content="Reset Orientation">
                                    <button 
                                        onClick={() => { onChange('textRotation', 0); onChange('verticalText', false); }}
                                        className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all hover:bg-slate-200"
                                    >
                                        <RotateCw size={18} />
                                    </button>
                                </Tooltip>
                            </div>
                        </div>
                    </div>
                </GroupBox>
            </div>
        </div>
    );
};

export default AlignmentTab;
