
import React, { useMemo, useCallback, useState, useEffect, useRef, memo } from 'react';
import { createPortal } from 'react-dom';
import { DataGrid, Column, RenderCellProps, DataGridHandle } from 'react-data-grid';
import { useDrag } from '@use-gesture/react';
import { CellId, CellData, GridSize, CellStyle, ValidationRule } from '../types';
import { numToChar, getCellId, formatCellValue, parseCellId, cn, getRange } from '../utils';
import { NavigationDirection } from './Cell';
import { ExternalLink } from 'lucide-react';
import { Tooltip } from './shared';
import { DEFAULT_ROW_HEIGHT, DEFAULT_COL_WIDTH } from '../app/constants/grid.constants';

import 'react-data-grid/lib/styles.css';

interface GridProps {
  size: GridSize;
  cells: Record<CellId, CellData>;
  styles: Record<string, CellStyle>;
  merges: string[];
  validations: Record<CellId, ValidationRule>;
  activeCell: CellId | null;
  selectionRange: CellId[] | null;
  columnWidths: Record<string, number>;
  rowHeights: Record<number, number>;
  scale?: number;
  centerActiveCell?: boolean;
  onCellClick: (id: CellId, isShift: boolean) => void;
  onCellChange: (id: CellId, val: string) => void;
  onNavigate: (direction: NavigationDirection, isShift: boolean) => void;
  onColumnResize: (id: string, width: number) => void;
  onRowResize: (rowIdx: number, height: number) => void;
  onSelectionDrag?: (startId: string, endId: string) => void;
  onCellDoubleClick?: (id: CellId) => void;
  onExpandGrid?: (direction: 'row' | 'col') => void;
  onZoom?: (delta: number) => void;
  onFill?: (source: CellId[], target: CellId[]) => void;
  onAutoFit?: (colIdx: number) => void;
  onAutoFitRow?: (rowIdx: number) => void;
  onScrollToActiveCell?: () => void;
  onMoveCells?: (source: CellId[], targetStartId: CellId) => void;
}

const CommentTooltip = ({ text, rect }: { text: string, rect: DOMRect }) => {
    return createPortal(
        <div 
            className="fixed z-[9999] bg-[#ffffe1] border border-slate-400 shadow-[2px_2px_5px_rgba(0,0,0,0.2)] p-2 text-xs text-slate-900 pointer-events-none max-w-[200px] break-words animate-in fade-in zoom-in-95 duration-100"
            style={{
                top: rect.top,
                left: rect.right + 5,
            }}
        >
            <div className="font-bold mb-1 text-slate-500 text-[10px] uppercase tracking-wider">Comment</div>
            {text}
        </div>,
        document.body
    );
};

// --- FILL HANDLE COMPONENT ---
const FillHandle = ({ onFillStart, onFillMove, onFillEnd, size }: { onFillStart: () => void, onFillMove: (x: number, y: number) => void, onFillEnd: () => void, size: number }) => {
    const bind = useDrag(({ down, xy: [x, y], first, last, event }) => {
        if (event) event.stopPropagation(); 
        
        if (first) onFillStart();
        if (down) onFillMove(x, y);
        if (last) onFillEnd();
    }, { pointer: { keys: false } });

    return (
        <div 
            {...bind()} 
            className="absolute -bottom-[4px] -right-[4px] bg-[#107c41] border border-white z-[70] pointer-events-auto cursor-crosshair shadow-sm hover:scale-125 transition-transform touch-none fill-handle rounded-[1px]"
            style={{ width: size, height: size }}
        />
    );
};

// --- SELECTION HANDLE COMPONENT (MOBILE) ---
const SelectionHandle = ({ type, size, onResizeInit }: any) => {
    return (
        <div
            onPointerDown={(e) => {
                e.stopPropagation(); 
                e.preventDefault(); 
                (e.target as Element).setPointerCapture(e.pointerId);
                onResizeInit(e, type);
            }}
            className="absolute z-[100] bg-white rounded-full border-[3px] border-[#107c41] shadow-md pointer-events-auto touch-none cursor-move flex items-center justify-center transition-transform active:scale-110"
            style={{ 
                width: size, 
                height: size, 
                top: type === 'tl' ? 0 : '100%',
                left: type === 'tl' ? 0 : '100%',
                transform: 'translate(-50%, -50%)',
            }}
        />
    );
};

