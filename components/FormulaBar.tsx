import React, { useRef, memo, useState, useEffect } from 'react';
import { FunctionSquare, X, Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface FormulaBarProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  selectedCell: string | null;
  onNameBoxSubmit: (cellId: string) => void;
}

const FormulaBar: React.FC<FormulaBarProps> = ({ value, onChange, onSubmit, selectedCell, onNameBoxSubmit }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const nameBoxRef = useRef<HTMLInputElement>(null);
  const [nameBoxValue, setNameBoxValue] = useState(selectedCell || '');

  // Sync name box with selected cell when selection changes externally
  useEffect(() => {
    if (selectedCell) {
        setNameBoxValue(selectedCell);
    }
  }, [selectedCell]);

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

  return (
    <div className="flex items-center h-12 px-2 md:px-4 border-b border-slate-200 bg-white gap-2 md:gap-3 shadow-sm z-30">
      {/* Name Box (Interactive Cell Indicator) */}
      <div className="relative group">
        <input 
            ref={nameBoxRef}
            type="text"
            className="w-24 md:w-32 h-8 bg-white border border-slate-300 rounded-[4px] flex items-center justify-center text-xs font-semibold text-slate-700 font-mono shadow-sm hover:border-slate-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all px-2 text-center uppercase placeholder:text-slate-300"
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
        <button className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-green-600 transition-colors" title="Enter">
             <Check size={14} />
        </button>
        <button className="p-1 hover:bg-slate-100 rounded text-slate-500 transition-colors ml-1" title="Insert Function">
             <FunctionSquare size={16} />
        </button>
      </div>
      
      {/* Function Icon - Mobile placeholder */}
      <div className="md:hidden text-slate-400">
          <FunctionSquare size={16} />
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