
import React, { useRef, memo, useState, useEffect } from 'react';
import { FunctionSquare, X, Check, ChevronDown, ListFilter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FormulaBarProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  selectedCell: string | null;
  onNameBoxSubmit: (cellId: string) => void;
}

const RECENT_FUNCTIONS = [
    'SUM', 'AVERAGE', 'COUNT', 'MAX', 'MIN', 'IF', 'VLOOKUP', 'CONCATENATE', 'TODAY', 'PMT'
];

const FormulaBar: React.FC<FormulaBarProps> = ({ value, onChange, onSubmit, selectedCell, onNameBoxSubmit }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const nameBoxRef = useRef<HTMLInputElement>(null);
  const [nameBoxValue, setNameBoxValue] = useState(selectedCell || '');
  const [showFunctionMenu, setShowFunctionMenu] = useState(false);

  // Sync name box with selected cell when selection changes externally
  useEffect(() => {
    if (selectedCell) {
        setNameBoxValue(selectedCell);
    }
  }, [selectedCell]);

  // Close dropdown when clicking outside
  useEffect(() => {
      const close = () => setShowFunctionMenu(false);
      if (showFunctionMenu) window.addEventListener('click', close);
      return () => window.removeEventListener('click', close);
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
        nameBoxRef.current?.blur();
        if (nameBoxValue.trim()) {
            onNameBoxSubmit(nameBoxValue.toUpperCase());
        }
    }
  };

  const handleFunctionClick = (e: React.MouseEvent, fn: string) => {
      e.stopPropagation();
      let newValue = value;
      const fnStr = `${fn}()`;
      
      if (!newValue || newValue === '=') {
          newValue = `=${fnStr}`;
      } else {
          // If simply appending, ensure we have an operator or it's the start
          // For simplicity in this demo, we just append or set.
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

  return (
    <div className="flex items-center h-12 px-2 md:px-4 border-b border-slate-200 bg-white gap-2 md:gap-3 shadow-sm z-30">
      {/* Name Box (Interactive Cell Indicator) */}
      <div className="relative group">
        <input 
            ref={nameBoxRef}
            type="text"
            className="w-24 md:w-32 h-8 bg-white border border-slate-300 rounded-md flex items-center justify-center text-xs font-semibold text-slate-700 font-mono shadow-sm hover:border-slate-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all px-2 text-center uppercase placeholder:text-slate-300"
            value={nameBoxValue}
            onChange={(e) => setNameBoxValue(e.target.value)}
            onKeyDown={handleNameBoxKeyDown}
            onFocus={(e) => e.target.select()}
            placeholder={selectedCell || "A1"}
            title="Name Box: Enter cell (e.g. A500) and press Enter to jump"
        />
        <div className="absolute top-1/2 -right-3 -translate-y-1/2 w-[1px] h-5 bg-slate-300 hidden md:block"></div>
      </div>

      {/* Function Icons - Desktop */}
      <div className="flex items-center gap-1 text-slate-400 hidden md:flex pl-2">
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
        
        {/* Function Dropdown */}
        <div className="relative">
            <button 
                onClick={(e) => { e.stopPropagation(); setShowFunctionMenu(!showFunctionMenu); }}
                className={`p-1 hover:bg-slate-100 rounded transition-colors ml-1 flex items-center gap-0.5 ${showFunctionMenu ? 'bg-slate-100 text-slate-700' : 'text-slate-500'}`} 
                title="Insert Function"
            >
                <span className="font-serif italic font-bold text-sm px-0.5">fx</span>
                <ChevronDown size={10} className="opacity-50" />
            </button>

            <AnimatePresence>
                {showFunctionMenu && (
                    <motion.div 
                        initial={{ opacity: 0, y: -5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -5, scale: 0.95 }}
                        transition={{ duration: 0.1 }}
                        className="absolute top-full left-0 mt-1 w-56 bg-white border border-slate-200 shadow-xl rounded-md z-50 flex flex-col py-1 overflow-hidden origin-top-left ring-1 ring-black/5"
                    >
                        <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-100 mb-1 flex items-center justify-between">
                            <span>Most Recently Used</span>
                            <ListFilter size={10} />
                        </div>
                        <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                            {RECENT_FUNCTIONS.map(fn => (
                                <button
                                    key={fn}
                                    className="w-full text-left px-4 py-2 hover:bg-emerald-50 text-xs text-slate-700 hover:text-emerald-700 font-medium font-mono flex items-center gap-2 group transition-colors"
                                    onClick={(e) => handleFunctionClick(e, fn)}
                                >
                                    <FunctionSquare size={12} className="opacity-30 group-hover:opacity-100 group-hover:text-emerald-500 transition-opacity" />
                                    {fn}
                                </button>
                            ))}
                        </div>
                        <div className="border-t border-slate-100 mt-1 pt-1">
                            <button className="w-full text-left px-4 py-2 hover:bg-slate-50 text-xs text-slate-500 italic transition-colors">
                                More functions...
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </div>
      
      {/* Function Icon - Mobile placeholder */}
      <div className="md:hidden text-slate-400">
          <span className="font-serif italic font-bold text-sm px-0.5">fx</span>
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