// --- SELECTION OVERLAY COMPONENT ---
interface SelectionRect { x: number, y: number, w: number, h: number }

const SelectionOverlay = memo(({ 
    rect, 
    scroll, 
    scale,
    isScrolling,
    isTouch,
    onFillStart,
    onFillMove,
    onFillEnd,
    onResizeInit
}: { 
    rect: SelectionRect | null, 
    scroll: { left: number, top: number },
    scale: number,
    isScrolling: boolean,
    isTouch: boolean,
    onFillStart: () => void,
    onFillMove: (x: number, y: number) => void,
    onFillEnd: () => void,
    onResizeInit: (e: React.PointerEvent, type: 'tl' | 'br') => void
}) => {
    if (!rect) return null;

    // Fixed Header Dimensions (matches DataGrid config)
    const headerHeight = 32 * scale;
    const rowHeaderWidth = 46 * scale;

    // Adjust position relative to the grid container
    // Shift -1px to align the border centered on grid lines
    const top = rect.y + headerHeight - scroll.top - 1;
    // Adjusted by +1.0px (moved left another 0.5px)
    const left = rect.x + rowHeaderWidth - scroll.left + 1.0;
    
    // Add +2px to encompass the border width properly around cells
    const width = rect.w + 2;
    const height = rect.h + 2;
    
    const fillHandleSize = Math.max(8, 8 * scale);
    const selectionHandleSize = Math.max(18, 18 * scale);

    return (
        <div
            className="absolute border-[2px] border-[#107c41] pointer-events-none z-[25] box-border"
            style={{
                top: `${top}px`,
                left: `${left}px`,
                width: `${width}px`,
                height: `${height}px`,
                // Disable transition during scroll to prevent drifting/lag
                transition: isScrolling 
                    ? 'none' 
                    : 'top 0.1s, left 0.1s, width 0.1s, height 0.1s'
            }}
        >
            {/* Desktop Fill Handle */}
            {!isTouch && (
                <FillHandle 
                    onFillStart={onFillStart}
                    onFillMove={onFillMove}
                    onFillEnd={onFillEnd}
                    size={fillHandleSize}
                />
            )}

            {/* Mobile Selection Handles */}
            {isTouch && (
                <>
                    <SelectionHandle type="tl" size={selectionHandleSize} onResizeInit={onResizeInit} />
                    <SelectionHandle type="br" size={selectionHandleSize} onResizeInit={onResizeInit} />
                </>
            )}
        </div>
    );
});

