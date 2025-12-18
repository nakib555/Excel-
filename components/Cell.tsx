
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

  // New features state
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => { setEditValue(data.raw); }, [data.raw]);

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  useEffect(() => {
    if (isActive && editing) inputRef.current?.focus();
  }, [isActive, editing]);

  // Handle dropdown positioning updates
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
                  // Optional: Close if scrolled far away to prevent confusion, but standard behavior is usually sticking or closing
                  // Here we stick
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

  // Click outside to close dropdown
  useEffect(() => {
      if (!showDropdown) return;
      const handleClickOutside = (e: MouseEvent) => {
          if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) && 
              containerRef.current && !containerRef.current.contains(e.target as Node)) {
              setShowDropdown(false);
          }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  // Shrink to Fit Implementation (Excel Feature)
  useLayoutEffect(() => {
    if (resolvedStyle.shrinkToFit && !resolvedStyle.wrapText && spanRef.current && !editing) {
       const span = spanRef.current;
       // approximate padding calculation based on indent
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

  // --- LOD (Level of Detail) Optimization ---
  const isMicroView = scale < 0.25; 
  const fontSize = Math.max(scale < 0.6 ? 7 : 9, (resolvedStyle.fontSize || 13) * scale);

  // Ghost Mode - Return optimized skeleton if scrolling fast
  if (isGhost) {
      return <CellSkeleton width={width} height={height} />;
  }

  // --- ALIGNMENT ENGINE ---
  // Mapping Excel alignment to CSS Flexbox
  const align = resolvedStyle.align || 'left'; // horizontal
  const verticalAlign = resolvedStyle.verticalAlign || 'bottom'; // vertical (Excel default is bottom for data)
  const indent = resolvedStyle.indent || 0;
  
  // X-Axis
  const justifyContent = align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start';
  
  // Y-Axis
  const alignItems = verticalAlign === 'top' ? 'flex-start' : verticalAlign === 'middle' ? 'center' : 'flex-end';

  // Indentation Logic (Padding)
  const indentPx = indent * 10 * scale; // Scale indent visually
  // Apply indent as padding based on alignment direction
  const paddingLeft = align === 'right' ? '4px' : `${4 + indentPx}px`;
  const paddingRight = align === 'right' ? `${4 + indentPx}px` : '4px';

  // Font Styles
  const fontWeight = resolvedStyle.bold ? '600' : '400';
  const fontStyle = resolvedStyle.italic ? 'italic' : 'normal';
  const textDecoration = resolvedStyle.underline ? 'underline' : 'none';
  const color = resolvedStyle.color || '#0f172a';
  const backgroundColor = resolvedStyle.bg || (isInRange ? 'rgba(16, 185, 129, 0.1)' : '#fff');
  
  // Orientation / Rotation Logic
  const verticalText = resolvedStyle.verticalText;
  const rotation = resolvedStyle.textRotation || 0;
  const cssRotation = rotation ? -rotation : 0; 
  const hasRotation = rotation !== 0;
  
  // Wrapping
  // 'pre-wrap' preserves newlines but wraps long text, matching Excel behavior
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
    justifyContent,
    alignItems,
    paddingLeft: verticalText ? 0 : paddingLeft,
    paddingRight: verticalText ? 0 : paddingRight,
    backgroundColor,
    borderRight: '1px solid #e2e8f0',
    borderBottom: '1px solid #e2e8f0',
    overflow: (hasRotation || verticalText) ? 'visible' : 'hidden', // Rotated text usually bleeds in Excel
  };

  const textStyle: React.CSSProperties = {
      fontFamily: 'inherit',
      fontSize: isMicroView ? 0 : `${fontSize}px`,
      fontWeight,
      fontStyle,
      textDecoration,
      color,
      whiteSpace,
      // Handle vertical text (stacking)
      ...(verticalText ? { 
          writingMode: 'vertical-rl', 
          textOrientation: 'upright', 
          letterSpacing: '1px'
      } : {}),
      // Handle rotation
      ...(hasRotation ? {
          transform: `rotate(${cssRotation}deg)`,
          transformOrigin: align === 'center' ? 'center' : align === 'right' ? 'center right' : 'center left',
      } : {
          // Shrink to fit logic
          transform: scaleFactor < 1 ? `scale(${scaleFactor})` : undefined,
          transformOrigin: align === 'right' ? 'right' : align === 'center' ? 'center' : 'left',
          width: resolvedStyle.wrapText ? '100%' : 'auto' // Allow wrap to fill width
      }),
      lineHeight: 1.2
  };
  
  // Map Excel alignment to CSS textAlign for input field
  const getCssTextAlign = (): React.CSSProperties['textAlign'] => {
      if (align === 'center' || align === 'centerAcross') return 'center';
      if (align === 'right') return 'right';
      if (align === 'justify' || align === 'distributed') return 'justify';
      return 'left';
  };
  const cssTextAlign = getCssTextAlign();

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative box-border select-none outline-none flex-shrink-0",
        isActive && "z-30",
        isSelected && !isActive && "z-10",
      )}
      style={containerStyle}
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
            fontFamily: 'inherit',
            textAlign: cssTextAlign 
          }}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
      ) : (
        !isMicroView && (
            data.isCheckbox ? (
                 <div className="flex items-center justify-center w-full h-full">
                     <input 
                        type="checkbox" 
                        checked={data.value === 'TRUE'} 
                        onChange={(e) => onChange(id, e.target.checked ? 'TRUE' : 'FALSE')}
                        className="w-4 h-4 accent-emerald-600 cursor-pointer"
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
                                // Only follow link if holding Ctrl or Meta (Command), otherwise select cell
                                if (!e.ctrlKey && !e.metaKey) {
                                    e.preventDefault();
                                }
                            }}
                            title={`Ctrl+Click to follow link: ${data.link}`}
                         >
                            <span className="sr-only">Link</span>
                         </a>
                    )}
                </span>
            )
        )
      )}

      {/* Link Indicator (small icon if space permits, or implicit by underline/blue) */}
      {data.link && !editing && isActive && (
          <div className="absolute top-0 right-0 p-0.5 bg-blue-50 z-20 cursor-pointer" title={`Go to ${data.link}`} onMouseDown={(e) => { e.stopPropagation(); window.open(data.link, '_blank'); }}>
               <ExternalLink size={10} className="text-blue-500" />
          </div>
      )}

      {/* Comment Indicator */}
      {data.comment && (
          <>
            <div className="absolute top-0 right-0 w-0 h-0 border-l-[6px] border-l-transparent border-t-[6px] border-t-red-500 z-10" />
            {(isHovered || isActive) && (
                createPortal(
                    <div 
                        className="fixed z-[9999] bg-yellow-50 border border-yellow-200 shadow-xl rounded-sm p-2 text-xs text-slate-800 max-w-[200px] break-words animate-in fade-in zoom-in-95 duration-200 pointer-events-none"
                        style={{
                            top: containerRef.current ? containerRef.current.getBoundingClientRect().top - 10 : 0,
                            left: containerRef.current ? containerRef.current.getBoundingClientRect().right + 10 : 0,
                        }}
                    >
                        <div className="font-bold mb-1 text-slate-500 text-[10px] uppercase">Comment</div>
                        {data.comment}
                    </div>,
                    document.body
                )
            )}
          </>
      )}

      {/* Data Validation Dropdown Arrow */}
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

      {isSelected && (
        <div className="absolute inset-0 pointer-events-none border-[2px] border-primary-500 shadow-glow mix-blend-multiply rounded-[3px]">
             {isActive && (
                <div 
                    className="absolute -bottom-[4px] -right-[4px] bg-primary-500 border border-white cursor-crosshair rounded-[2.5px] shadow-sm z-50 pointer-events-auto hover:scale-110 transition-transform" 
                    style={{ width: Math.max(6, 9 * scale), height: Math.max(6, 9 * scale) }}
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
