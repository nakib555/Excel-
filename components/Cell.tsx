
import React, { memo, useState, useRef, useEffect, useLayoutEffect, lazy, Suspense } from 'react';
import { CellData, CellStyle, ValidationRule } from '../types';
import { cn, formatCellValue, measureTextWidth, useSmartPosition } from '../utils';
import { CellSkeleton } from './Skeletons';
import { ChevronDown, ExternalLink } from 'lucide-react';
import { createPortal } from 'react-dom';
import { Tooltip } from './shared';
import AutocompleteList from './AutocompleteList';
import { COMMON_FUNCTIONS } from '../app/constants/functions';

// Lazy load the new FilterMenu
const FilterMenu = lazy(() => import('./menus/FilterMenu'));

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
  isFilterActive?: boolean;
  onToggleFilter?: (id: string | null) => void;
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
  onNavigate,
  isFilterActive,
  onToggleFilter
}: CellProps) => {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(data.raw);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const spanRef = useRef<HTMLSpanElement>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [scaleFactor, setScaleFactor] = useState(1);
  const commentRef = useRef<HTMLDivElement>(null);
  const filterBtnRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<any>(null);
  
  // Autocomplete State
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [triggerToken, setTriggerToken] = useState<{ start: number, end: number, text: string } | null>(null);
  const [acPosition, setAcPosition] = useState<{ top: number, left: number } | null>(null);

  const [isHovered, setIsHovered] = useState(false);
  
  // Touch detection for mobile adjustment
  const isTouch = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(pointer: coarse)').matches;

  // Logic for showing comment: 
  // 1. Must have comment data
  // 2. Must NOT be editing
  // 3. Desktop: Must be hovered
  // 4. Mobile/Touch: Can be active (selected) to allow viewing without hover
  const showComment = !!data.comment && !editing && (isHovered || (isActive && isTouch));
  
  // Use smart positioning for the comment tooltip
  // Note: useSmartPosition handles mobile axis adjustment automatically (forces vertical on mobile)
  const dropdownPosition = useSmartPosition(showDropdown, containerRef, dropdownRef, { fixedWidth: Math.max(120, width) });
  const commentPosition = useSmartPosition(showComment, containerRef, commentRef, { axis: 'horizontal', gap: 8, widthClass: 'max-w-[200px]' });

  useEffect(() => { setEditValue(data.raw); }, [data.raw]);

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  useEffect(() => {
    if (isActive && editing) inputRef.current?.focus();
  }, [isActive, editing]);

  // Disable editing if cell loses focus
  useEffect(() => {
      if (!isActive && editing) {
          setEditing(false);
          // If needed, commit change here, but usually onBlur handles it. 
          // If switching active cell rapidly, relying on onBlur of unmounted input is risky.
          // Since we are inside the same grid, the Cell component might re-render as inactive but not unmount.
          // The input will unmount. 
          if (editValue !== data.raw) {
              onChange(id, editValue);
          }
      }
  }, [isActive, editing, editValue, data.raw, id, onChange]);

  useEffect(() => {
      // Cleanup timeout on unmount
      return () => {
          if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      };
  }, []);

  // Autocomplete Logic
  useEffect(() => {
      if (!editing) {
          setSuggestions([]);
          return;
      }
      
      const input = inputRef.current;
      if (!input || !editValue) {
          setSuggestions([]);
          return;
      }

      const cursor = input.selectionStart || 0;
      // Find token backwards from cursor
      let start = cursor;
      while (start > 0) {
          const char = editValue[start - 1];
          // Stop at separators
          if (/[\s=(),]/.test(char)) break;
          start--;
      }

      const token = editValue.slice(start, cursor);
      if (token.length < 1) {
          setSuggestions([]);
          setTriggerToken(null);
          return;
      }

      const matches = COMMON_FUNCTIONS.filter(fn => fn.startsWith(token.toUpperCase()));
      if (matches.length > 0) {
          setSuggestions(matches);
          setTriggerToken({ start, end: cursor, text: token });
          setSelectedIndex(0);
          
          // Calculate position relative to container
          const rect = input.getBoundingClientRect();
          const leftOffset = Math.min(width, start * (fontSize * 0.6)); // Approximate char width based on font size
          
          setAcPosition({ 
              top: rect.bottom, 
              left: rect.left + leftOffset
          });
      } else {
          setSuggestions([]);
      }

  }, [editValue, editing]);

  const applySuggestion = (suggestion: string) => {
      if (!triggerToken || !inputRef.current) return;
      const before = editValue.slice(0, triggerToken.start);
      const after = editValue.slice(triggerToken.end);
      const newValue = before + suggestion + after;
      setEditValue(newValue);
      setSuggestions([]);
      
      // Restore focus and cursor
      setTimeout(() => {
          if (inputRef.current) {
              inputRef.current.focus();
              const newCursorPos = triggerToken.start + suggestion.length;
              inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
          }
      }, 0);
  };

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

  const isMicroView = scale < 0.25; 
  const fontSize = Math.max(scale < 0.6 ? 7 : 9, (resolvedStyle.fontSize || 13) * scale);
  const displayValue = formatCellValue(data.value, resolvedStyle);

  useLayoutEffect(() => {
    if (resolvedStyle.shrinkToFit && !resolvedStyle.wrapText && !editing && displayValue) {
       const indentPx = (resolvedStyle.indent || 0) * 10 * scale; 
       const totalPadding = 8 + indentPx; // 4px left + 4px right base
       const avail = width - totalPadding;
       
       if (avail > 0) {
           // Always use canvas measurement for ShrinkToFit to avoid DOM layout constraints (flex-shrink)
           const fontName = resolvedStyle.fontFamily || 'Inter, sans-serif';
           const isBold = !!resolvedStyle.bold;
           const isItalic = !!resolvedStyle.italic;
           
           // Use measureTextWidth to get the true unconstrained width
           const textWidth = measureTextWidth(displayValue, fontSize, fontName, isBold, isItalic);
           
           // Calculate Scale
           if (textWidth > 0) {
                // Add a small buffer to ensure visual clearance
                const requiredWidth = textWidth + 1;
                
                if (requiredWidth > avail) {
                    const ratio = avail / requiredWidth;
                    // Cap scale between 0.1 and 1 to avoid invisibility or scaling up
                    setScaleFactor(Math.max(0.1, Math.min(1, ratio)));
                } else {
                    setScaleFactor(1);
                }
           } else {
               setScaleFactor(1);
           }
       } else {
           setScaleFactor(1);
       }
    } else {
        if (scaleFactor !== 1) setScaleFactor(1);
    }
  }, [displayValue, resolvedStyle, width, fontSize, scale, editing]);

  const handleBlur = () => {
    // Delay blur to allow suggestion click
    setTimeout(() => {
        setEditing(false);
        setSuggestions([]);
        if (editValue !== data.raw) onChange(id, editValue);
    }, 200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (suggestions.length > 0) {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(i => (i + 1) % suggestions.length);
            return;
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(i => (i - 1 + suggestions.length) % suggestions.length);
            return;
        }
        if (e.key === 'Tab' || e.key === 'Enter') {
            e.preventDefault();
            applySuggestion(suggestions[selectedIndex]);
            return;
        }
        if (e.key === 'Escape') {
            e.preventDefault();
            setSuggestions([]);
            return;
        }
    }

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

  // --- Hover Handlers with Debounce ---
  const handleMouseEnter = () => {
      onMouseEnter(id); // Trigger parent selection/drag logic immediately
      
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      // Delay showing comment by 600ms to avoid flashing during quick mouse movement
      hoverTimeoutRef.current = setTimeout(() => {
          setIsHovered(true);
      }, 600);
  };

  const handleMouseLeave = () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      setIsHovered(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      setIsHovered(false); // Hide comment immediately on click
      onMouseDown(id, e.shiftKey);
  };

  if (isGhost) {
      return <CellSkeleton width={width} height={height} />;
  }

  const align = resolvedStyle.align || 'left'; 
  const verticalAlign = resolvedStyle.verticalAlign || 'bottom';
  const indent = resolvedStyle.indent || 0;
  
  const justifyContent = align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start';
  const alignItems = verticalAlign === 'top' ? 'flex-start' : verticalAlign === 'middle' ? 'center' : 'flex-end';

  // Calculate dynamic filter button size and padding
  const filterBtnSize = Math.max(14, 18 * scale);
  const showFilter = !!data.filterButton && !editing && !isMicroView && height > (filterBtnSize - 4);
  // Increased padding buffer slightly to avoid visual cramp
  const filterPadding = showFilter ? (filterBtnSize + 6 * scale) : 0;

  const indentPx = indent * 10 * scale; 
  const paddingLeft = align === 'right' ? '4px' : `${4 + indentPx}px`;
  // Add extra padding to the right to prevent text overlapping the filter button
  const paddingRight = align === 'right' ? `${4 + indentPx + filterPadding}px` : `${4 + filterPadding}px`;

  const fontWeight = resolvedStyle.bold ? '600' : '400';
  const fontStyle = resolvedStyle.italic ? 'italic' : 'normal';
  const textDecoration = resolvedStyle.underline ? 'underline' : 'none';
  const color = resolvedStyle.color || '#0f172a';
  const backgroundColor = resolvedStyle.bg || (isInRange ? 'rgba(16, 185, 129, 0.08)' : '#fff'); 
  
  const verticalText = resolvedStyle.verticalText;
  const rotation = resolvedStyle.textRotation || 0;
  const cssRotation = rotation ? -rotation : 0; 
  const hasRotation = rotation !== 0;
  
  const whiteSpace = resolvedStyle.wrapText ? 'pre-wrap' : 'nowrap';

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

  const getCssTextAlign = (): React.CSSProperties['textAlign'] => {
      if (align === 'center' || align === 'centerAcross') return 'center';
      if (align === 'right') return 'right';
      return 'left';
  };
  const cssTextAlign = getCssTextAlign();

  const textStyle: React.CSSProperties = {
      fontFamily: resolvedStyle.fontFamily || 'Inter, sans-serif',
      fontSize: isMicroView ? 0 : `${fontSize}px`,
      fontWeight,
      fontStyle,
      textDecoration,
      color,
      whiteSpace,
      textAlign: cssTextAlign,
      display: 'inline-block', // Important for transform
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
  
  // Validation Dropdown Logic
  const hasListValidation = isActive && validation && validation.type === 'list' && !isGhost;
  const listOptions = hasListValidation ? validation.value1.split(',').map(s => s.trim()) : [];

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative box-border select-none outline-none flex-shrink-0",
        isActive && "z-30",
      )}
      style={containerStyle}
      data-cell-id={id}
      onMouseDown={handleMouseDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onDoubleClick={() => { setEditing(true); onDoubleClick(id); }}
    >
      {editing ? (
        <>
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
            <AutocompleteList 
                suggestions={suggestions}
                selectedIndex={selectedIndex}
                onSelect={applySuggestion}
                position={acPosition}
            />
        </>
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
          <Tooltip content={`Go to ${data.link}`}>
              <div 
                className="absolute top-0 right-0 p-0.5 bg-blue-50 z-20 cursor-pointer" 
                onMouseDown={(e) => { e.stopPropagation(); window.open(data.link, '_blank'); }}
              >
                   <ExternalLink size={10} className="text-blue-500" />
              </div>
          </Tooltip>
      )}

      {data.comment && (
          <>
            <div 
                className="absolute top-0 right-0 w-0 h-0 border-l-[6px] border-l-transparent border-t-[6px] border-t-red-600 z-10" 
                style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.1))' }}
            />
            {showComment && commentPosition && (
                createPortal(
                    <div 
                        ref={commentRef}
                        className={cn(
                            "fixed z-[1] bg-[#ffffe1] border border-slate-300 shadow-xl rounded-[2px] p-2 text-xs text-slate-800 max-w-[200px] break-words pointer-events-none flex flex-col gap-1",
                            commentPosition.ready && "animate-in fade-in zoom-in-95 duration-150"
                        )}
                        style={{
                            top: commentPosition.top,
                            left: commentPosition.left,
                            bottom: commentPosition.bottom,
                            transformOrigin: commentPosition.transformOrigin,
                            opacity: commentPosition.ready ? 1 : 0
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

      {/* Filter Button for Table Headers - Improved Layout */}
      {showFilter && (
          <>
            <div 
                ref={filterBtnRef}
                className={cn(
                    "absolute z-20 flex items-center justify-center bg-gradient-to-b from-white to-slate-50 border border-slate-300 rounded-[3px] shadow-[0_1px_2px_rgba(0,0,0,0.05)] cursor-pointer hover:border-slate-400 hover:shadow-md hover:to-white active:bg-slate-100 active:shadow-inner active:scale-95 transition-all duration-200 group/filter",
                    isFilterActive && "bg-slate-200 border-slate-400"
                )}
                style={{
                    width: filterBtnSize,
                    height: filterBtnSize,
                    right: 3 * scale,
                    top: '50%',
                    transform: 'translateY(-50%)' // Precise vertical centering
                }}
                onMouseDown={(e) => { 
                    e.stopPropagation(); 
                    if (onToggleFilter) {
                        onToggleFilter(isFilterActive ? null : id);
                    }
                }}
            >
                <ChevronDown 
                    size={Math.max(8, 10 * scale)} 
                    className="text-slate-400 group-hover/filter:text-slate-600 transition-colors" 
                    strokeWidth={2.5} 
                />
            </div>
            {/* Lazy Loaded Filter Menu */}
            {isFilterActive && (
                <Suspense fallback={null}>
                    <FilterMenu 
                        isOpen={true} 
                        onClose={() => onToggleFilter && onToggleFilter(null)} 
                        triggerRef={filterBtnRef}
                    />
                </Suspense>
            )}
          </>
      )}

      {hasListValidation && (
          <>
            <div 
                className="absolute right-0 top-0 bottom-0 w-5 bg-slate-100 hover:bg-slate-200 border-l border-slate-300 flex items-center justify-center cursor-pointer z-50"
                onMouseDown={(e) => { e.stopPropagation(); setShowDropdown(!showDropdown); }}
            >
                <ChevronDown size={12} className="text-slate-600" />
            </div>
            {showDropdown && dropdownPosition && createPortal(
                <div 
                    className={cn(
                        "fixed bg-white border border-slate-300 shadow-xl rounded-sm z-[2000] flex flex-col overflow-y-auto",
                        dropdownPosition.ready && "animate-in fade-in zoom-in-95 duration-100"
                    )}
                    style={{
                        top: dropdownPosition.top,
                        bottom: dropdownPosition.bottom,
                        left: dropdownPosition.left,
                        // If constrained width is set by smartPosition, use it. Otherwise enforce minWidth.
                        width: dropdownPosition.width,
                        minWidth: dropdownPosition.width ? undefined : 120,
                        maxHeight: dropdownPosition.maxHeight,
                        transformOrigin: dropdownPosition.transformOrigin,
                        opacity: dropdownPosition.ready ? 1 : 0
                    }}
                    ref={dropdownRef}
                    onMouseDown={(e) => e.stopPropagation()} 
                >
                    {listOptions.map(opt => (
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
    prev.validation === next.validation &&
    prev.isFilterActive === next.isFilterActive
  );
});

Cell.displayName = 'Cell';
export default Cell;
