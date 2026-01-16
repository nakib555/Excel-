
import React, { useMemo, useCallback, useState, useEffect, useRef, memo } from 'react';
import { createPortal } from 'react-dom';
import { DataGrid, Column, RenderCellProps, DataGridHandle } from 'react-data-grid';
import { useDrag } from '@use-gesture/react';
import { CellId, CellData, GridSize, CellStyle, ValidationRule } from '../types';
import { numToChar, getCellId, formatCellValue, parseCellId, cn, getRange } from '../utils';
import { NavigationDirection } from './Cell';
import { ExternalLink } from 'lucide-react';
import { Tooltip } from './shared';

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
// Separate component to isolate useDrag gesture
const FillHandle = ({ onFillStart, onFillMove, onFillEnd, size }: { onFillStart: () => void, onFillMove: (x: number, y: number) => void, onFillEnd: () => void, size: number }) => {
    const bind = useDrag(({ down, xy: [x, y], first, last, event }) => {
        // Stop event from bubbling to grid selection gesture
        if (event) event.stopPropagation(); 
        
        if (first) onFillStart();
        if (down) onFillMove(x, y);
        if (last) onFillEnd();
    }, { pointer: { keys: false } }); // Ensure we capture pointers

    return (
        <div 
            {...bind()} 
            className="absolute -bottom-[3px] -right-[3px] bg-[#107c41] border border-white z-[70] pointer-events-auto cursor-crosshair shadow-sm hover:scale-125 transition-transform touch-none"
            style={{ width: size, height: size, boxSizing: 'content-box' }}
        />
    );
};

