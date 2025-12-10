import React, { memo, useState, useRef, useEffect } from 'react';
import { CellData } from '../types';

interface CellProps {
  id: string;
  data: CellData;
  isSelected: boolean;
  isActive: boolean;
  isInRange: boolean;
  width: number;
  height: number;
  onClick: (id: string, isShift: boolean) => void;
  onDoubleClick: (id: string) => void;
  onChange: (id: string, value: string) => void;
}

const Cell = memo(({ 
  id, 
  data, 
  isSelected, 
  isActive, 
  isInRange,
  width, 
  height, 
  onClick, 
  onDoubleClick, 
  onChange 
}: CellProps) => {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(data.raw);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync internal edit state
  useEffect(() => {
    setEditValue(data.raw);
  }, [data.raw]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  useEffect(() => {
    if (isActive && editing) {
      inputRef.current?.focus();
    }
  }, [isActive, editing]);

  const handleDoubleClick = () => {
    setEditing(true);
    onDoubleClick(id);
  };

  const handleBlur = () => {
    setEditing(false);
    if (editValue !== data.raw) {
      onChange(id, editValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    }
  };

  const style: React.CSSProperties = {
    fontWeight: data.style.bold ? '600' : '400',
    fontStyle: data.style.italic ? 'italic' : 'normal',
    textDecoration: data.style.underline ? 'underline' : 'none',
    textAlign: data.style.align || 'left',
    color: data.style.color || '#0f172a',
    backgroundColor: data.style.bg || (isInRange ? 'rgba(16, 185, 129, 0.1)' : '#fff'),
    width: width,
    height: height,
    minWidth: width,
    minHeight: height,
    fontSize: (data.style.fontSize || 13) + 'px',
  };

  return (
    <div
      className={`
        relative box-border flex items-center px-1.5 overflow-hidden select-none outline-none flex-shrink-0
        border-r border-b border-slate-200
        ${!isSelected && !isInRange ? '' : ''}
      `}
      style={style}
      onClick={(e) => onClick(id, e.shiftKey)}
      onDoubleClick={handleDoubleClick}
    >
      {editing ? (
        <input
          ref={inputRef}
          type="text"
          className="absolute inset-0 w-full h-full px-1.5 outline-none z-50 bg-white text-slate-900 shadow-elevation"
          style={{ 
            fontFamily: 'inherit',
            fontWeight: data.style.bold ? '600' : '400',
            fontStyle: data.style.italic ? 'italic' : 'normal',
            fontSize: 'max(16px, 13px)', // Mobile zoom prevention
          }}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
      ) : (
        <span className="w-full truncate pointer-events-none leading-none">
            {data.value}
        </span>
      )}

      {/* Selection Highlight Overlay */}
      {isSelected && (
        <div className="absolute inset-0 z-40 pointer-events-none border-[2px] border-primary-500 shadow-glow">
             {/* Fill Handle */}
             <div className="absolute -bottom-[5px] -right-[5px] w-2.5 h-2.5 bg-primary-500 border border-white cursor-crosshair rounded-[1px] shadow-sm z-50" />
        </div>
      )}
    </div>
  );
}, (prev, next) => {
  return (
    prev.data === next.data &&
    prev.isSelected === next.isSelected &&
    prev.isActive === next.isActive &&
    prev.isInRange === next.isInRange &&
    prev.width === next.width &&
    prev.height === next.height
  );
});

Cell.displayName = 'Cell';
export default Cell;