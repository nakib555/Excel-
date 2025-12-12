
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
  onMouseDown: (id: string, isShift: boolean) => void;
  onMouseEnter: (id: string) => void;
  onDoubleClick: (id: string) => void;
  onChange: (id: string, value: string) => void;
  onNavigate: (direction: NavigationDirection) => void;
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
  onMouseDown, 
  onMouseEnter,
  onDoubleClick, 
  onChange,
  onNavigate
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

  const baseFontSize = data.style.fontSize || 13;
  const scaledFontSize = Math.max(8, baseFontSize * scale); // Min font size legibility
  const showContent = scale > 0.25; // Hide text content at very low zoom for performance/cleanliness

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
    // Browser optimization hints
    contentVisibility: 'auto',
    contain: 'strict',
    willChange: 'width, height'
  };

  return (
    <div
      className={cn(
        "relative box-border flex items-center px-[4px] overflow-hidden select-none outline-none flex-shrink-0 border-r border-b border-slate-200",
      )}
      style={style}
      onMouseDown={(e) => onMouseDown(id, e.shiftKey)}
      onMouseEnter={() => onMouseEnter(id)}
      onDoubleClick={handleDoubleClick}
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
        />
      ) : (
        showContent && (
            <span className="w-full truncate pointer-events-none leading-none">
                {data.value}
            </span>
        )
      )}

      {/* Selection Highlight Overlay */}
      {isSelected && (
        <div className="absolute inset-0 z-40 pointer-events-none border-[2px] border-primary-500 shadow-glow">
             {/* Fill Handle - scale slightly with zoom */}
             <div 
                className="absolute -bottom-[5px] -right-[5px] bg-primary-500 border border-white cursor-crosshair rounded-[1px] shadow-sm z-50" 
                style={{ width: Math.max(6, 10 * scale), height: Math.max(6, 10 * scale) }}
             />
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
    prev.scale === next.scale &&
    prev.onMouseDown === next.onMouseDown &&
    prev.onMouseEnter === next.onMouseEnter
  );
});

Cell.displayName = 'Cell';
export default Cell;
