
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
  isGhost?: boolean; // New prop for Skeleton/Ghost mode
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
  isGhost = false,
  onMouseDown, 
  onMouseEnter,
  onDoubleClick, 
  onChange,
  onNavigate
}: CellProps) => {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(data.raw);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setEditValue(data.raw); }, [data.raw]);

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  useEffect(() => {
    if (isActive && editing) inputRef.current?.focus();
  }, [isActive, editing]);

  const handleBlur = () => {
    setEditing(false);
    if (editValue !== data.raw) onChange(id, editValue);
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

  // --- LOD (Level of Detail) Optimization ---
  const isMicroView = scale < 0.25; // Only hide content if extremely small
  // Allow font size to scale linearly down to 7px, then clamp
  const fontSize = Math.max(scale < 0.6 ? 7 : 9, (data.style.fontSize || 13) * scale);

  // Style Calculation - Optimized
  const style: React.CSSProperties = {
    width: width,
    height: height,
    minWidth: width,
    minHeight: height,
    // Performance: content-visibility helps browser skip rendering off-screen work even if DOM exists
    contentVisibility: 'auto',
    contain: 'strict', 
  };
  
  // Ghost Mode: Render minimal DOM for performance during fast interactions
  // Updated with brighter full-box shimmer effect
  if (isGhost) {
      return (
        <div
          className="relative box-border border-r border-b border-slate-200 bg-white skeleton-shine"
          style={style}
        />
      );
  }

  // Active styles calculation
  const textAlign = data.style.align || 'left';
  const fontWeight = data.style.bold ? '600' : '400';
  const fontStyle = data.style.italic ? 'italic' : 'normal';
  const textDecoration = data.style.underline ? 'underline' : 'none';
  const color = data.style.color || '#0f172a';
  const backgroundColor = data.style.bg || (isInRange ? 'rgba(16, 185, 129, 0.1)' : '#fff');
  const whiteSpace = data.style.wrapText ? 'normal' : 'nowrap';

  return (
    <div
      className={cn(
        "relative box-border flex items-center px-[4px] overflow-hidden select-none outline-none flex-shrink-0 border-r border-b border-slate-200",
        // Conditional classes for selection borders to avoid extra DOM nodes for borders
        isActive && "z-20",
        isSelected && !isActive && "z-10" 
      )}
      style={{
          ...style,
          textAlign,
          fontWeight,
          fontStyle,
          textDecoration,
          color,
          backgroundColor,
          fontSize: isMicroView ? 0 : `${fontSize}px`,
          lineHeight: 1, // Ensure text is centered vertically without gap
          whiteSpace
      }}
      onMouseDown={(e) => onMouseDown(id, e.shiftKey)}
      onMouseEnter={() => onMouseEnter(id)}
      onDoubleClick={() => { setEditing(true); onDoubleClick(id); }}
    >
      {editing ? (
        <input
          ref={inputRef}
          type="text"
          className="absolute inset-0 w-full h-full px-[2px] outline-none z-50 bg-white text-slate-900 shadow-elevation"
          style={{ 
            fontSize: `${fontSize}px`, 
            fontFamily: 'inherit'
          }}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
      ) : (
        !isMicroView && data.value && (
            <span className={cn("w-full pointer-events-none block", !data.style.wrapText && "truncate")}>
                {data.value}
            </span>
        )
      )}

      {/* Selection Overlay - Only render if selected to save DOM */}
      {isSelected && (
        <div className="absolute inset-0 pointer-events-none border-[2px] border-primary-500 shadow-glow mix-blend-multiply rounded-[1px]">
             {/* Fill handle only for active cell */}
             {isActive && (
                <div 
                    className="absolute -bottom-[4px] -right-[4px] bg-primary-500 border border-white cursor-crosshair rounded-[1px] shadow-sm z-50 pointer-events-auto" 
                    style={{ width: Math.max(6, 8 * scale), height: Math.max(6, 8 * scale) }}
                />
             )}
        </div>
      )}
    </div>
  );
}, (prev, next) => {
  // Enhanced comparison
  return (
    prev.data === next.data &&
    prev.isSelected === next.isSelected &&
    prev.isActive === next.isActive &&
    prev.isInRange === next.isInRange &&
    prev.width === next.width &&
    prev.height === next.height &&
    prev.scale === next.scale &&
    prev.isGhost === next.isGhost
  );
});

Cell.displayName = 'Cell';
export default Cell;