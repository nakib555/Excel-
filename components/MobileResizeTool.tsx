
import React, { memo, useState, useEffect } from 'react';
import { Minus, Plus, X, MoveHorizontal, MoveVertical, RotateCcw, BoxSelect, Columns, Rows, MessageSquare } from 'lucide-react';
import { cn } from '../utils';
import { Tooltip } from './shared';

interface MobileResizeToolProps {
  isOpen: boolean;
  onClose: () => void;
  activeCell: string | null;
  onResizeRow: (delta: number) => void;
  onResizeCol: (delta: number) => void;
  onReset: () => void;
  onEditComment?: () => void;
}

const MobileResizeTool: React.FC<MobileResizeToolProps> = ({ 
  isOpen, 
  onClose, 
  activeCell, 
  onResizeRow, 
  onResizeCol,
  onReset,
  onEditComment
}) => {
  const [resizeMode, setResizeMode] = useState<'cell' | 'row' | 'col'>('cell');

  useEffect(() => {
    if (isOpen) setResizeMode('cell');
  }, [isOpen, activeCell]);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-[84px] left-1/2 -translate-x-1/2 w-fit max-w-[calc(100%-16px)] lg:hidden z-[1000] animate-in slide-in-from-bottom-5 fade-in duration-200 pointer-events-auto">
      <div className="h-14 bg-white/95 backdrop-blur-xl border border-slate-200/60 shadow-2xl rounded-full flex items-center px-1.5 gap-1.5 ring-1 ring-black/5 overflow-hidden mx-auto">
        
        {/* Close Button */}
        <button 
            type="button"
            onClick={onClose}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
        >
            <X size={18} />
        </button>

        {/* Vertical Divider */}
        <div className="w-[1px] h-5 bg-slate-200 flex-shrink-0" />

        {/* Scrollable Content Area */}
        <div className="flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth px-1">
            
            {/* Mode Switcher */}
            <div className="flex items-center bg-slate-100/80 p-1 rounded-full flex-shrink-0 gap-1">
                <Tooltip content="Individual Cell">
                    <button
                        type="button"
                        onClick={() => setResizeMode('cell')}
                        className={cn(
                            "p-1.5 rounded-full transition-all",
                            resizeMode === 'cell' ? "bg-white text-emerald-600 shadow-sm ring-1 ring-black/5" : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        <BoxSelect size={16} />
                    </button>
                </Tooltip>
                <Tooltip content="Entire Row">
                    <button
                        type="button"
                        onClick={() => setResizeMode('row')}
                        className={cn(
                            "p-1.5 rounded-full transition-all",
                            resizeMode === 'row' ? "bg-white text-emerald-600 shadow-sm ring-1 ring-black/5" : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        <Rows size={16} />
                    </button>
                </Tooltip>
                <Tooltip content="Entire Column">
                    <button
                        type="button"
                        onClick={() => setResizeMode('col')}
                        className={cn(
                            "p-1.5 rounded-full transition-all",
                            resizeMode === 'col' ? "bg-white text-emerald-600 shadow-sm ring-1 ring-black/5" : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        <Columns size={16} />
                    </button>
                </Tooltip>
            </div>

            {/* Controls Group */}
            <div className="flex items-center gap-2 flex-shrink-0">
                {(resizeMode === 'col' || resizeMode === 'cell') && (
                    <div className="flex items-center gap-1 bg-slate-50 border border-slate-200/50 rounded-full p-0.5 pr-1">
                        <div className="w-7 h-7 flex items-center justify-center text-slate-400 rounded-full"><MoveHorizontal size={14} /></div>
                        <Tooltip content="Decrease Width">
                            <button type="button" onClick={() => onResizeCol(-5)} className="w-7 h-7 flex items-center justify-center bg-white rounded-full shadow-sm border border-slate-200 text-slate-600 active:scale-90 transition-all hover:border-emerald-400"><Minus size={14} strokeWidth={2.5} /></button>
                        </Tooltip>
                        <Tooltip content="Increase Width">
                            <button type="button" onClick={() => onResizeCol(5)} className="w-7 h-7 flex items-center justify-center bg-white rounded-full shadow-sm border border-slate-200 text-slate-600 active:scale-90 transition-all hover:border-emerald-400"><Plus size={14} strokeWidth={2.5} /></button>
                        </Tooltip>
                    </div>
                )}

                {(resizeMode === 'row' || resizeMode === 'cell') && (
                    <div className="flex items-center gap-1 bg-slate-50 border border-slate-200/50 rounded-full p-0.5 pr-1">
                        <div className="w-7 h-7 flex items-center justify-center text-slate-400 rounded-full"><MoveVertical size={14} /></div>
                        <Tooltip content="Decrease Height">
                            <button type="button" onClick={() => onResizeRow(-5)} className="w-7 h-7 flex items-center justify-center bg-white rounded-full shadow-sm border border-slate-200 text-slate-600 active:scale-90 transition-all hover:border-emerald-400"><Minus size={14} strokeWidth={2.5} /></button>
                        </Tooltip>
                        <Tooltip content="Increase Height">
                            <button type="button" onClick={() => onResizeRow(5)} className="w-7 h-7 flex items-center justify-center bg-white rounded-full shadow-sm border border-slate-200 text-slate-600 active:scale-90 transition-all hover:border-emerald-400"><Plus size={14} strokeWidth={2.5} /></button>
                        </Tooltip>
                    </div>
                )}
            </div>
        </div>

        {/* Actions Divider */}
        <div className="w-[1px] h-5 bg-slate-200 flex-shrink-0" />

        {/* Additional Actions */}
        <div className="flex items-center gap-1 flex-shrink-0 pl-1">
             {onEditComment && (
                <Tooltip content="Edit Comment">
                    <button
                        type="button"
                        onClick={onEditComment}
                        className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-full transition-colors"
                    >
                        <MessageSquare size={16} />
                    </button>
                </Tooltip>
             )}
             
             <Tooltip content="Reset to Default">
                <button
                    type="button"
                    onClick={onReset}
                    className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors active:rotate-180 duration-500"
                >
                    <RotateCcw size={16} />
                </button>
             </Tooltip>
        </div>

      </div>
    </div>
  );
};

export default memo(MobileResizeTool);
