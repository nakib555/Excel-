import React, { useState } from 'react';
import { Clipboard, Calculator, Binary, Paintbrush, ArrowLeftRight } from 'lucide-react';
import { RibbonButton, SmartDropdown, Tooltip } from '../../shared';

interface PasteProps {
  onPaste?: () => void;
  onPasteSpecial?: (mode: 'all' | 'formulas' | 'values' | 'formats' | 'transpose') => void;
}

const Paste: React.FC<PasteProps> = ({ onPaste, onPasteSpecial }) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (mode: 'all' | 'formulas' | 'values' | 'formats' | 'transpose') => {
    if (onPasteSpecial) {
      onPasteSpecial(mode);
    } else if (onPaste) {
      onPaste();
    }
    setOpen(false);
  };

  return (
    <div className="flex items-center h-full">
      <SmartDropdown
        open={open}
        onToggle={() => setOpen(!open)}
        contentWidth="w-52"
        trigger={
          <div className="flex flex-col items-center justify-center h-full">
            <RibbonButton 
              variant="large" 
              icon={<Clipboard size={20} className="stroke-[1.75] text-blue-600" />} 
              label="Paste" 
              onClick={onPaste || (() => {})}
              title="Paste (Ctrl+V)"
              hasDropdown
              active={open}
            />
          </div>
        }
      >
        <div className="flex flex-col py-1">
          <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50 mb-1">
            Paste Options
          </div>
          <Tooltip content="Paste everything (content and formatting)" side="right">
            <button 
              onClick={() => handleSelect('all')}
              className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors text-left w-full group"
            >
              <Clipboard size={14} className="text-blue-600" />
              <span className="flex-1 font-medium">Paste All</span>
              <span className="text-[9px] text-slate-400 font-mono">Ctrl+V</span>
            </button>
          </Tooltip>
          <Tooltip content="Paste formulas without formatting" side="right">
            <button 
              onClick={() => handleSelect('formulas')}
              className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors text-left w-full group"
            >
              <Calculator size={14} className="text-purple-600" />
              <span>Formulas</span>
            </button>
          </Tooltip>
          <Tooltip content="Paste values only (calculated results)" side="right">
            <button 
              onClick={() => handleSelect('values')}
              className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors text-left w-full group"
            >
              <Binary size={14} className="text-emerald-600" />
              <span>Values (123)</span>
            </button>
          </Tooltip>
          <Tooltip content="Paste cell formatting only" side="right">
            <button 
              onClick={() => handleSelect('formats')}
              className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors text-left w-full group"
            >
              <Paintbrush size={14} className="text-orange-500" />
              <span>Formatting (%$)</span>
            </button>
          </Tooltip>
          <div className="h-[1px] bg-slate-100 my-1 mx-2" />
          <Tooltip content="Transpose rows and columns" side="right">
            <button 
              onClick={() => handleSelect('transpose')}
              className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors text-left w-full group"
            >
              <ArrowLeftRight size={14} className="text-teal-600" />
              <span>Transpose</span>
            </button>
          </Tooltip>
        </div>
      </SmartDropdown>
    </div>
  );
};

export default Paste;