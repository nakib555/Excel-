
import React, { useMemo, useCallback, useState, useEffect, useRef, memo } from 'react';
import { createPortal } from 'react-dom';
import { DataGrid, Column, RenderCellProps, DataGridHandle } from 'react-data-grid';
import { useDrag } from '@use-gesture/react';
import { CellId, CellData, GridSize, CellStyle, ValidationRule } from '../types';
import { numToChar, getCellId, formatCellValue, parseCellId, cn, getRange } from '../utils';
import { NavigationDirection } from './Cell';
import { ExternalLink } from 'lucide-react';
import { Tooltip } from './shared';
import { DEFAULT_COL_WIDTH, DEFAULT_ROW_HEIGHT } from '../app/constants/grid.constants';

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
            className="absolute -bottom-[4px] -right-[4px] bg-[#107c41] border-[2px] border-white z-[70] pointer-events-auto cursor-crosshair shadow-sm hover:scale-125 transition-transform touch-none fill-handle rounded-sm"
            style={{ width: size, height: size, boxSizing: 'content-box' }}
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
            className="absolute z-[100] bg-white rounded-full border-[4px] border-[#107c41] shadow-[0_2px_4px_rgba(0,0,0,0.25)] pointer-events-auto touch-none cursor-move flex items-center justify-center transition-transform active:scale-110"
            style={{ 
                width: size, 
                height: size, 
                boxSizing: 'border-box',
                top: type === 'tl' ? 0 : '100%',
                left: type === 'tl' ? 0 : '100%',
                transform: 'translate(-50%, -50%)',
                marginTop: type === 'tl' ? 0 : -2,
                marginLeft: type === 'tl' ? 0 : -2
            }}
        />
    );
};

// --- SELECTION OVERLAY COMPONENT ---
const SelectionOverlay = memo(({ 
    rect, 
    scrollPos,
    isFilling, 
    isTouch, 
    scale,
    onFillStart, 
    onFillMove, 
    onFillEnd, 
    onDragStart, 
    onResizeInit 
}: any) => {
    if (!rect) return null;

    const { top, left, width, height } = rect;
    const transform = `translate3d(${left - scrollPos.left}px, ${top - scrollPos.top}px, 0)`;
    
    const fillHandleSize = Math.max(8, 8 * scale);
    const selectionHandleSize = Math.max(20, 22 * scale);

    return (
        <div 
            className="absolute top-0 left-0 pointer-events-none z-[60]"
            style={{ 
                transform,
                width, 
                height,
                willChange: 'transform, width, height',
                border: '2px solid #107c41',
                // Requested smooth transition
                transition: 'all 0.08s ease-out'
            }}
        >
            {/* Drag Border Triggers (Desktop) */}
            {!isFilling && !isTouch && (
                <>
                    <div className="absolute top-0 left-0 right-0 h-2 -mt-1 cursor-move pointer-events-auto" onMouseDown={onDragStart} />
                    <div className="absolute bottom-0 left-0 right-0 h-2 -mb-1 cursor-move pointer-events-auto" onMouseDown={onDragStart} />
                    <div className="absolute top-0 bottom-0 left-0 w-2 -ml-1 cursor-move pointer-events-auto" onMouseDown={onDragStart} />
                    <div className="absolute top-0 bottom-0 right-0 w-2 -mr-1 cursor-move pointer-events-auto" onMouseDown={onDragStart} />
                </>
            )}

            {/* Fill Handle - Desktop Only */}
            {!isTouch && !isFilling && (
                <div className="absolute -bottom-[5px] -right-[5px] pointer-events-auto">
                     <FillHandle onFillStart={onFillStart} onFillMove={onFillMove} onFillEnd={onFillEnd} size={fillHandleSize} />
                </div>
            )}

            {/* Mobile Handles */}
            {isTouch && !isFilling && (
                <>
                    <SelectionHandle type="tl" size={selectionHandleSize} onResizeInit={onResizeInit} />
                    <SelectionHandle type="br" size={selectionHandleSize} onResizeInit={onResizeInit} />
                </>
            )}
        </div>
    );
});