// --- EXCEL CELL RENDERER ---
const CustomCellRenderer = memo(({ 
    row, 
    column, 
    cells, 
    styles, 
    activeCell, 
    selectionSet,
    fillSet,
    isFilling,
    isTouch,
    scale,
    onMouseEnter,
    onDragStart,
    onCellClick 
}: RenderCellProps<any> & { 
    cells: Record<string, CellData>, 
    styles: Record<string, CellStyle>,
    activeCell: string | null,
    selectionSet: Set<string>,
    fillSet: Set<string>,
    isFilling: boolean,
    isTouch: boolean,
    scale: number,
    onMouseEnter: (id: string) => void,
    onDragStart: (e: React.MouseEvent, id: string) => void,
    onCellClick: (id: string, isShift: boolean) => void
}) => {
  const cellId = getCellId(parseInt(column.key), row.id);
  const cellData = cells[cellId];
  const [isHovered, setIsHovered] = useState(false);
  const cellRef = useRef<HTMLDivElement>(null);
  
  const isActive = activeCell === cellId;
  const isInSelection = selectionSet.has(cellId);
  const isInFill = isFilling && fillSet.has(cellId);

  const styleId = cellData?.styleId;
  const style = styleId ? styles[styleId] : {};
  const displayValue = formatCellValue(cellData?.value || '', style);

  const verticalText = style.verticalText;
  const rotation = style.textRotation || 0;
  const cssRotation = rotation ? -rotation : 0; 
  const hasRotation = rotation !== 0;
  
  const indent = style.indent || 0;
  const indentPx = indent * 10 * scale;
  const paddingLeft = style.align === 'right' ? 4 * scale : (4 * scale) + indentPx;
  const paddingRight = style.align === 'right' ? (4 * scale) + indentPx : 4 * scale;

  const baseStyle: React.CSSProperties = {
      width: '100%',
      height: '100%',
      paddingLeft: verticalText ? 0 : `${paddingLeft}px`,
      paddingRight: verticalText ? 0 : `${paddingRight}px`,
      display: 'flex',
      alignItems: style.verticalAlign === 'middle' ? 'center' : style.verticalAlign === 'top' ? 'flex-start' : 'flex-end',
      justifyContent: style.align === 'center' ? 'center' : style.align === 'right' ? 'flex-end' : 'flex-start',
      overflow: 'visible', 
      position: 'relative',
      cursor: 'cell',
      fontFamily: style.fontFamily || 'Calibri, "Segoe UI", sans-serif',
      fontSize: `${(style.fontSize || 13) * scale}px`,
      fontWeight: style.bold ? '700' : '400',
      fontStyle: style.italic ? 'italic' : 'normal',
      textDecoration: style.underline ? 'underline' : 'none',
      backgroundColor: style.bg || 'transparent', 
      color: style.color || 'inherit',
      whiteSpace: style.wrapText ? 'pre-wrap' : 'nowrap',
      ...(verticalText ? { 
          writingMode: 'vertical-rl', 
          textOrientation: 'upright', 
          letterSpacing: `${1 * scale}px`
      } : {}),
      ...(hasRotation ? {
          transform: `rotate(${cssRotation}deg)`,
          transformOrigin: 'center',
          justifyContent: 'center',
          alignItems: 'center'
      } : {})
  };

  if (style.strikethrough) {
      baseStyle.textDecoration = `${baseStyle.textDecoration} line-through`;
  }

  const borderThickness = Math.max(1, 1 * scale);
  const thickBorderThickness = Math.max(2, 2 * scale);

  if (style.borders) {
      const getBWidth = (s?: string) => s === 'thick' ? `${thickBorderThickness}px` : `${borderThickness}px`;
      if (style.borders.bottom) baseStyle.borderBottom = `${getBWidth(style.borders.bottom.style)} solid ${style.borders.bottom.color}`;
      if (style.borders.top) baseStyle.borderTop = `${getBWidth(style.borders.top.style)} solid ${style.borders.top.color}`;
      if (style.borders.left) baseStyle.borderLeft = `${getBWidth(style.borders.left.style)} solid ${style.borders.left.color}`;
      if (style.borders.right) baseStyle.borderRight = `${getBWidth(style.borders.right.style)} solid ${style.borders.right.color}`;
  }

  return (
    <div 
        ref={cellRef}
        style={baseStyle}
        onMouseEnter={() => { onMouseEnter(cellId); setIsHovered(true); }}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => {
            if (isTouch) {
                onCellClick(cellId, false);
            }
        }}
        className="relative group select-none"
        data-cell-id={cellId}
    >
      {/* Background Selection Highlight (Dimmed) */}
      <div 
          className={cn(
              "absolute inset-0 bg-[#107c41] pointer-events-none z-[5]",
              (isInSelection && !isActive) ? "opacity-[0.10]" : "opacity-0"
          )}
          style={{ transition: 'all 0.08s ease-out' }} 
      />
      
      {/* Fill Selection Highlight */}
      <div 
          className={cn(
              "absolute inset-0 bg-gray-400 pointer-events-none z-[5]",
              (isInFill && !isInSelection) ? "opacity-20" : "opacity-0"
          )} 
          style={{ transition: 'all 0.08s ease-out' }}
      />

      <div className="relative z-0 w-full h-full flex" style={{ alignItems: baseStyle.alignItems, justifyContent: baseStyle.justifyContent }}>
          {displayValue}
      </div>
      
      {cellData?.link && <ExternalLink size={10 * scale} className="absolute top-1 right-1 text-blue-500 opacity-50" />}

      {cellData?.comment && (
          <>
            <div 
                className="absolute top-0 right-0 w-0 h-0 border-l-transparent border-t-red-600 z-[20]" 
                style={{
                    borderLeftWidth: `${6 * scale}px`,
                    borderTopWidth: `${6 * scale}px`
                }}
            />
            {isHovered && cellRef.current && (
                <CommentTooltip text={cellData.comment} rect={cellRef.current.getBoundingClientRect()} />
            )}
          </>
      )}
    </div>
  );
}, (prev, next) => {
    const colKey = parseInt(next.column.key);
    const rowId = next.row.id;
    const cellId = getCellId(colKey, rowId);
    
    if (prev.scale !== next.scale) return false;
    if (prev.cells[cellId] !== next.cells[cellId]) return false;
    if (prev.styles !== next.styles) return false;

    const wasActive = prev.activeCell === cellId;
    const isActive = next.activeCell === cellId;
    if (wasActive !== isActive) return false;
    
    const wasInSelection = prev.selectionSet.has(cellId);
    const isInSelection = next.selectionSet.has(cellId);
    if (wasInSelection !== isInSelection) return false;
    
    const wasInFill = prev.fillSet.has(cellId);
    const isInFill = next.fillSet.has(cellId);
    if (wasInFill !== isInFill) return false;
    
    if (prev.isFilling !== next.isFilling) return false;
    if (prev.isTouch !== next.isTouch) return false;

    return true;
});

