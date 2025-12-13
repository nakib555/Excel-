
import React, { memo } from 'react';
import { Minus, Plus, X, MoveHorizontal, MoveVertical } from 'lucide-react';
import { cn } from '../utils';

interface MobileResizeToolProps {
  isOpen: boolean;
  onClose: () => void;
  activeCell: string | null;
  onResizeRow: (delta: number) => void;
  onResizeCol: (delta: number) => void;
}

const MobileResizeTool: React.FC<MobileResizeToolProps> = ({ 
  isOpen, 
  onClose, 
  activeCell, 
  onResizeRow, 
  onResizeCol 
}) => {
  if (!isOpen) return null;

  return (
    // Positioned at bottom-[84px] to sit clearly above the SheetTabs (40px) + StatusBar (36px) stack = 76px
    <div className="fixed bottom-[84px] left-4 right-4 md:hidden z-[1000] animate-in slide-in-from-bottom-5 fade-in duration-200">
      <div className="bg-white/95 backdrop-blur-md border border-slate-200 shadow-2xl rounded-xl p-4 flex flex-col gap-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
                {/* Green pill indicator matching the screenshot */}
                <div className="w-1.5 h-5 bg-emerald-500 rounded-full shadow-sm"></div>
                <span className="font-bold text-slate-800 text-sm tracking-tight">Resize {activeCell || 'Cell'}</span>
            </div>
            <button 
                onClick={onClose}
                className="p-1.5 -mr-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
                <X size={18} />
            </button>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 gap-4">
            
            {/* Column Width Control */}
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 w-20 text-slate-500 text-xs font-semibold">
                    <MoveHorizontal size={14} className="text-slate-400" /> Width
                </div>
                <div className="flex-1 flex items-center justify-between bg-slate-100/80 rounded-lg p-1 border border-slate-100">
                    <button 
                        onClick={() => onResizeCol(-5)}
                        className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm border border-slate-200/50 text-slate-600 active:scale-95 transition-all hover:border-slate-300"
                    >
                        <Minus size={14} strokeWidth={2.5} />
                    </button>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Column</span>
                    <button 
                        onClick={() => onResizeCol(5)}
                        className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm border border-slate-200/50 text-slate-600 active:scale-95 transition-all hover:border-slate-300"
                    >
                        <Plus size={14} strokeWidth={2.5} />
                    </button>
                </div>
            </div>

            {/* Row Height Control */}
            <div className="flex items-center gap-3">
                 <div className="flex items-center gap-2 w-20 text-slate-500 text-xs font-semibold">
                    <MoveVertical size={14} className="text-slate-400" /> Height
                </div>
                <div className="flex-1 flex items-center justify-between bg-slate-100/80 rounded-lg p-1 border border-slate-100">
                     <button 
                        onClick={() => onResizeRow(-5)}
                        className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm border border-slate-200/50 text-slate-600 active:scale-95 transition-all hover:border-slate-300"
                    >
                        <Minus size={14} strokeWidth={2.5} />
                    </button>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Row</span>
                    <button 
                        onClick={() => onResizeRow(5)}
                        className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm border border-slate-200/50 text-slate-600 active:scale-95 transition-all hover:border-slate-300"
                    >
                        <Plus size={14} strokeWidth={2.5} />
                    </button>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default memo(MobileResizeTool);
