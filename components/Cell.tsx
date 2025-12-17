
import React, { memo, useState, useRef, useEffect } from 'react';
import { CellData, CellStyle } from '../types';
import { cn, formatCellValue } from '../utils';
import { CellSkeleton } from './Skeletons';

export type NavigationDirection = 'up' | 'down' | 'left' | 'right' | 'none';

interface CellProps {
  id: string;
  data: CellData;
  style: CellStyle; // Resolved style passed from parent
  isSelected: boolean;
  isActive: boolean;
  isInRange: boolean;
  width: number;
  height: number;
  scale?: number;
  isGhost?: boolean; 
  onMouseDown: (id: string, isShift: boolean) => void;
  onMouseEnter: (id: string) => void;
  onDoubleClick: (id: string) => void;
  onChange: (id: string, value: string) => void;
  onNavigate: (direction: NavigationDirection) => void;
}

const Cell = memo(({ 
  id, 
  data, 
  style: resolvedStyle, // Renamed to avoid confusion
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
  const isMicroView = scale < 0.25; 
  const fontSize = Math.max(scale < 0.6 ? 7 : 9, (resolvedStyle.fontSize || 13) * scale);

  // Style Calculation 
  const containerStyle: React.CSSProperties = {
    width: width,
    height: height,
    minWidth: width,
    minHeight: height,
  };
  
  // Ghost Mode - Use shared skeleton for consistency with lazy loading
  if (isGhost) {
      return <CellSkeleton width={width} height={height} />;
  }

  const textAlign = resolvedStyle.align || 'left';
  const fontWeight = resolvedStyle.bold ? '600' : '400';
  const fontStyle = resolvedStyle.italic ? 'italic' : 'normal';
  const textDecoration = resolvedStyle.underline ? 'underline' : 'none';
  const color = resolvedStyle.color || '#0f172a';
  const backgroundColor = resolvedStyle.bg || (isInRange ? 'rgba(16, 185, 129, 0.1)' : '#fff');
  
  // Orientation logic
  const verticalText = resolvedStyle.verticalText;
  const rotation = resolvedStyle.textRotation || 0;
  
  // Apply rotation logic
  // Excel +45deg is CCW. CSS rotate(45deg) is Clockwise. 
  // So Excel +45 = CSS -45deg.
  const cssRotation = rotation ? -rotation : 0; 
  
  // If rotated, we might need overflow visible to see it
  const hasRotation = rotation !== 0;
  const isVertical = verticalText;
  
  // WhiteSpace logic: if rotated, usually no-wrap unless specified, but standard flow differs
  const whiteSpace = resolvedStyle.wrapText ? 'normal' : 'nowrap';
  
  const displayValue = formatCellValue(data.value, resolvedStyle);

  return (
    <div
      className={cn(
        "relative box-border flex items-center px-[4px] select-none outline-none flex-shrink-0 border-r border-b border-slate-200",
        isActive && "z-20",
        isSelected && !isActive && "z-10",
        // If rotated, allow overflow visible so text sticks out like Excel
        (hasRotation || isVertical) ? "overflow-visible z-[5]" : "overflow-hidden"
      )}
      style={{
          ...containerStyle,
          textAlign,
          fontWeight,
          fontStyle,
          textDecoration,
          color,
          backgroundColor,
          fontSize: isMicroView ? 0 : `${fontSize}px`,
          lineHeight: 1, 
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
        !isMicroView && displayValue && (
            <span 
                className={cn("pointer-events-none block origin-left", !resolvedStyle.wrapText && !hasRotation && !isVertical && "truncate")}
                style={{
                    // CSS writing-mode for vertical stacked text
                    ...(isVertical ? { writingMode: 'vertical-rl', textOrientation: 'upright', width: '100%', display: 'flex', alignItems: textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start' } : {}),
                    // Transform for rotation
                    ...(hasRotation ? { 
                        transform: `rotate(${cssRotation}deg)`, 
                        width: 'max-content',
                        transformOrigin: textAlign === 'center' ? 'center' : textAlign === 'right' ? 'center right' : 'center left',
                        // Alignment adjustments for rotated text
                        marginLeft: textAlign === 'center' ? 'auto' : undefined,
                        marginRight: textAlign === 'center' ? 'auto' : undefined,
                        display: 'inline-block'
                    } : { width: '100%' })
                }}
            >
                {displayValue}
            </span>
        )
      )}

      {isSelected && (
        <div className="absolute inset-0 pointer-events-none border-[2px] border-primary-500 shadow-glow mix-blend-multiply rounded-[1px]">
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
  return (
    prev.data === next.data &&
    prev.style === next.style && // Style object ref check (Flyweight helps here)
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