const Grid: React.FC<GridProps> = ({
  size,
  cells,
  styles,
  activeCell,
  selectionRange,
  columnWidths,
  rowHeights,
  centerActiveCell,
  scale = 1,
  onCellClick,
  onCellChange,
  onColumnResize,
  onSelectionDrag,
  onExpandGrid,
  onFill,
  onScrollToActiveCell,
  onMoveCells
}) => {
  const [isTouch, setIsTouch] = useState(false);
  const gridRef = useRef<DataGridHandle>(null);
  
  const [isFilling, setIsFilling] = useState(false);
  const [fillStartRange, setFillStartRange] = useState<string[] | null>(null);
  const [fillTargetRange, setFillTargetRange] = useState<string[] | null>(null);

  // Resize Handlers Refs
  const [resizingHandle, setResizingHandle] = useState<'tl' | 'br' | null>(null);
  const resizeAnchorRef = useRef<string | null>(null);
  
  // Scrolling State for Overlay
  const [scrollPos, setScrollPos] = useState({ left: 0, top: 0 });
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollHeight, clientHeight, scrollLeft, scrollWidth, clientWidth } = event.currentTarget;
      
      // Update scroll pos for overlay
      setScrollPos({ left: scrollLeft, top: scrollTop });
      setIsScrolling(true);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => setIsScrolling(false), 150);

      // Expansion logic
      if (scrollHeight - scrollTop - clientHeight < 200) onExpandGrid?.('row');
      if (scrollWidth - scrollLeft - clientWidth < 200) onExpandGrid?.('col');
  }, [onExpandGrid]);

  // Gesture handling for main grid interaction (Selection)
  const bindGridGestures = useDrag((state) => {
      const { event, first, down, xy: [x, y], memo } = state;
      
      // Ignore if touching fill handle or scrollbars roughly
      if (event.target instanceof Element && event.target.closest('.fill-handle')) return;
      // Ignore if dragging a selection handle (logic handled globally)
      if (resizingHandle) return;
      
      if (first) {
           const el = document.elementFromPoint(x, y);
           const cellEl = el?.closest('[data-cell-id]');
           if (cellEl) {
               const id = cellEl.getAttribute('data-cell-id')!;
               // Trigger initial selection (set anchor)
               onCellClick(id, state.shiftKey);
               return { startId: id }; // Memoize startId
           }
           return null;
      }
      
      if (down && memo?.startId && onSelectionDrag) {
           const el = document.elementFromPoint(x, y);
           const cellEl = el?.closest('[data-cell-id]');
           if (cellEl) {
               const id = cellEl.getAttribute('data-cell-id')!;
               if (id !== memo.startId) {
                   onSelectionDrag(memo.startId, id);
               }
           }
      }
  }, {
      pointer: { keys: false },
      preventScroll: true,
      enabled: !isTouch && !resizingHandle // DISABLE ON TOUCH to allow native scrolling.
  });

  useEffect(() => {
      const checkTouch = () => setIsTouch(window.matchMedia('(pointer: coarse)').matches);
      checkTouch();
      window.addEventListener('resize', checkTouch);
      return () => window.removeEventListener('resize', checkTouch);
  }, []);

  useEffect(() => {
      if (centerActiveCell && activeCell && gridRef.current) {
          const coords = parseCellId(activeCell);
          if (coords) {
              gridRef.current.scrollToCell({ rowIdx: coords.row, idx: coords.col });
              if (onScrollToActiveCell) {
                  requestAnimationFrame(onScrollToActiveCell);
              }
          }
      }
  }, [centerActiveCell, activeCell, onScrollToActiveCell]);

  const selectionSet = useMemo(() => new Set(selectionRange || []), [selectionRange]);
  const fillSet = useMemo(() => new Set(fillTargetRange || []), [fillTargetRange]);
  const activeCoords = useMemo(() => parseCellId(activeCell || ''), [activeCell]);

  const selectionBounds = useMemo(() => {
      if (!selectionRange || selectionRange.length === 0) return null;
      const pFirst = parseCellId(selectionRange[0]);
      const pLast = parseCellId(selectionRange[selectionRange.length - 1]);
      if (!pFirst || !pLast) return null;
      return {
          minRow: Math.min(pFirst.row, pLast.row),
          maxRow: Math.max(pFirst.row, pLast.row),
          minCol: Math.min(pFirst.col, pLast.col),
          maxCol: Math.max(pFirst.col, pLast.col)
      };
  }, [selectionRange]);

  const fillBounds = useMemo(() => {
      if (!fillTargetRange || fillTargetRange.length === 0) return null;
      const pFirst = parseCellId(fillTargetRange[0]);
      const pLast = parseCellId(fillTargetRange[fillTargetRange.length - 1]);
      if (!pFirst || !pLast) return null;
      return {
          minRow: Math.min(pFirst.row, pLast.row),
          maxRow: Math.max(pFirst.row, pLast.row),
          minCol: Math.min(pFirst.col, pLast.col),
          maxCol: Math.max(pFirst.col, pLast.col)
      };
  }, [fillTargetRange]);

  // --- OVERLAY GEOMETRY CALCULATION ---
  const selectionRect = useMemo(() => {
      if (!selectionBounds) return null;
      
      let y = 0;
      for (let r = 0; r < selectionBounds.minRow; r++) {
          y += (rowHeights[r] ?? DEFAULT_ROW_HEIGHT) * scale;
      }
      let h = 0;
      for (let r = selectionBounds.minRow; r <= selectionBounds.maxRow; r++) {
          h += (rowHeights[r] ?? DEFAULT_ROW_HEIGHT) * scale;
      }

      let x = 0;
      for (let c = 0; c < selectionBounds.minCol; c++) {
          x += (columnWidths[numToChar(c)] ?? DEFAULT_COL_WIDTH) * scale;
      }
      let w = 0;
      for (let c = selectionBounds.minCol; c <= selectionBounds.maxCol; c++) {
          w += (columnWidths[numToChar(c)] ?? DEFAULT_COL_WIDTH) * scale;
      }

      return { x, y, w, h };
  }, [selectionBounds, rowHeights, columnWidths, scale]);

  const handleMouseEnter = useCallback((id: string) => {
      // Used for tracking hover states if needed
  }, []);

  // --- FILL GESTURE LOGIC ---
  const handleFillStart = useCallback(() => {
      if (selectionRange && selectionRange.length > 0) {
          setIsFilling(true);
          setFillStartRange(selectionRange);
          setFillTargetRange(selectionRange);
      }
  }, [selectionRange]);

  const handleFillMove = useCallback((x: number, y: number) => {
      if (fillStartRange && selectionBounds) {
          const el = document.elementFromPoint(x, y);
          const cellEl = el?.closest('[data-cell-id]');
          
          if (cellEl) {
              const id = cellEl.getAttribute('data-cell-id');
              if (!id) return;

              const hoverCoords = parseCellId(id);
              if (!hoverCoords) return;
              
              const { row: hRow, col: hCol } = hoverCoords;
              const { minRow, maxRow, minCol, maxCol } = selectionBounds;

              let tMinR = minRow, tMaxR = maxRow, tMinC = minCol, tMaxC = maxCol;

              // Simple 1D fill direction heuristic
              if (hRow > maxRow) tMaxR = hRow;
              else if (hRow < minRow) tMinR = hRow;
              
              if (hCol > maxCol) tMaxC = hCol;
              else if (hCol < minCol) tMinC = hCol;

              const startId = getCellId(tMinC, tMinR);
              const endId = getCellId(tMaxC, tMaxR);
              const newRange = getRange(startId, endId);
              
              setFillTargetRange(newRange);
          }
      }
  }, [fillStartRange, selectionBounds]);

  const handleFillEnd = useCallback(() => {
      if (isFilling && fillStartRange && fillTargetRange && onFill) {
          onFill(fillStartRange, fillTargetRange);
      }
      setIsFilling(false);
      setFillStartRange(null);
      setFillTargetRange(null);
  }, [isFilling, fillStartRange, fillTargetRange, onFill]);

  // --- GLOBAL SELECTION RESIZE LOGIC (MOBILE) ---
  const handleResizeInit = useCallback((e: React.PointerEvent, handleType: 'tl' | 'br') => {
      if (!selectionBounds) return;
      const { minRow, maxRow, minCol, maxCol } = selectionBounds;
      
      // Anchor is the opposite corner
      const anchorRow = handleType === 'tl' ? maxRow : minRow;
      const anchorCol = handleType === 'tl' ? maxCol : minCol;
      
      resizeAnchorRef.current = getCellId(anchorCol, anchorRow);
      setResizingHandle(handleType);
  }, [selectionBounds]);

  useEffect(() => {
      if (!resizingHandle || !onSelectionDrag || !resizeAnchorRef.current) return;

      const handlePointerMove = (e: PointerEvent) => {
          e.preventDefault(); 
          
          // Auto Scroll Logic
          const SCROLL_ZONE = 50;
          const SCROLL_SPEED = 15;
          const viewportHeight = window.innerHeight;
          const viewportWidth = window.innerWidth;
          
          let scrollX = 0;
          let scrollY = 0;

          if (e.clientY < SCROLL_ZONE + 100) scrollY = -SCROLL_SPEED;
          else if (e.clientY > viewportHeight - SCROLL_ZONE) scrollY = SCROLL_SPEED;
          
          if (e.clientX < SCROLL_ZONE) scrollX = -SCROLL_SPEED;
          else if (e.clientX > viewportWidth - SCROLL_ZONE) scrollX = SCROLL_SPEED;

          if ((scrollX !== 0 || scrollY !== 0) && gridRef.current?.element) {
              gridRef.current.element.scrollBy(scrollX, scrollY);
          }

          // Hit Test
          const elements = document.elementsFromPoint(e.clientX, e.clientY);
          const cellEl = elements.find(el => el.hasAttribute('data-cell-id'));
          
          if (cellEl) {
              const id = cellEl.getAttribute('data-cell-id')!;
              if (id !== resizeAnchorRef.current) {
                   onSelectionDrag(resizeAnchorRef.current!, id);
              }
          }
      };

      const handlePointerUp = () => {
          setResizingHandle(null);
          resizeAnchorRef.current = null;
      };

      window.addEventListener('pointermove', handlePointerMove, { passive: false });
      window.addEventListener('pointerup', handlePointerUp);
      window.addEventListener('pointercancel', handlePointerUp);

      return () => {
          window.removeEventListener('pointermove', handlePointerMove);
          window.removeEventListener('pointerup', handlePointerUp);
          window.removeEventListener('pointercancel', handlePointerUp);
      };
  }, [resizingHandle, onSelectionDrag]);

  // Stub for move logic
  const handleDragStart = useCallback((e: React.MouseEvent, id: string) => {
      // Logic for moving cells would go here using a separate useDrag
  }, []);

  const columns = useMemo((): Column<any>[] => {
    return [
       { 
         key: 'row-header', 
         name: '', 
         width: 46 * scale, 
         frozen: true, 
         resizable: false,
         renderCell: (props) => {
            const isRowActive = activeCoords?.row === props.row.id;
            return (
                <Tooltip content={`Row ${props.row.id + 1}`}>
                    <div className={cn(
                        "flex items-center justify-center w-full h-full font-semibold select-none",
                        isRowActive 
                            ? "bg-[#e0f2f1] text-[#107c41] font-bold border-r-[3px] border-r-[#107c41]" 
                            : "bg-[#f8f9fa] text-[#444]"
                    )}
                    style={{ fontSize: `${11 * scale}px` }}
                    >
                        {props.row.id + 1}
                    </div>
                </Tooltip>
            );
         },
         renderHeaderCell: () => (
             <div 
                className="w-full h-full bg-[#f8f9fa] flex items-end justify-end p-0.5 cursor-pointer hover:bg-slate-200 transition-colors"
             >
                 <svg viewBox="0 0 10 10" className="w-3 h-3 fill-slate-400 mr-0.5 mb-0.5">
                    <path d="M10 10H0L10 0z" />
                 </svg>
             </div>
         )
       }, 
       ...Array.from({ length: size.cols }, (_, i) => {
          const colChar = numToChar(i);
          return {
            key: i.toString(),
            name: colChar,
            resizable: true,
            width: (columnWidths[colChar] || 100) * scale,
            renderCell: (props) => (
                <CustomCellRenderer 
                    {...props} 
                    cells={cells} 
                    styles={styles} 
                    activeCell={activeCell}
                    selectionSet={selectionSet}
                    fillSet={fillSet}
                    isFilling={isFilling}
                    isTouch={isTouch}
                    scale={scale}
                    onMouseEnter={handleMouseEnter}
                    onDragStart={handleDragStart}
                    onCellClick={onCellClick}
                />
            ),
            renderHeaderCell: (props) => {
                const isColActive = activeCoords?.col === i;
                return (
                    <Tooltip content={`Column ${props.column.name}`}>
                        <div className={cn(
                            "flex items-center justify-center w-full h-full font-semibold",
                            isColActive 
                                ? "bg-[#e0f2f1] text-[#107c41] font-bold border-b-[3px] border-b-[#107c41]" 
                                : "bg-[#f8f9fa] text-[#444]"
                        )}
                        style={{ fontSize: `${12 * scale}px` }}
                        >
                            {props.column.name}
                        </div>
                    </Tooltip>
                );
            }
          };
       })
    ];
  }, [size.cols, columnWidths, cells, styles, activeCell, selectionSet, fillSet, isFilling, isTouch, scale, activeCoords, handleMouseEnter, handleDragStart, onCellChange, onCellClick]);

  const rows = useMemo(() => Array.from({ length: size.rows }, (_, r) => ({ id: r })), [size.rows]);

  return (
    <div className="w-full h-full text-sm bg-white select-none relative" {...bindGridGestures()}>
        {/* Selection Overlay */}
        <SelectionOverlay 
            rect={selectionRect}
            scroll={scrollPos}
            scale={scale}
            isScrolling={isScrolling}
            isTouch={isTouch}
            onFillStart={handleFillStart}
            onFillMove={handleFillMove}
            onFillEnd={handleFillEnd}
            onResizeInit={handleResizeInit}
        />

        <DataGrid 
            ref={gridRef}
            columns={columns} 
            rows={rows} 
            rowHeight={(row) => (rowHeights[row.id] || DEFAULT_ROW_HEIGHT) * scale}
            headerRowHeight={32 * scale}
            onColumnResize={(idx, width) => {
                const col = columns[idx];
                if (col && col.name) onColumnResize(col.name, Math.round(width / scale));
            }}
            className="rdg-light fill-grid h-full"
            style={{ blockSize: '100%', border: 'none' }}
            rowKeyGetter={(r) => r.id}
            onScroll={handleScroll}
        />
    </div>
  );
};

export default Grid;
