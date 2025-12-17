

import React, { memo, useState, useRef, useEffect } from 'react';
import { CellData, CellStyle, ValidationRule } from '../types';
import { cn, formatCellValue } from '../utils';
import { CellSkeleton } from './Skeletons';
import { ChevronDown } from 'lucide-react';
import { createPortal } from 'react-dom';

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
  validation?: ValidationRule;
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
  validation,
  onMouseDown, 
  onMouseEnter, 
  onDoubleClick, 
  onChange,
  onNavigate
}: CellProps) => {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(data.raw);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setEditValue(data.raw); }, [data.raw]);

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  useEffect(() => {
    if (isActive && editing) inputRef.current?.focus();
  }, [isActive, editing]);

  const handleBlur = () => {
    // Delay to allow dropdown click
    setTimeout(() => {
        setEditing(false);
        if (editValue !== data.raw) onChange(id, editValue);
    }, 150);
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
  const verticalAlign = resolvedStyle.verticalAlign || 'bottom';
  const indent = resolvedStyle.indent || 0;

  const fontWeight = resolvedStyle.bold ? '600' : '400';
  const fontStyle = resolvedStyle.italic ? 'italic' : 'normal';
  const textDecoration = resolvedStyle.underline ? 'underline' : 'none';
  const color = resolvedStyle.color || '#0f172a';
  const backgroundColor = resolvedStyle.bg || (isInRange ? 'rgba(16, 185, 129, 0.1)' : '#fff');
  
  // Orientation logic
  const verticalText = resolvedStyle.verticalText;
  const rotation = resolvedStyle.textRotation || 0;
  
  // Apply rotation logic
  const cssRotation = rotation ? -rotation : 0; 
  const hasRotation = rotation !== 0;
  const isVertical = verticalText;
  
  const whiteSpace = resolvedStyle.wrapText ? 'normal' : 'nowrap';
  const displayValue = formatCellValue(data.value, resolvedStyle);

  const handleDropdownSelect = (val: string) => {
      onChange(id, val);
      setShowDropdown(false);
      setEditing(false);
  };

  // Map vertical align to flex align
  const alignItems = verticalAlign === 'top' ? 'flex-start' : verticalAlign === 'middle' ? 'center' : 'flex-end';
  
  // Calculate padding based on indentation
  const indentPx = indent * 10;
  // If right aligned, indent usually means padding from right. If left, padding from left.
  const paddingLeft = textAlign === 'right' ? '4px' : `${4 + indentPx}px`;
  const paddingRight = textAlign === 'right' ? `${4 + indentPx}px` : '4px';

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative box-border flex px-[4px] select-none outline-none flex-shrink-0 border-r border-b border-slate-200",
        isActive && "z-30",
        isSelected && !isActive && "z-10",
        (hasRotation || isVertical) ? "overflow-visible z-[20]" : "overflow-hidden"
      )}
      style={{
          ...containerStyle,
          textAlign,
          fontWeight,
          fontStyle,
          textDecoration,
          color,
          backgroundColor,
          alignItems, // Flex alignment for vertical
          paddingLeft: isVertical ? '0px' : paddingLeft, // Vertical text handles its own layout
          paddingRight: isVertical ? '0px' : paddingRight,
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
            fontFamily: 'inherit',
            textAlign
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
                    ...(isVertical ? { 
                        writingMode: 'vertical-rl', 
                        textOrientation: 'upright', 
                        width: '100%', 
                        display: 'flex', 
                        alignItems: textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start' 
                    } : {}),
                    ...(hasRotation ? { 
                        transform: `rotate(${cssRotation}deg)`, 
                        width: 'max-content',
                        transformOrigin: textAlign === 'center' ? 'center' : textAlign === 'right' ? 'center right' : 'center left',
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

      {/* Validation Dropdown Trigger */}
      {isActive && validation && validation.type === 'list' && !isGhost && (
          <>
            <div 
                className="absolute right-0 top-0 bottom-0 w-5 bg-slate-100 hover:bg-slate-200 border-l border-slate-300 flex items-center justify-center cursor-pointer z-50"
                onMouseDown={(e) => { e.stopPropagation(); setShowDropdown(!showDropdown); }}
            >
                <ChevronDown size={12} className="text-slate-600" />
            </div>
            {showDropdown && createPortal(
                <div 
                    className="fixed bg-white border border-slate-300 shadow-xl rounded-sm z-[2000] flex flex-col max-h-48 overflow-y-auto"
                    style={{
                        top: containerRef.current ? containerRef.current.getBoundingClientRect().bottom : 0,
                        left: containerRef.current ? containerRef.current.getBoundingClientRect().left : 0,
                        minWidth: containerRef.current ? containerRef.current.offsetWidth : 120
                    }}
                    ref={dropdownRef}
                    onMouseDown={(e) => e.stopPropagation()} 
                >
                    {validation.options.map(opt => (
                        <div 
                            key={opt} 
                            className="px-3 py-1.5 hover:bg-emerald-50 text-slate-700 text-sm cursor-pointer border-b border-slate-50 last:border-none"
                            onMouseDown={() => handleDropdownSelect(opt)}
                        >
                            {opt}
                        </div>
                    ))}
                </div>,
                document.body
            )}
          </>
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
    prev.style === next.style && 
    prev.isSelected === next.isSelected &&
    prev.isActive === next.isActive &&
    prev.isInRange === next.isInRange &&
    prev.width === next.width &&
    prev.height === next.height &&
    prev.scale === next.scale &&
    prev.isGhost === next.isGhost &&
    prev.validation === next.validation
  );
});

Cell.displayName = 'Cell';
export default Cell;