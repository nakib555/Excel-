
import React, { useRef, memo, useState, useEffect, useMemo } from 'react';
import { FunctionSquare, X, Check, ChevronDown, ListFilter, ChevronRight, Search, Calculator, Type, Calendar, Binary, Database, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { useSmartPosition, cn } from '../utils';

interface FormulaBarProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  selectedCell: string | null;
  onNameBoxSubmit: (cellId: string) => void;
}

const FUNCTION_CATEGORIES = {
  "Recent": { icon: Clock, fns: ['SUM', 'AVERAGE', 'COUNT', 'MAX', 'MIN', 'IF', 'VLOOKUP', 'CONCATENATE', 'TODAY', 'PMT'] },
  "Math": { icon: Calculator, fns: ['SUM', 'AVERAGE', 'MIN', 'MAX', 'COUNT', 'ROUND', 'ABS', 'POWER', 'SQRT', 'SUMIF', 'RAND'] },
  "Text": { icon: Type, fns: ['CONCATENATE', 'LEFT', 'RIGHT', 'MID', 'LEN', 'UPPER', 'LOWER', 'TRIM', 'TEXT', 'SUBSTITUTE'] },
  "Logical": { icon: Binary, fns: ['IF', 'AND', 'OR', 'NOT', 'TRUE', 'FALSE', 'IFERROR'] },
  "Date": { icon: Calendar, fns: ['TODAY', 'NOW', 'DATE', 'YEAR', 'MONTH', 'DAY', 'HOUR', 'MINUTE', 'SECOND'] },
  "Lookup": { icon: Database, fns: ['VLOOKUP', 'HLOOKUP', 'MATCH', 'INDEX', 'ROW', 'COLUMN'] }
};

