
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
    <div className="fixed bottom-14 left-4 right-4 md:hidden z-[100] animate-in slide-in-from-bottom-5 fade-in duration-200">
      <div className="bg-white/90 backdrop-blur-md border border-slate-200 shadow-2xl rounded-xl p-4 flex flex-col gap-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center gap-2">
                <div className="w-2 h-6 bg-emerald-500 rounded-full"></div>
                <span className="font-semibold text-slate-800 text-sm">Resize {activeCell || 'Cell'}</span>
            </div>
            <button 
                onClick={onClose}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-500"
            >
                <X size={18} />
            </button>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 gap-3">
            
            {/* Column Width Control */}
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 w-24 text-slate-500 text-xs font-medium">
                    <MoveHorizontal size={14} /> Width
                </div>
                <div className="flex-1 flex items-center justify-between bg-slate-100 rounded-lg p-1">
                    <button 
                        onClick={() => onResizeCol(-5)}
                        className="p-2 bg-white rounded shadow-sm text-slate-700 active:scale-95 transition-transform"
                    >
                        <Minus size={16} />
                    </button>
                    <span className="text-xs font-bold text-slate-400">Column</span>
                    <button 
                        onClick={() => onResizeCol(5)}
                        className="p-2 bg-white rounded shadow-sm text-slate-700 active:scale-95 transition-transform"
                    >
                        <Plus size={16} />
                    </button>
                </div>
            </div>

            {/* Row Height Control */}
            <div className="flex items-center gap-3">
                 <div className="flex items-center gap-2 w-24 text-slate-500 text-xs font-medium">
                    <MoveVertical size={14} /> Height
                </div>
                <div className="flex-1 flex items-center justify-between bg-slate-100 rounded-lg p-1">
                     <button 
                        onClick={() => onResizeRow(-5)}
                        className="p-2 bg-white rounded shadow-sm text-slate-700 active:scale-95 transition-transform"
                    >
                        <Minus size={16} />
                    </button>
                    <span className="text-xs font-bold text-slate-400">Row</span>
                    <button 
                        onClick={() => onResizeRow(5)}
                        className="p-2 bg-white rounded shadow-sm text-slate-700 active:scale-95 transition-transform"
                    >
                        <Plus size={16} />
                    </button>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default memo(MobileResizeTool);