// --- BORDER COMPONENT (For Fill/Copy indication, not active selection) ---
const Border = memo(({ 
    type, visible, style = 'solid', color, thickness = 2 
}: { 
    type: 'top' | 'bottom' | 'left' | 'right', 
    visible: boolean, 
    style?: 'solid' | 'dashed', 
    color: string, 
    thickness?: number 
}) => {
    const baseClass = "absolute z-[50] pointer-events-none transition-opacity duration-200 ease-in-out";
    
    const styleObj: React.CSSProperties = {
        backgroundColor: style === 'solid' ? color : 'transparent',
        opacity: visible ? 1 : 0,
    };

    if (style === 'dashed') {
        styleObj.borderStyle = 'dashed';
        styleObj.borderColor = color;
        styleObj.borderWidth = 0;
    }

    let positionClass = "";
    
    if (type === 'top') {
        positionClass = "top-0 left-0 right-0";
        styleObj.height = thickness;
        if (style === 'dashed') styleObj.borderTopWidth = thickness;
    } else if (type === 'bottom') {
        positionClass = "bottom-0 left-0 right-0";
        styleObj.height = thickness;
        if (style === 'dashed') styleObj.borderBottomWidth = thickness;
    } else if (type === 'left') {
        positionClass = "left-0 top-0 bottom-0";
        styleObj.width = thickness;
        if (style === 'dashed') styleObj.borderLeftWidth = thickness;
    } else if (type === 'right') {
        positionClass = "right-0 top-0 bottom-0";
        styleObj.width = thickness;
        if (style === 'dashed') styleObj.borderRightWidth = thickness;
    }

    return <div className={cn(baseClass, positionClass)} style={styleObj} />;
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
    fillBounds,
    isFilling,
    isTouch,
    scale,
    onMouseEnter,
    onCellClick 
}: RenderCellProps<any> & { 
    cells: Record<string, CellData>, 
    styles: Record<string, CellStyle>,
    activeCell: string | null,
    selectionSet: Set<string>,
    fillSet: Set<string>,
    fillBounds: { minRow: number, maxRow: number, minCol: number, maxCol: number } | null,
    isFilling: boolean,
    isTouch: boolean,
    scale: number,
    onMouseEnter: (id: string) => void,
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

  const r = row.id;
  const c = parseInt(column.key);

  let fTop = false, fBottom = false, fLeft = false, fRight = false;
  if (isInFill && fillBounds && isFilling) {
      if (r === fillBounds.minRow) fTop = true;
      if (r === fillBounds.maxRow) fBottom = true;
      if (c === fillBounds.minCol) fLeft = true;
      if (c === fillBounds.maxCol) fRight = true;
  }

  const selectionBorderThickness = 2; 

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
      {/* Background Selection with Transition */}
      <div 
          className={cn(
              "absolute inset-0 bg-[#107c41] pointer-events-none z-[5] transition-opacity duration-200 ease-in-out",
              (isInSelection && !isActive) ? "opacity-[0.15]" : "opacity-0"
          )} 
      />
      
      {/* Fill Selection Preview */}
      <div 
          className={cn(
              "absolute inset-0 bg-gray-400 pointer-events-none z-[5] transition-opacity duration-200 ease-in-out",
              (isInFill && !isInSelection) ? "opacity-20" : "opacity-0"
          )} 
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

      {/* Only render fill preview borders, main selection is handled by overlay now */}
      {isFilling && (
          <>
            <Border type="top" visible={fTop} style="solid" color="#64748b" thickness={selectionBorderThickness} />
            <Border type="bottom" visible={fBottom} style="solid" color="#64748b" thickness={selectionBorderThickness} />
            <Border type="left" visible={fLeft} style="solid" color="#64748b" thickness={selectionBorderThickness} />
            <Border type="right" visible={fRight} style="solid" color="#64748b" thickness={selectionBorderThickness} />
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

    if ((isInFill || wasInFill) && prev.fillBounds !== next.fillBounds) return false;
    
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
  
  // Selection Overlay State
  const [selectionRect, setSelectionRect] = useState<{ top: number, left: number, width: number, height: number } | null>(null);
  const [scrollPosition, setScrollPosition] = useState({ top: 0, left: 0 });

  // Calculate Selection Geometry
  useEffect(() => {
      if (!selectionRange || selectionRange.length === 0) {
          setSelectionRect(null);
          return;
      }

      const pFirst = parseCellId(selectionRange[0]);
      const pLast = parseCellId(selectionRange[selectionRange.length - 1]);
      if (!pFirst || !pLast) return;

      const minRow = Math.min(pFirst.row, pLast.row);
      const maxRow = Math.max(pFirst.row, pLast.row);
      const minCol = Math.min(pFirst.col, pLast.col);
      const maxCol = Math.max(pFirst.col, pLast.col);

      let top = 32 * scale; // Header height offset
      let left = 46 * scale; // Row header width offset
      
      // Calculate Top
      for (let r = 0; r < minRow; r++) {
          top += (rowHeights[r] || DEFAULT_ROW_HEIGHT) * scale;
      }
      
      // Calculate Left
      for (let c = 0; c < minCol; c++) {
          const char = numToChar(c);
          left += (columnWidths[char] || DEFAULT_COL_WIDTH) * scale;
      }

      // Calculate Height
      let height = 0;
      for (let r = minRow; r <= maxRow; r++) {
          height += (rowHeights[r] || DEFAULT_ROW_HEIGHT) * scale;
      }

      // Calculate Width
      let width = 0;
      for (let c = minCol; c <= maxCol; c++) {
          const char = numToChar(c);
          width += (columnWidths[char] || DEFAULT_COL_WIDTH) * scale;
      }

      setSelectionRect({ top, left, width, height });

  }, [selectionRange, rowHeights, columnWidths, scale]);

  const bindGridGestures = useDrag((state) => {
      const { event, first, down, xy: [x, y], memo } = state;
      
      if (event.target instanceof Element && event.target.closest('.fill-handle')) return;
      if (resizingHandle) return;
      
      if (first) {
           const el = document.elementFromPoint(x, y);
           const cellEl = el?.closest('[data-cell-id]');
           if (cellEl) {
               const id = cellEl.getAttribute('data-cell-id')!;
               onCellClick(id, state.shiftKey);
               return { startId: id }; 
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
      enabled: !isTouch && !resizingHandle
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

  const handleMouseEnter = useCallback((id: string) => {
      // Used for tracking hover states if needed
  }, []);

  const handleFillStart = useCallback(() => {
      if (selectionRange && selectionRange.length > 0) {
          setIsFilling(true);
          setFillStartRange(selectionRange);
          setFillTargetRange(selectionRange);
      }
  }, [selectionRange]);

  const handleFillMove = useCallback((x: number, y: number) => {
      if (fillStartRange && selectionRange) {
          // Simplistic implementation for overlay-based fill:
          // We need to map (x,y) back to cell ID.
          // Since we use document.elementFromPoint, this still works as long as the overlay has pointer-events: none (except handles).
          // But the fill handle capture might interfere if not handled carefully.
          
          const el = document.elementFromPoint(x, y);
          const cellEl = el?.closest('[data-cell-id]');
          
          if (cellEl) {
              const id = cellEl.getAttribute('data-cell-id');
              if (!id) return;

              const hoverCoords = parseCellId(id);
              if (!hoverCoords) return;
              
              const { row: hRow, col: hCol } = hoverCoords;
              
              // Get selection bounds from range
              const pFirst = parseCellId(selectionRange[0])!;
              const pLast = parseCellId(selectionRange[selectionRange.length - 1])!;
              const minRow = Math.min(pFirst.row, pLast.row);
              const maxRow = Math.max(pFirst.row, pLast.row);
              const minCol = Math.min(pFirst.col, pLast.col);
              const maxCol = Math.max(pFirst.col, pLast.col);

              let tMinR = minRow, tMaxR = maxRow, tMinC = minCol, tMaxC = maxCol;

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
  }, [fillStartRange, selectionRange]);

  const handleFillEnd = useCallback(() => {
      if (isFilling && fillStartRange && fillTargetRange && onFill) {
          onFill(fillStartRange, fillTargetRange);
      }
      setIsFilling(false);
      setFillStartRange(null);
      setFillTargetRange(null);
  }, [isFilling, fillStartRange, fillTargetRange, onFill]);

  const handleResizeInit = useCallback((e: React.PointerEvent, handleType: 'tl' | 'br') => {
      if (!selectionRange) return;
      const pFirst = parseCellId(selectionRange[0])!;
      const pLast = parseCellId(selectionRange[selectionRange.length - 1])!;
      const minRow = Math.min(pFirst.row, pLast.row);
      const maxRow = Math.max(pFirst.row, pLast.row);
      const minCol = Math.min(pFirst.col, pLast.col);
      const maxCol = Math.max(pFirst.col, pLast.col);
      
      const anchorRow = handleType === 'tl' ? maxRow : minRow;
      const anchorCol = handleType === 'tl' ? maxCol : minCol;
      
      resizeAnchorRef.current = getCellId(anchorCol, anchorRow);
      setResizingHandle(handleType);
  }, [selectionRange]);

  useEffect(() => {
      if (!resizingHandle || !onSelectionDrag || !resizeAnchorRef.current) return;

      const handlePointerMove = (e: PointerEvent) => {
          e.preventDefault(); 
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

  const handleDragStart = useCallback((e: React.MouseEvent) => {
      e.preventDefault();
      // Logic for moving would normally start here, simplified for now
  }, []);

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollLeft, scrollHeight, clientHeight, scrollWidth, clientWidth } = event.currentTarget;
      setScrollPosition({ top: scrollTop, left: scrollLeft });
      if (scrollHeight - scrollTop - clientHeight < 200) onExpandGrid?.('row');
      if (scrollWidth - scrollLeft - clientWidth < 200) onExpandGrid?.('col');
  }, [onExpandGrid]);

  const columns = useMemo((): Column<any>[] => {
    return [
       { 
         key: 'row-header', 
         name: '', 
         width: 46 * scale, 
         frozen: true, 
         resizable: false,
         renderCell: (props) => {
            const activeCoords = activeCell ? parseCellId(activeCell) : null;
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
         renderHeaderCell: () => <div className="w-full h-full bg-[#f8f9fa]" />
       }, 
       ...Array.from({ length: size.cols }, (_, i) => {
          const colChar = numToChar(i);
          return {
            key: i.toString(),
            name: colChar,
            resizable: true,
            width: (columnWidths[colChar] || DEFAULT_COL_WIDTH) * scale,
            renderCell: (props) => (
                <CustomCellRenderer 
                    {...props} 
                    cells={cells} 
                    styles={styles} 
                    activeCell={activeCell}
                    selectionSet={selectionSet}
                    fillSet={fillSet}
                    fillBounds={fillBounds}
                    isFilling={isFilling}
                    isTouch={isTouch}
                    scale={scale}
                    onMouseEnter={handleMouseEnter}
                    onCellClick={onCellClick}
                />
            ),
            renderHeaderCell: (props) => {
                const activeCoords = activeCell ? parseCellId(activeCell) : null;
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
            },
            editor: ({ row, column, onClose }) => {
                const id = getCellId(parseInt(column.key), row.id);
                return (
                    <div className="w-full h-full relative z-[100]">
                        <input 
                            autoFocus
                            className="w-full h-full px-1 outline-none bg-white text-slate-900 font-[Calibri] border-2 border-[#107c41] shadow-lg"
                            style={{ fontSize: `${11 * scale}pt` }}
                            onBlur={(e) => { onCellChange(id, e.target.value); onClose(true); }}
                            onKeyDown={(e) => { if(e.key === 'Enter') { onCellChange(id, (e.target as HTMLInputElement).value); onClose(true); } }}
                            defaultValue={cells[id]?.raw || ''}
                        />
                    </div>
                );
            }
          };
       })
    ];
  }, [size.cols, columnWidths, cells, styles, activeCell, selectionSet, fillSet, fillBounds, isFilling, isTouch, scale, handleMouseEnter, onCellChange, onCellClick]);

  const rows = useMemo(() => Array.from({ length: size.rows }, (_, r) => ({ id: r })), [size.rows]);

  return (
    <div className="w-full h-full text-sm bg-white select-none relative" {...bindGridGestures()}>
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
        
        {/* Selection Overlay */}
        {selectionRect && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <SelectionOverlay 
                    rect={selectionRect} 
                    scrollPos={scrollPosition}
                    scale={scale}
                    isFilling={isFilling}
                    isTouch={isTouch}
                    onFillStart={handleFillStart}
                    onFillMove={handleFillMove}
                    onFillEnd={handleFillEnd}
                    onDragStart={handleDragStart}
                    onResizeInit={handleResizeInit}
                />
            </div>
        )}
    </div>
  );
};

export default Grid;
