
import React, { memo, useState, useRef, useEffect, useLayoutEffect } from 'react';
import { CellData, CellStyle, ValidationRule } from '../types';
import { cn, formatCellValue } from '../utils';
import { CellSkeleton } from './Skeletons';
import { ChevronDown, ExternalLink } from 'lucide-react';
import { createPortal } from 'react-dom';

export type NavigationDirection = 'up' | 'down' | 'left' | 'right' | 'none';

interface CellProps {
  id: string;
  data: CellData;
  style: CellStyle;
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
  style: resolvedStyle,
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
  const spanRef = useRef<HTMLSpanElement>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [scaleFactor, setScaleFactor] = useState(1);
  const [dropdownPosition, setDropdownPosition] = useState<{top: number, left: number, width: number} | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => { setEditValue(data.raw); }, [data.raw]);

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  useEffect(() => {
    if (isActive && editing) inputRef.current?.focus();
  }, [isActive, editing]);

  useLayoutEffect(() => {
      if (showDropdown && containerRef.current) {
          const update = () => {
              if (containerRef.current) {
                  const rect = containerRef.current.getBoundingClientRect();
                  setDropdownPosition({
                      top: rect.bottom,
                      left: rect.left,
                      width: rect.width
                  });
              }
          };
          update();
          window.addEventListener('scroll', update, true);
          window.addEventListener('resize', update);
          return () => {
              window.removeEventListener('scroll', update, true);
              window.removeEventListener('resize', update);
          };
      }
  }, [showDropdown]);

  useEffect(() => {
      if (!showDropdown) return;
      const handleClickOutside = (e: MouseEvent | TouchEvent) => {
          if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) && 
              containerRef.current && !containerRef.current.contains(e.target as Node)) {
              setShowDropdown(false);
          }
      };
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside, { passive: true });
      return () => {
          document.removeEventListener('mousedown', handleClickOutside);
          document.removeEventListener('touchstart', handleClickOutside);
      };
  }, [showDropdown]);

  useLayoutEffect(() => {
    if (resolvedStyle.shrinkToFit && !resolvedStyle.wrapText && spanRef.current && !editing) {
       const span = spanRef.current;
       const paddingX = (resolvedStyle.indent || 0) * 10 + 8; 
       const avail = width - paddingX;
       const actual = span.scrollWidth;
       if (actual > avail && avail > 0) {
           setScaleFactor(avail / actual);
       } else {
           setScaleFactor(1);
       }
    } else {
        setScaleFactor(1);
    }
  }, [data.value, resolvedStyle, width, height, editing]);

  const handleBlur = () => {
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

  const isMicroView = scale < 0.25; 
  const fontSize = Math.max(scale < 0.6 ? 7 : 9, (resolvedStyle.fontSize || 13) * scale);

  if (isGhost) {
      return <CellSkeleton width={width} height={height} />;
  }

  const align = resolvedStyle.align || 'left'; 
  const verticalAlign = resolvedStyle.verticalAlign || 'bottom';
  const indent = resolvedStyle.indent || 0;
  
  const justifyContent = align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start';
  const alignItems = verticalAlign === 'top' ? 'flex-start' : verticalAlign === 'middle' ? 'center' : 'flex-end';

  const indentPx = indent * 10 * scale; 
  const paddingLeft = align === 'right' ? '4px' : `${4 + indentPx}px`;
  const paddingRight = align === 'right' ? `${4 + indentPx}px` : '4px';

  const fontWeight = resolvedStyle.bold ? '600' : '400';
  const fontStyle = resolvedStyle.italic ? 'italic' : 'normal';
  const textDecoration = resolvedStyle.underline ? 'underline' : 'none';
  const color = resolvedStyle.color || '#0f172a';
  const backgroundColor = resolvedStyle.bg || (isInRange ? 'rgba(16, 185, 129, 0.08)' : '#fff'); // Lighter selection bg
  
  const verticalText = resolvedStyle.verticalText;
  const rotation = resolvedStyle.textRotation || 0;
  const cssRotation = rotation ? -rotation : 0; 
  const hasRotation = rotation !== 0;
  
  const whiteSpace = resolvedStyle.wrapText ? 'pre-wrap' : 'nowrap';
  const displayValue = formatCellValue(data.value, resolvedStyle);

  const handleDropdownSelect = (val: string) => {
      onChange(id, val);
      setShowDropdown(false);
      setEditing(false);
  };

  const containerStyle: React.CSSProperties = {
    width: width,
    height: height,
    minWidth: width,
    minHeight: height,
    display: 'flex',
    justifyContent: data.isCheckbox ? 'center' : justifyContent, 
    alignItems: data.isCheckbox ? 'center' : alignItems,
    paddingLeft: verticalText ? 0 : paddingLeft,
    paddingRight: verticalText ? 0 : paddingRight,
    backgroundColor,
    borderRight: '1px solid #e2e8f0',
    borderBottom: '1px solid #e2e8f0',
    overflow: (hasRotation || verticalText) ? 'visible' : 'hidden', 
  };

  const textStyle: React.CSSProperties = {
      fontFamily: resolvedStyle.fontFamily || 'Inter, sans-serif',
      fontSize: isMicroView ? 0 : `${fontSize}px`,
      fontWeight,
      fontStyle,
      textDecoration,
      color,
      whiteSpace,
      ...(verticalText ? { 
          writingMode: 'vertical-rl', 
          textOrientation: 'upright', 
          letterSpacing: '1px'
      } : {}),
      ...(hasRotation ? {
          transform: `rotate(${cssRotation}deg)`,
          transformOrigin: align === 'center' ? 'center' : align === 'right' ? 'center right' : 'center left',
      } : {
          transform: scaleFactor < 1 ? `scale(${scaleFactor})` : undefined,
          transformOrigin: align === 'right' ? 'right' : align === 'center' ? 'center' : 'left',
          width: resolvedStyle.wrapText ? '100%' : 'auto'
      }),
      lineHeight: 1.2
  };
  
  const getCssTextAlign = (): React.CSSProperties['textAlign'] => {
      if (align === 'center' || align === 'centerAcross') return 'center';
      if (align === 'right') return 'right';
      return 'left';
  };
  const cssTextAlign = getCssTextAlign();

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative box-border select-none outline-none flex-shrink-0",
        isActive && "z-30",
      )}
      style={containerStyle}
      data-cell-id={id}
      onMouseDown={(e) => onMouseDown(id, e.shiftKey)}
      onMouseEnter={() => { onMouseEnter(id); setIsHovered(true); }}
      onMouseLeave={() => setIsHovered(false)}
      onDoubleClick={() => { setEditing(true); onDoubleClick(id); }}
    >
      {editing ? (
        <input
          ref={inputRef}
          type="text"
          className="absolute inset-0 w-full h-full px-[2px] outline-none z-50 bg-white text-slate-900 shadow-elevation"
          style={{ 
            fontSize: `${fontSize}px`, 
            fontFamily: resolvedStyle.fontFamily || 'inherit',
            textAlign: cssTextAlign,
            fontWeight
          }}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
      ) : (
        !isMicroView && (
            data.isCheckbox ? (
                 <div className="flex items-center justify-center w-full h-full pointer-events-none">
                     <input 
                        type="checkbox" 
                        checked={String(data.value).toUpperCase() === 'TRUE'} 
                        onChange={(e) => onChange(id, e.target.checked ? 'TRUE' : 'FALSE')}
                        className="w-4 h-4 accent-emerald-600 cursor-pointer pointer-events-auto"
                        onMouseDown={(e) => e.stopPropagation()} 
                     />
                 </div>
            ) : (
                <span ref={spanRef} style={textStyle} className="relative">
                    {displayValue}
                    {data.link && (
                         <a 
                            href={data.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="absolute inset-0 z-10"
                            onClick={(e) => {
                                if (!e.ctrlKey && !e.metaKey) e.preventDefault();
                            }}
                         />
                    )}
                </span>
            )
        )
      )}

      {data.link && !editing && isActive && (
          <div className="absolute top-0 right-0 p-0.5 bg-blue-50 z-20 cursor-pointer" title={`Go to ${data.link}`} onMouseDown={(e) => { e.stopPropagation(); window.open(data.link, '_blank'); }}>
               <ExternalLink size={10} className="text-blue-500" />
          </div>
      )}

      {/* Visual Comment Indicator (Red Triangle) */}
      {data.comment && (
          <>
            <div 
                className="absolute top-0 right-0 w-0 h-0 border-l-[6px] border-l-transparent border-t-[6px] border-t-red-600 z-10" 
                style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.1))' }}
            />
            {/* Tooltip on Hover */}
            {(isHovered || isActive) && (
                createPortal(
                    <div 
                        className="fixed z-[9999] bg-[#ffffe1] border border-slate-300 shadow-xl rounded-[2px] p-2 text-xs text-slate-800 max-w-[200px] break-words animate-in fade-in zoom-in-95 duration-150 pointer-events-none flex flex-col gap-1"
                        style={{
                            top: containerRef.current ? containerRef.current.getBoundingClientRect().top : 0,
                            left: containerRef.current ? containerRef.current.getBoundingClientRect().right + 8 : 0,
                        }}
                    >
                        <div className="font-bold text-slate-900 border-b border-slate-200/50 pb-1 mb-0.5 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                            Comment
                        </div>
                        <span className="leading-relaxed">{data.comment}</span>
                    </div>,
                    document.body
                )
            )}
          </>
      )}

      {isActive && validation && validation.type === 'list' && !isGhost && (
          <>
            <div 
                className="absolute right-0 top-0 bottom-0 w-5 bg-slate-100 hover:bg-slate-200 border-l border-slate-300 flex items-center justify-center cursor-pointer z-50"
                onMouseDown={(e) => { e.stopPropagation(); setShowDropdown(!showDropdown); }}
            >
                <ChevronDown size={12} className="text-slate-600" />
            </div>
            {showDropdown && dropdownPosition && createPortal(
                <div 
                    className="fixed bg-white border border-slate-300 shadow-xl rounded-sm z-[2000] flex flex-col max-h-48 overflow-y-auto"
                    style={{
                        top: dropdownPosition.top,
                        left: dropdownPosition.left,
                        minWidth: Math.max(120, dropdownPosition.width)
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
