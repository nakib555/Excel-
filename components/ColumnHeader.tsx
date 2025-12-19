
import React, { memo } from 'react';
import { cn, getCellId } from '../utils';

interface ColumnHeaderProps {
  col: number;
  width: number;
  height: number;
  colChar: string;
  isActive: boolean | undefined;
  fontSize: number;
  onCellClick: (id: string, isShift: boolean) => void;
  startResize: (e: React.MouseEvent, type: 'col' | 'row', index: number, currentSize: number) => void;
  onAutoFit?: () => void;
}

const ColumnHeader = memo(({ 
  col, width, height, colChar, isActive, fontSize, onCellClick, startResize, onAutoFit 
}: ColumnHeaderProps) => {
  return (
    <div 
        className={cn(
            "relative flex items-center justify-center border-r border-slate-300 select-none flex-shrink-0 text-slate-700 font-semibold bg-[#f8f9fa] hover:bg-slate-200 transition-colors overflow-hidden", 
            isActive && "bg-emerald-100 text-emerald-800"
        )}
        style={{ width, height, fontSize: `${fontSize}px` }}
        onClick={() => onCellClick(getCellId(col, 0), false)}
    >
        {colChar}
        <div 
            className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-emerald-500 z-10 translate-x-1/2"
            onMouseDown={(e) => startResize(e, 'col', col, width)} 
            onDoubleClick={(e) => {
                e.stopPropagation();
                if(onAutoFit) onAutoFit();
            }}
        />
    </div>
  );
});

export default ColumnHeader;
