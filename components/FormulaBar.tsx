import React, { useRef } from 'react';
import { FunctionSquare } from 'lucide-react';
import { motion } from 'framer-motion';

interface FormulaBarProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  selectedCell: string | null;
}

const FormulaBar: React.FC<FormulaBarProps> = ({ value, onChange, onSubmit, selectedCell }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur(); 
      onSubmit();
    }
  };

  return (
    <div className="flex items-center h-10 md:h-12 px-2 md:px-4 border-b border-slate-200 bg-slate-50 gap-2 md:gap-3">
      {/* Cell Indicator */}
      <div className="flex-shrink-0 w-8 md:w-12 h-7 md:h-8 bg-white border border-slate-200 rounded-md shadow-sm flex items-center justify-center text-[10px] md:text-xs font-bold text-slate-600 font-mono">
        {selectedCell || ''}
      </div>

      {/* Function Icon - Hidden on mobile */}
      <div className="text-slate-400 hidden md:block">
        <FunctionSquare size={18} />
      </div>

      {/* Input Field */}
      <div className="flex-1 relative group">
          <input
            ref={inputRef}
            type="text"
            className="w-full h-7 md:h-8 px-2 md:px-3 text-xs md:text-sm text-slate-800 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 font-mono transition-all placeholder:text-slate-300"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={selectedCell ? "Enter value..." : "Select cell"}
            disabled={!selectedCell}
          />
      </div>
    </div>
  );
};

export default FormulaBar;