const FormulaBar: React.FC<FormulaBarProps> = ({ value, onChange, onSubmit, selectedCell, onNameBoxSubmit }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const nameBoxRef = useRef<HTMLInputElement>(null);
  const [nameBoxValue, setNameBoxValue] = useState(selectedCell || '');
  const [showFunctionMenu, setShowFunctionMenu] = useState(false);
  const functionButtonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Function Menu State
  const [activeCategory, setActiveCategory] = useState<keyof typeof FUNCTION_CATEGORIES>('Recent');
  const [searchTerm, setSearchTerm] = useState('');

  // Use smart positioning for the function menu
  const menuPosition = useSmartPosition(showFunctionMenu, functionButtonRef, dropdownRef, { fixedWidth: 384 });

  // Sync name box with selected cell when selection changes externally
  useEffect(() => {
    if (selectedCell) {
        setNameBoxValue(selectedCell);
    }
  }, [selectedCell]);

  // Close dropdown when clicking outside
  useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
          if (functionButtonRef.current && !functionButtonRef.current.contains(e.target as Node) &&
              dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
              setShowFunctionMenu(false);
          }
      };
      if(showFunctionMenu) window.addEventListener('click', handleClickOutside);
      return () => window.removeEventListener('click', handleClickOutside);
  }, [showFunctionMenu]);

  // Reset menu state on open
  useEffect(() => {
      if (showFunctionMenu) {
          setSearchTerm('');
          setActiveCategory('Recent');
      }
  }, [showFunctionMenu]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur(); 
      onSubmit();
    }
  };

  const handleNameBoxKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        submitNameBox();
    }
  };

  const submitNameBox = () => {
      if (nameBoxValue.trim()) {
          onNameBoxSubmit(nameBoxValue.toUpperCase());
          nameBoxRef.current?.blur();
      }
  };

  const handleFunctionClick = (e: React.MouseEvent, fn: string) => {
      e.stopPropagation();
      let newValue = value;
      const fnStr = `${fn}()`;
      
      if (!newValue || newValue === '=') {
          newValue = `=${fnStr}`;
      } else {
          newValue = newValue + fnStr;
      }
      
      onChange(newValue);
      setShowFunctionMenu(false);
      
      // Focus input
      setTimeout(() => {
          if (inputRef.current) {
              inputRef.current.focus();
              // Try to place cursor inside parentheses
              const len = inputRef.current.value.length;
              inputRef.current.setSelectionRange(len - 1, len - 1);
          }
      }, 0);
  };

  const toggleMenu = (e: React.MouseEvent) => {
      e.stopPropagation();
      setShowFunctionMenu(!showFunctionMenu);
  };

  const displayedFunctions = useMemo(() => {
      if (searchTerm) {
          // Search across all categories
          const allFns = new Set<string>();
          Object.values(FUNCTION_CATEGORIES).forEach(cat => cat.fns.forEach(fn => allFns.add(fn)));
          return Array.from(allFns).filter(fn => fn.toLowerCase().includes(searchTerm.toLowerCase())).sort();
      }
      return FUNCTION_CATEGORIES[activeCategory].fns;
  }, [searchTerm, activeCategory]);

  return (
    <div className="flex items-center h-12 px-2 md:px-4 border-b border-slate-200 bg-white gap-2 md:gap-3 shadow-sm z-30">
      {/* Name Box (Interactive Cell Indicator) */}
      <div className="relative group flex items-center">
        <input 
            ref={nameBoxRef}
            type="text"
            className="w-24 md:w-32 h-8 bg-white border border-slate-300 rounded-md text-base md:text-xs font-semibold text-slate-700 font-mono shadow-sm hover:border-slate-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all pl-2 pr-7 text-center uppercase placeholder:text-slate-300"
            value={nameBoxValue}
            onChange={(e) => setNameBoxValue(e.target.value)}
            onKeyDown={handleNameBoxKeyDown}
            onFocus={(e) => e.target.select()}
            placeholder={selectedCell || "A1"}
            title="Name Box: Enter cell (e.g. A500) and press Enter to jump"
        />
        <button
            onClick={submitNameBox}
            className="absolute right-1 top-1 bottom-1 w-6 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors z-10"
            title="Go to Cell"
        >
            <ChevronRight size={14} strokeWidth={2.5} />
        </button>
        <div className="absolute top-1/2 -right-3 -translate-y-1/2 w-[1px] h-5 bg-slate-300 hidden md:block"></div>
      </div>

      {/* Function Icons & Controls */}
      <div className="flex items-center gap-1 text-slate-400 pl-1 md:pl-2 flex-shrink-0">
        <div className="hidden md:flex items-center gap-1">
            <button className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-red-500 transition-colors" title="Cancel">
                <X size={14} />
            </button>
            <button 
                className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-green-600 transition-colors" 
                title="Enter"
                onClick={onSubmit}
            >
                <Check size={14} />
            </button>
        </div>
        
        {/* Function Dropdown */}
        <div className="relative">
            <button 
                ref={functionButtonRef}
                onClick={toggleMenu}
                className={cn(
                    "p-1 hover:bg-slate-100 rounded transition-colors ml-1 flex items-center gap-0.5",
                    showFunctionMenu ? 'bg-slate-100 text-slate-700' : 'text-slate-500'
                )} 
                title="Insert Function"
            >
                <span className="font-serif italic font-bold text-sm px-0.5">fx</span>
                <ChevronDown size={10} className="opacity-50 hidden md:block" />
            </button>

            {/* Portal for menu */}
            {showFunctionMenu && menuPosition && createPortal(
                <AnimatePresence>
                    <motion.div 
                        ref={dropdownRef}
                        initial={{ opacity: 0, y: menuPosition.placement === 'bottom' ? -5 : 5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: menuPosition.placement === 'bottom' ? -5 : 5, scale: 0.95 }}
                        transition={{ duration: 0.1 }}
                        className="fixed bg-white border border-slate-200 shadow-xl rounded-lg z-[2000] flex flex-col overflow-hidden ring-1 ring-black/5"
                        style={{
                            top: menuPosition.top,
                            bottom: menuPosition.bottom,
                            left: menuPosition.left,
                            maxHeight: 400,
                            transformOrigin: menuPosition.transformOrigin,
                            width: menuPosition.width // Dynamically set by useSmartPosition logic
                        }}
                    >
                        {/* Search Bar */}
                        <div className="p-2 border-b border-slate-100 bg-slate-50/50">
                            <div className="relative">
                                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input 
                                    type="text" 
                                    placeholder="Search functions..."
                                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    autoFocus
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>
                        </div>

                        <div className="flex flex-1 min-h-0">
                            {/* Categories Sidebar */}
                            <div className="w-1/3 bg-slate-50 border-r border-slate-200 flex flex-col overflow-y-auto scrollbar-thin">
                                {Object.keys(FUNCTION_CATEGORIES).map((cat) => {
                                    const category = cat as keyof typeof FUNCTION_CATEGORIES;
                                    const Icon = FUNCTION_CATEGORIES[category].icon;
                                    const isActive = activeCategory === category;
                                    return (
                                        <button
                                            key={cat}
                                            onClick={(e) => { e.stopPropagation(); setActiveCategory(category); setSearchTerm(''); }}
                                            className={cn(
                                                "px-3 py-2 text-[11px] font-medium text-left flex items-center gap-2 transition-colors",
                                                isActive ? "bg-white text-emerald-700 shadow-sm border-r-2 border-r-emerald-500" : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                                            )}
                                        >
                                            <Icon size={12} className={isActive ? "text-emerald-500" : "text-slate-400"} />
                                            {/* Hide label on very small screens? Maybe just clip it. */}
                                            <span className="truncate">{cat}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Functions List */}
                            <div className="w-2/3 flex flex-col overflow-hidden bg-white">
                                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-white border-b border-slate-50 flex-shrink-0">
                                    {searchTerm ? 'Search Results' : activeCategory}
                                </div>
                                <div className="overflow-y-auto scrollbar-thin flex-1 p-1">
                                    {displayedFunctions.length > 0 ? (
                                        displayedFunctions.map(fn => (
                                            <button
                                                key={fn}
                                                className="w-full text-left px-3 py-1.5 hover:bg-emerald-50 text-xs text-slate-700 hover:text-emerald-800 font-medium font-mono flex items-center gap-2 group transition-colors rounded-md"
                                                onClick={(e) => handleFunctionClick(e, fn)}
                                            >
                                                <FunctionSquare size={12} className="opacity-30 group-hover:opacity-100 group-hover:text-emerald-500 transition-opacity" />
                                                {fn}
                                            </button>
                                        ))
                                    ) : (
                                        <div className="p-4 text-center text-xs text-slate-400 italic">
                                            No functions found.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <div className="border-t border-slate-100 p-2 bg-slate-50/30 flex justify-end">
                            <button 
                                className="text-[10px] text-blue-600 hover:underline flex items-center gap-1"
                                onClick={(e) => e.stopPropagation()}
                            >
                                More functions <ChevronRight size={10} />
                            </button>
                        </div>
                    </motion.div>
                </AnimatePresence>,
                document.body
            )}
        </div>
      </div>

      {/* Input Field */}
      <div className="flex-1 relative group h-8">
          <input
            ref={inputRef}
            type="text"
            className="w-full h-full px-2 md:px-3 text-base md:text-sm text-slate-800 bg-white border-none outline-none focus:ring-0 font-mono placeholder:text-slate-300"
            style={{ fontSize: 'max(16px, 0.875rem)' }} /* Prevent iOS zoom */
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={selectedCell ? "Enter value or formula..." : ""}
            disabled={!selectedCell}
            spellCheck={false}
          />
          {/* Bottom active indicator */}
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-transparent group-focus-within:bg-primary-500 transition-colors" />
      </div>
      
      {/* Expand button */}
      <button className="p-1 hover:bg-slate-100 rounded text-slate-400 md:block hidden">
          <div className="w-4 h-1 bg-slate-300 rounded-full mb-0.5"></div>
          <div className="w-4 h-1 bg-slate-300 rounded-full"></div>
      </button>
    </div>
  );
};

export default memo(FormulaBar);
