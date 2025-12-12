import React, { memo, useState, useRef, useEffect } from 'react';
import { CellData } from '../types';
import { cn } from '../utils';

export type NavigationDirection = 'up' | 'down' | 'left' | 'right' | 'none';

interface CellProps {
  id: string;
  data: CellData;
  isSelected: boolean;
  isActive: boolean;
  isInRange: boolean;
  width: number;
  height: number;
  scale?: number;
  onClick: (id: string, isShift: boolean) => void;
  onDoubleClick: (id: string) => void;
  onChange: (id: string, value: string) => void;
  onNavigate: (direction: NavigationDirection) => void;
  onMouseDown: (id: string) => void;
  onMouseEnter: (id: string) => void;
  onContextMenu: (e: React.MouseEvent, id: string) => void;
}

const Cell = memo(({ 
  id, 
  data, 
  isSelected, 
  isActive, 
  isInRange,
  width, 
  height, 
  scale = 1,
  onClick, 
  onDoubleClick, 
  onChange,
  onNavigate,
  onMouseDown,
  onMouseEnter,
  onContextMenu
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
      e.preventDefault();
      handleBlur();
      onNavigate(e.shiftKey ? 'up' : 'down');
    } else if (e.key === 'Tab') {
      e.preventDefault();
      handleBlur();
      onNavigate(e.shiftKey ? 'left' : 'right');
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
      // Only left click triggers selection drag, right click handled by onContextMenu
      if (e.button === 0) {
          onMouseDown(id);
      }
  };

  const baseFontSize = data.style.fontSize || 13;
  const scaledFontSize = Math.max(8, baseFontSize * scale); // Min font size legibility

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
    fontSize: `${scaledFontSize}px`,
  };

  return (
    <div
      className={cn(
        "relative box-border flex items-center px-[4px] overflow-hidden select-none outline-none flex-shrink-0 border-r border-b border-slate-200",
        // Additional dynamic classes can be added here cleanly
      )}
      style={style}
      onClick={(e) => onClick(id, e.shiftKey)}
      onDoubleClick={handleDoubleClick}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => onMouseEnter(id)}
      onContextMenu={(e) => onContextMenu(e, id)}
    >
      {editing ? (
        <input
          ref={inputRef}
          type="text"
          className="absolute inset-0 w-full h-full px-[4px] outline-none z-50 bg-white text-slate-900 shadow-elevation"
          style={{ 
            fontFamily: 'inherit',
            fontWeight: data.style.bold ? '600' : '400',
            fontStyle: data.style.italic ? 'italic' : 'normal',
            fontSize: `${scaledFontSize}px`, 
            paddingTop: 0,
            paddingBottom: 0
          }}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onMouseDown={(e) => e.stopPropagation()} 
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
             <div className="absolute -bottom-[5px] -right-[5px] w-2.5 h-2.5 bg-primary-500 border border-white cursor-crosshair rounded-[1px] shadow-sm z-50 pointer-events-auto" />
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
    prev.height === next.height &&
    prev.scale === next.scale
  );
});

Cell.displayName = 'Cell';
export default Cell;