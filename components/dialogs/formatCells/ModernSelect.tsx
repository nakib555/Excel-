import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check, Search, X } from 'lucide-react';
import { cn, useSmartPosition } from '../../../utils';
import { AnimatePresence, motion } from 'framer-motion';

interface ModernSelectProps {
    value: string | number;
    options: { value: string | number; label: React.ReactNode; searchTerms?: string; [key: string]: any }[];
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
    const [isMobile, setIsMobile] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const selectedItemRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Detect mobile viewport or touch screen
    useEffect(() => {
        const checkMobile = () => {
            const hasTouch = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
            const isSmallScreen = window.innerWidth < 768;
            setIsMobile(isSmallScreen || (hasTouch && window.innerWidth < 1024));
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Use smart positioning for desktop mode
    const coords = useSmartPosition(isOpen && !isMobile, triggerRef, dropdownRef);

    // Auto-scroll to selected option when mobile drawer opens
    useEffect(() => {
        if (isOpen && isMobile) {
            const timer = setTimeout(() => {
                if (selectedItemRef.current) {
                    selectedItemRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' });
                }
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isOpen, isMobile]);

    // Close on click outside for desktop mode
    useEffect(() => {
        if (!isOpen || isMobile) return;
        const handleClickOutside = (e: MouseEvent | TouchEvent) => {
            if (
                triggerRef.current && !triggerRef.current.contains(e.target as Node) &&
                dropdownRef.current && !dropdownRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside, { passive: true });
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [isOpen, isMobile]);

    const isSearchActive = searchable || (isMobile && options.length > 7);

    const filteredOptions = useMemo(() => {
        if (!isSearchActive || !searchTerm) return options;
        return options.filter(opt => {
            const labelStr = typeof opt.label === 'string' ? opt.label : '';
            const searchStr = (opt.searchTerms || labelStr || String(opt.value)).toLowerCase();
            return searchStr.includes(searchTerm.toLowerCase());
        });
    }, [options, searchTerm, isSearchActive]);

    const selectedOption = options.find(o => o.value === value);

    // Calculate min width to match trigger for desktop
    const minWidth = triggerRef.current ? triggerRef.current.offsetWidth : undefined;

    const handleSelectOption = (optValue: any) => {
        onChange(optValue);
        setIsOpen(false);
        setSearchTerm('');
    };

    return (
        <div className={cn("relative w-full", className)}>
            <button
                ref={triggerRef}
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-full min-h-[40px] bg-white border border-slate-200 rounded-xl px-3 py-2 text-[13px] text-slate-800 flex items-center justify-between transition-all outline-none group cursor-pointer",
                    isOpen ? "border-emerald-500 ring-4 ring-emerald-500/10" : "hover:border-slate-300 hover:shadow-xs"
                )}
            >
                <span className={cn("truncate font-medium flex items-center gap-2 w-full text-left", !selectedOption && "text-slate-400")}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown 
                    size={16} 
                    className={cn(
                        "text-slate-400 transition-transform duration-200 flex-shrink-0 group-hover:text-slate-600", 
                        isOpen && "rotate-180 text-emerald-600"
                    )} 
                />
            </button>
            
            {/* PORTAL RENDERING */}
            {createPortal(
                <AnimatePresence>
                    {/* MOBILE VERSION: Auto Option Showing Bottom Sheet Drawer */}
                    {isOpen && isMobile && (
                        <div className="fixed inset-0 z-[10000] flex flex-col justify-end">
                            {/* Backdrop */}
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => { setIsOpen(false); setSearchTerm(''); }}
                                className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
                            />

                            {/* Mobile Drawer */}
                            <motion.div 
                                initial={{ y: '100%' }}
                                animate={{ y: 0 }}
                                exit={{ y: '100%' }}
                                transition={{ type: "spring", damping: 28, stiffness: 300 }}
                                className="relative z-10 bg-white rounded-t-2xl shadow-2xl max-h-[82vh] flex flex-col overflow-hidden border-t border-slate-200"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Drag Handle */}
                                <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto my-2.5 flex-shrink-0" />

                                {/* Header */}
                                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
                                    <div className="font-semibold text-sm text-slate-800">
                                        {placeholder || 'Select Option'}
                                    </div>
                                    <button 
                                        onClick={() => { setIsOpen(false); setSearchTerm(''); }}
                                        className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>

                                {/* Search Bar (Auto-shown on mobile if searchable or many options) */}
                                {isSearchActive && (
                                    <div className="p-3 border-b border-slate-100 bg-slate-50 flex-shrink-0">
                                        <div className="relative">
                                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                ref={searchInputRef}
                                                type="text"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                placeholder="Search options..."
                                                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 shadow-2xs"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Auto Option Showing List */}
                                <div className="overflow-y-auto scrollbar-thin p-2 space-y-1 flex-1 min-h-0">
                                    {filteredOptions.length > 0 ? (
                                        filteredOptions.map(option => {
                                            const isSelected = option.value === value;
                                            return (
                                                <div
                                                    key={option.value}
                                                    ref={isSelected ? selectedItemRef : null}
                                                    onClick={() => handleSelectOption(option.value)}
                                                    className={cn(
                                                        "px-4 py-3 text-sm cursor-pointer rounded-xl transition-all flex items-center justify-between min-h-[46px] select-none active:scale-[0.99]",
                                                        isSelected 
                                                            ? "bg-emerald-50 text-emerald-900 font-semibold border border-emerald-200/60 shadow-xs" 
                                                            : "text-slate-700 hover:bg-slate-50 active:bg-slate-100"
                                                    )}
                                                >
                                                    <div className="flex-1 truncate mr-3">
                                                        {renderOption ? renderOption(option) : option.label}
                                                    </div>
                                                    {isSelected && (
                                                        <Check size={18} className="text-emerald-600 flex-shrink-0 animate-in fade-in zoom-in duration-150" />
                                                    )}
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="px-4 py-8 text-sm text-slate-400 text-center italic">
                                            No options found
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    )}

                    {/* DESKTOP VERSION: Floating Popover Box */}
                    {isOpen && !isMobile && coords && (
                        <motion.div 
                            ref={dropdownRef}
                            initial={{ opacity: 0, scale: 0.95, y: coords.placement === 'bottom' ? -10 : 10 }}
                            animate={coords.ready ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            className={cn(
                                "fixed z-[9999] bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-xl shadow-2xl flex flex-col overflow-hidden ring-1 ring-black/5 origin-top",
                                coords.placement === 'top' && "origin-bottom"
                            )}
                            style={{ 
                                top: coords.top, 
                                bottom: coords.bottom,
                                left: coords.left, 
                                width: coords.width, 
                                minWidth: minWidth,  
                                maxHeight: coords.maxHeight,
                                transformOrigin: coords.transformOrigin,
                                visibility: coords.ready ? 'visible' : 'hidden' 
                            }}
                        >
                            {searchable && (
                                <div className="p-2 border-b border-slate-100 bg-slate-50/70 sticky top-0 z-10">
                                    <div className="relative">
                                        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Search..."
                                            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                                            autoFocus
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="overflow-y-auto scrollbar-thin p-1.5 space-y-0.5">
                                {filteredOptions.length > 0 ? (
                                    filteredOptions.map(option => {
                                        const isSelected = option.value === value;
                                        return (
                                            <div
                                                key={option.value}
                                                onClick={() => handleSelectOption(option.value)}
                                                className={cn(
                                                    "px-3 py-2 text-[13px] cursor-pointer rounded-lg transition-colors flex items-center justify-between group",
                                                    isSelected 
                                                        ? "bg-emerald-50 text-emerald-800 font-semibold" 
                                                        : "text-slate-700 hover:bg-slate-50"
                                                )}
                                            >
                                                <div className="flex-1 truncate mr-2">
                                                    {renderOption ? renderOption(option) : option.label}
                                                </div>
                                                {isSelected && (
                                                    <Check size={14} className="text-emerald-600 flex-shrink-0 animate-in fade-in zoom-in duration-200" />
                                                )}
                                            </div>
                                        );
                                    })
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
