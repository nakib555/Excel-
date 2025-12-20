
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check, Search } from 'lucide-react';
import { cn, useSmartPosition } from '../../../utils';
import { AnimatePresence, motion } from 'framer-motion';

interface ModernSelectProps {
    value: string | number;
    options: { value: string | number; label: React.ReactNode; searchTerms?: string }[];
    onChange: (val: any) => void;
    placeholder?: string;
    searchable?: boolean;
    className?: string;
    renderOption?: (option: any) => React.ReactNode;
}

const ModernSelect: React.FC<ModernSelectProps> = ({ 
    value, 
    options, 
    onChange, 
    placeholder = "Select...",
    searchable = false,
    className,
    renderOption
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const triggerRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    
    // Use centralized positioning
    const coords = useSmartPosition(isOpen, triggerRef, dropdownRef);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent | TouchEvent) => {
            if (
                triggerRef.current && !triggerRef.current.contains(e.target as Node) &&
                dropdownRef.current && !dropdownRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside, { passive: true });
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [isOpen]);

    const filteredOptions = useMemo(() => {
        if (!searchable || !searchTerm) return options;
        return options.filter(opt => {
            const labelStr = typeof opt.label === 'string' ? opt.label : '';
            const searchStr = (opt.searchTerms || labelStr || String(opt.value)).toLowerCase();
            return searchStr.includes(searchTerm.toLowerCase());
        });
    }, [options, searchTerm, searchable]);

    const selectedOption = options.find(o => o.value === value);

    return (
        <div className={cn("relative w-full", className)}>
            <button
                ref={triggerRef}
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-full min-h-[40px] bg-white border border-slate-200 rounded-xl px-3 py-2 text-[13px] text-slate-800 flex items-center justify-between transition-all outline-none group",
                    isOpen ? "border-primary-500 ring-4 ring-primary-500/10" : "hover:border-slate-300 hover:shadow-sm"
                )}
            >
                <span className={cn("truncate font-medium flex items-center gap-2 w-full text-left", !selectedOption && "text-slate-400")}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown 
                    size={16} 
                    className={cn(
                        "text-slate-400 transition-transform duration-300 flex-shrink-0 group-hover:text-slate-600", 
                        isOpen && "rotate-180 text-primary-500"
                    )} 
                />
            </button>
            
            {createPortal(
                <AnimatePresence>
                    {isOpen && coords && (
                        <motion.div 
                            ref={dropdownRef}
                            initial={{ opacity: 0, scale: 0.95, y: coords.placement === 'bottom' ? -10 : 10 }}
                            animate={coords.ready ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            className={cn(
                                "fixed z-[9999] bg-white/95 backdrop-blur-xl border border-slate-200 rounded-xl shadow-2xl flex flex-col overflow-hidden ring-1 ring-black/5 origin-top",
                                coords.placement === 'top' && "origin-bottom"
                            )}
                            style={{ 
                                top: coords.top, 
                                bottom: coords.bottom,
                                left: coords.left, 
                                width: coords.width,
                                maxHeight: coords.maxHeight,
                                transformOrigin: coords.transformOrigin,
                                // Wait for ready state before showing
                                visibility: coords.ready ? 'visible' : 'hidden' 
                            }}
                        >
                            {searchable && (
                                <div className="p-2 border-b border-slate-100 bg-slate-50/50 sticky top-0 z-10">
                                    <div className="relative">
                                        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Search..."
                                            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/10"
                                            autoFocus
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="overflow-y-auto scrollbar-thin p-1.5">
                                {filteredOptions.length > 0 ? (
                                    filteredOptions.map(option => (
                                        <div
                                            key={option.value}
                                            onClick={() => { onChange(option.value); setIsOpen(false); setSearchTerm(''); }}
                                            className={cn(
                                                "px-3 py-2 text-[13px] cursor-pointer rounded-lg transition-colors flex items-center justify-between group",
                                                option.value === value 
                                                    ? "bg-primary-50 text-primary-700 font-semibold" 
                                                    : "text-slate-700 hover:bg-slate-50"
                                            )}
                                        >
                                            <div className="flex-1 truncate mr-2">
                                                {renderOption ? renderOption(option) : option.label}
                                            </div>
                                            {option.value === value && (
                                                <Check size={14} className="text-primary-600 flex-shrink-0 animate-in fade-in zoom-in duration-200" />
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="px-4 py-3 text-xs text-slate-400 text-center italic">
                                        No matches found
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
};

export default ModernSelect;