// --- BORDER COMPONENT ---
const Border = memo(({ 
    type, visible, style = 'solid', color, thickness = 2 
}: { 
    type: 'top' | 'bottom' | 'left' | 'right', 
    visible: boolean, 
    style?: 'solid' | 'dashed', 
    color: string, 
    thickness?: number 
}) => {
    const baseClass = "absolute z-[50] pointer-events-none transition-opacity duration-150 ease-in-out";
    
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
    selectionBounds,
    fillBounds,
    isFilling,
    isTouch,
    scale,
    onMouseDown, 
    onMouseEnter,
    onFillStart,
    onFillMove,
    onFillEnd,
    onDragStart
}: RenderCellProps<any> & { 
    cells: Record<string, CellData>, 
    styles: Record<string, CellStyle>,
    activeCell: string | null,
    selectionSet: Set<string>,
    fillSet: Set<string>,
    selectionBounds: { minRow: number, maxRow: number, minCol: number, maxCol: number } | null,
    fillBounds: { minRow: number, maxRow: number, minCol: number, maxCol: number } | null,
    isFilling: boolean,
    isTouch: boolean,
    scale: number,
    onMouseDown: (id: string, shift: boolean) => void,
    onMouseEnter: (id: string) => void,
    onFillStart: () => void,
    onFillMove: (x: number, y: number) => void,
    onFillEnd: () => void,
    onDragStart: (e: React.MouseEvent, id: string) => void
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

  let sTop = false, sBottom = false, sLeft = false, sRight = false;
  let isBottomRight = false;
  let isTopLeft = false;

  if (isInSelection && selectionBounds) {
      if (r === selectionBounds.minRow) sTop = true;
      if (r === selectionBounds.maxRow) sBottom = true;
      if (c === selectionBounds.minCol) sLeft = true;
      if (c === selectionBounds.maxCol) sRight = true;
      
      if (sBottom && sRight) isBottomRight = true;
      if (sTop && sLeft) isTopLeft = true;
  }

  let fTop = false, fBottom = false, fLeft = false, fRight = false;
  if (isInFill && fillBounds && isFilling) {
      if (r === fillBounds.minRow) fTop = true;
      if (r === fillBounds.maxRow) fBottom = true;
      if (c === fillBounds.minCol) fLeft = true;
      if (c === fillBounds.maxCol) fRight = true;
  }

  useEffect(() => {
      const cell = cellRef.current?.closest('.rdg-cell') as HTMLElement;
      const row = cell?.closest('.rdg-row') as HTMLElement;

      if (cell && row) {
          const hasHandle = (isTopLeft || isBottomRight) && isTouch && !isFilling;
          if (hasHandle) {
              cell.style.zIndex = '100';
              row.style.zIndex = '100';
          } else {
              cell.style.zIndex = ''; 
              row.style.zIndex = '';
          }
      }
  }, [isTopLeft, isBottomRight, isTouch, isFilling]);

  const handleSize = Math.max(16, 20 * scale);
  const dragHandleSize = Math.max(6, 7 * scale);
  const selectionBorderThickness = Math.max(2, 2 * scale);

  return (
    <div 
        ref={cellRef}
        style={baseStyle}
        // Native mouse down logic retained for core clicking, useGesture is on grid container
        onMouseDown={(e) => onMouseDown(cellId, e.shiftKey)}
        onMouseEnter={() => { onMouseEnter(cellId); setIsHovered(true); }}
        onMouseLeave={() => setIsHovered(false)}
        className="relative group select-none"
        data-cell-id={cellId}
    >
      {(isInSelection && !isActive) && (
          <div className="absolute inset-0 bg-[#107c41] bg-opacity-10 pointer-events-none z-[5] transition-opacity duration-300" />
      )}
      
      {(isInFill && !isInSelection) && (
          <div className="absolute inset-0 bg-gray-400 bg-opacity-10 pointer-events-none z-[5] animate-in fade-in duration-300" />
      )}

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

      <Border type="top" visible={sTop} color="#107c41" thickness={selectionBorderThickness} />
      <Border type="bottom" visible={sBottom} color="#107c41" thickness={selectionBorderThickness} />
      <Border type="left" visible={sLeft} color="#107c41" thickness={selectionBorderThickness} />
      <Border type="right" visible={sRight} color="#107c41" thickness={selectionBorderThickness} />

      {/* Drag Move Triggers */}
      {!isFilling && isInSelection && (
          <>
            {sTop && <div className="absolute top-0 left-0 right-0 h-2 -mt-1 cursor-grab z-[60]" onMouseDown={(e) => onDragStart(e, cellId)} />}
            {sBottom && <div className="absolute bottom-0 left-0 right-0 h-2 -mb-1 cursor-grab z-[60]" onMouseDown={(e) => onDragStart(e, cellId)} />}
            {sLeft && <div className="absolute top-0 bottom-0 left-0 w-2 -ml-1 cursor-grab z-[60]" onMouseDown={(e) => onDragStart(e, cellId)} />}
            {sRight && <div className="absolute top-0 bottom-0 right-0 w-2 -mr-1 cursor-grab z-[60]" onMouseDown={(e) => onDragStart(e, cellId)} />}
          </>
      )}

      {isFilling && (
          <>
            <Border type="top" visible={fTop && !sTop} style="solid" color="#64748b" thickness={selectionBorderThickness} />
            <Border type="bottom" visible={fBottom && !sBottom} style="solid" color="#64748b" thickness={selectionBorderThickness} />
            <Border type="left" visible={fLeft && !sLeft} style="solid" color="#64748b" thickness={selectionBorderThickness} />
            <Border type="right" visible={fRight && !sRight} style="solid" color="#64748b" thickness={selectionBorderThickness} />
          </>
      )}

      {/* Fill Handle - Only show on bottom right of selection, not on touch unless specialized, not while filling */}
      {isBottomRight && !isTouch && !isFilling && (
        <FillHandle 
            onFillStart={onFillStart}
            onFillMove={onFillMove}
            onFillEnd={onFillEnd}
            size={dragHandleSize}
        />
      )}
    </div>
  );
}, (prev, next) => {
    // Memo check (Simplified for brevity, same logic as before)
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

    if ((isInSelection || wasInSelection) && prev.selectionBounds !== next.selectionBounds) return false;
    if ((isInFill || wasInFill) && prev.fillBounds !== next.fillBounds) return false;
    
    if (prev.isFilling !== next.isFilling) return false;

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
  
  const [isSelecting, setIsSelecting] = useState(false);
  const [dragStartCell, setDragStartCell] = useState<string | null>(null);

  const [isFilling, setIsFilling] = useState(false);
  const [fillStartRange, setFillStartRange] = useState<string[] | null>(null);
  const [fillTargetRange, setFillTargetRange] = useState<string[] | null>(null);

  // React Use Gesture for Grid Selection
  // Binding to document/window level or grid container to handle dragging outside cells smoothly
  const bindGridGestures = useDrag(({ down, movement: [mx, my], target, xy: [x, y], cancel }) => {
      // Find the cell element under the cursor
      // Note: react-data-grid uses canvas or virtualization, so we look for data attributes
      if (!down) return;
      
      const el = document.elementFromPoint(x, y);
      const cellEl = el?.closest('[data-cell-id]');
      
      if (cellEl) {
          const id = cellEl.getAttribute('data-cell-id');
          if (id && dragStartCell && onSelectionDrag) {
              onSelectionDrag(dragStartCell, id);
          }
      }
  }, {
      // Only enable if we are already selecting via mouse down on a cell
      enabled: isSelecting && !!dragStartCell
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

  const handleMouseDown = useCallback((id: string, shift: boolean) => {
      if (isFilling) return;
      if (!shift) {
          setIsSelecting(true);
          setDragStartCell(id);
      }
      onCellClick(id, shift);
  }, [onCellClick, isFilling]);

  const handleMouseEnter = useCallback((id: string) => {
      // Fallback for hover if gesture misses (or for fill handle logic which uses native mouse events still)
      // Note: Now used mainly for update triggers if gesture logic delegates to it
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

              // Constrain fill to one direction (standard Excel behavior, roughly)
              // Or allow 2D fill. Let's allow simple extension.
              
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

  // Mobile/Touch Handlers stubbed or kept as is
  const handleMobileHandleDown = useCallback(() => {}, []);
  const handleDragStart = useCallback(() => {}, []); // Stub for now as gesture handles main selection

  useEffect(() => {
      const handleMouseUp = () => {
          setIsSelecting(false);
          setDragStartCell(null);
      };
      window.addEventListener('mouseup', handleMouseUp);
      return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollHeight, clientHeight, scrollLeft, scrollWidth, clientWidth } = event.currentTarget;
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
            width: (columnWidths[colChar] || 100) * scale,
            renderCell: (props) => (
                <CustomCellRenderer 
                    {...props} 
                    cells={cells} 
                    styles={styles} 
                    activeCell={activeCell}
                    selectionSet={selectionSet}
                    fillSet={fillSet}
                    selectionBounds={selectionBounds}
                    fillBounds={fillBounds}
                    isFilling={isFilling}
                    isTouch={isTouch}
                    scale={scale}
                    onMouseDown={handleMouseDown}
                    onMouseEnter={handleMouseEnter}
                    onFillStart={handleFillStart}
                    onFillMove={handleFillMove}
                    onFillEnd={handleFillEnd}
                    onMobileHandleDown={handleMobileHandleDown}
                    onDragStart={handleDragStart}
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
  }, [size.cols, columnWidths, cells, styles, activeCell, selectionSet, fillSet, selectionBounds, fillBounds, isFilling, isTouch, scale, activeCoords, handleMouseDown, handleMouseEnter, handleFillStart, handleFillMove, handleFillEnd, handleMobileHandleDown, handleDragStart, onCellChange]);

  const rows = useMemo(() => Array.from({ length: size.rows }, (_, r) => ({ id: r })), [size.rows]);

  return (
    // Apply react-use-gesture bind here
    <div className="w-full h-full text-sm bg-white select-none relative" {...bindGridGestures()}>
        <DataGrid 
            ref={gridRef}
            columns={columns} 
            rows={rows} 
            rowHeight={(row) => (rowHeights[row.id] || 24) * scale}
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
