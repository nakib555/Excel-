
import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '../../../utils';

interface ModernSelectProps {
    value: string;
    options: { value: string; label: React.ReactNode }[];
    onChange: (val: string) => void;
    className?: string;
}

const ModernSelect: React.FC<ModernSelectProps> = ({ 
    value, 
    options, 
    onChange, 
    className 
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [coords, setCoords] = useState<{ top: number; left: number; width: number } | null>(null);

    const updateCoords = () => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setCoords({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
                width: rect.width
            });
        }
    };

    useLayoutEffect(() => {
        if (isOpen) {
            updateCoords();
            window.addEventListener('scroll', updateCoords, true);
            window.addEventListener('resize', updateCoords);
        }
        return () => {
            window.removeEventListener('scroll', updateCoords, true);
            window.removeEventListener('resize', updateCoords);
        };
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                triggerRef.current && !triggerRef.current.contains(event.target as Node) &&
                dropdownRef.current && !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        if (isOpen) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const selectedLabel = options.find(o => o.value === value)?.label || value;

    return (
        <div className={cn("relative", className)}>
            <button
                ref={triggerRef}
                onClick={() => setIsOpen(!isOpen)}
                className="w-full h-10 bg-white border border-slate-200 rounded-xl px-4 text-[13px] text-slate-800 flex items-center justify-between hover:border-primary-400 hover:shadow-sm transition-all focus:ring-4 focus:ring-primary-500/10 outline-none"
            >
                <span className="truncate font-medium flex items-center gap-2 w-full">{selectedLabel}</span>
                <ChevronDown size={16} className={cn("text-slate-400 transition-transform duration-300 flex-shrink-0", isOpen && "rotate-180")} />
            </button>
            
            {isOpen && coords && createPortal(
                <div 
                    ref={dropdownRef}
                    className="fixed z-[9999] bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 ring-1 ring-black/5"
                    style={{ 
                        top: coords.top + 4, 
                        left: coords.left, 
                        width: coords.width,
                        maxHeight: '300px'
                    }}
                >
                    <div className="overflow-y-auto max-h-[290px] py-1.5 scrollbar-thin">
                        {options.map(option => (
                            <div
                                key={option.value}
                                onClick={() => { onChange(option.value); setIsOpen(false); }}
                                className={cn(
                                    "px-4 py-2.5 text-[13px] cursor-pointer hover:bg-slate-50 text-slate-700 transition-colors flex items-center justify-between mx-1 rounded-lg",
                                    option.value === value && "bg-primary-50 text-primary-700 font-bold hover:bg-primary-50"
                                )}
                            >
                                <span className="flex items-center gap-2">{option.label}</span>
                                {option.value === value && <Check size={14} className="text-primary-600" />}
                            </div>
                        ))}
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default ModernSelect;
