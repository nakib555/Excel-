
import React, { useMemo, useCallback, useState, useEffect, useRef, memo } from 'react';
import { createPortal } from 'react-dom';
import { DataGrid, Column, RenderCellProps } from 'react-data-grid';
import { CellId, CellData, GridSize, CellStyle, ValidationRule } from '../types';
import { numToChar, getCellId, formatCellValue, parseCellId, cn, getRange } from '../utils';
import { NavigationDirection } from './Cell';
import { ExternalLink } from 'lucide-react';

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

// --- BORDER COMPONENT ---
// Extracted to keep renderer clean and optimize DOM updates
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
    
    // Use 0 offsets (inset) to prevent clipping by adjacent cells in the grid stacking context
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
    onMouseDown, 
    onMouseEnter,
    onFillHandleDown,
    onMobileHandleDown
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
    onMouseDown: (id: string, shift: boolean) => void,
    onMouseEnter: (id: string) => void,
    onFillHandleDown: (e: React.MouseEvent, id: string) => void,
    onMobileHandleDown: (e: React.TouchEvent, id: string, type: 'start' | 'end') => void
}) => {
  const cellId = getCellId(parseInt(column.key), row.id);
  const cellData = cells[cellId];
  const [isHovered, setIsHovered] = useState(false);
  const cellRef = useRef<HTMLDivElement>(null);
  
  const isActive = activeCell === cellId;
  
  // Selection States
  const isInSelection = selectionSet.has(cellId);
  const isInFill = isFilling && fillSet.has(cellId);

  // Map CellStyle to CSS
  const styleId = cellData?.styleId;
  const style = styleId ? styles[styleId] : {};
  const displayValue = formatCellValue(cellData?.value || '', style);

  const baseStyle: React.CSSProperties = {
      width: '100%',
      height: '100%',
      padding: '0 4px',
      display: 'flex',
      alignItems: style.verticalAlign === 'middle' ? 'center' : style.verticalAlign === 'top' ? 'flex-start' : 'flex-end',
      justifyContent: style.align === 'center' ? 'center' : style.align === 'right' ? 'flex-end' : 'flex-start',
      overflow: 'visible', 
      position: 'relative',
      cursor: 'cell',
      fontFamily: style.fontFamily || 'Calibri, "Segoe UI", sans-serif',
      fontSize: style.fontSize ? `${style.fontSize}px` : '11pt',
      fontWeight: style.bold ? '700' : '400',
      fontStyle: style.italic ? 'italic' : 'normal',
      textDecoration: style.underline ? 'underline' : 'none',
      backgroundColor: style.bg || 'transparent', 
      color: style.color || 'inherit',
      whiteSpace: style.wrapText ? 'pre-wrap' : 'nowrap',
  };

  if (style.strikethrough) {
      baseStyle.textDecoration = `${baseStyle.textDecoration} line-through`;
  }

  // Handle Borders
  if (style.borders) {
      if (style.borders.bottom) baseStyle.borderBottom = `${style.borders.bottom.style === 'thick' ? '2px' : '1px'} solid ${style.borders.bottom.color}`;
      if (style.borders.top) baseStyle.borderTop = `${style.borders.top.style === 'thick' ? '2px' : '1px'} solid ${style.borders.top.color}`;
      if (style.borders.left) baseStyle.borderLeft = `${style.borders.left.style === 'thick' ? '2px' : '1px'} solid ${style.borders.left.color}`;
      if (style.borders.right) baseStyle.borderRight = `${style.borders.right.style === 'thick' ? '2px' : '1px'} solid ${style.borders.right.color}`;
  }

  // --- Calculate Borders for Selection & Fill ---
  const r = row.id;
  const c = parseInt(column.key);

  // Main Selection (Solid Green)
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

  // Fill Selection (Dashed/Gray)
  let fTop = false, fBottom = false, fLeft = false, fRight = false;
  if (isInFill && fillBounds && isFilling) {
      // Only show fill border if it's NOT overlapping the main selection border
      // Or we can layer it.
      if (r === fillBounds.minRow) fTop = true;
      if (r === fillBounds.maxRow) fBottom = true;
      if (c === fillBounds.minCol) fLeft = true;
      if (c === fillBounds.maxCol) fRight = true;
  }

  return (
    <div 
        ref={cellRef}
        style={baseStyle}
        onMouseDown={(e) => onMouseDown(cellId, e.shiftKey)}
        onMouseEnter={() => { onMouseEnter(cellId); setIsHovered(true); }}
        onMouseLeave={() => setIsHovered(false)}
        className="relative group select-none"
        data-cell-id={cellId}
    >
      {/* Selection Overlay (Dim inactive cells in range) */}
      {(isInSelection && !isActive) && (
          <div className="absolute inset-0 bg-[#107c41] bg-opacity-10 pointer-events-none z-[5] transition-opacity duration-300" />
      )}
      
      {/* Fill Overlay (Lighter Dim) */}
      {(isInFill && !isInSelection) && (
          <div className="absolute inset-0 bg-gray-400 bg-opacity-10 pointer-events-none z-[5] animate-in fade-in duration-300" />
      )}

      <div className="relative z-0 w-full h-full flex" style={{ alignItems: baseStyle.alignItems, justifyContent: baseStyle.justifyContent }}>
          {displayValue}
      </div>
      
      {cellData?.link && <ExternalLink size={10} className="absolute top-1 right-1 text-blue-500 opacity-50" />}

      {cellData?.comment && (
          <>
            <div className="absolute top-0 right-0 w-0 h-0 border-l-[6px] border-l-transparent border-t-[6px] border-t-red-600 z-[20]" />
            {isHovered && cellRef.current && (
                <CommentTooltip text={cellData.comment} rect={cellRef.current.getBoundingClientRect()} />
            )}
          </>
      )}

      {/* --- SELECTION BORDERS (Green Solid) --- */}
      <Border type="top" visible={sTop} color="#107c41" />
      <Border type="bottom" visible={sBottom} color="#107c41" />
      <Border type="left" visible={sLeft} color="#107c41" />
      <Border type="right" visible={sRight} color="#107c41" />

      {/* --- FILL BORDERS (Gray Dashed) --- */}
      {/* Usually fill drag shows a distinct border. We use a darker gray dashed. */}
      {isFilling && (
          <>
            <Border type="top" visible={fTop && !sTop} style="dashed" color="#64748b" />
            <Border type="bottom" visible={fBottom && !sBottom} style="dashed" color="#64748b" />
            <Border type="left" visible={fLeft && !sLeft} style="dashed" color="#64748b" />
            <Border type="right" visible={fRight && !sRight} style="dashed" color="#64748b" />
          </>
      )}

      {/* Top-Left Handle (Mobile Selection) */}
      {isTopLeft && isTouch && !isFilling && (
        <div 
            className="absolute -top-[1px] -left-[1px] w-[20px] h-[20px] bg-white border-[3px] border-[#107c41] rounded-full z-[70] shadow-[0_2px_4px_rgba(0,0,0,0.2)] -translate-x-1/2 -translate-y-1/2 pointer-events-auto touch-none"
            onTouchStart={(e) => onMobileHandleDown(e, cellId, 'start')}
        />
      )}

      {/* Bottom-Right Handle (Mobile Selection) */}
      {isBottomRight && isTouch && !isFilling && (
        <div 
            className="absolute -bottom-[1px] -right-[1px] w-[20px] h-[20px] bg-white border-[3px] border-[#107c41] rounded-full z-[70] shadow-[0_2px_4px_rgba(0,0,0,0.2)] translate-x-1/2 translate-y-1/2 pointer-events-auto touch-none"
            onTouchStart={(e) => onMobileHandleDown(e, cellId, 'end')}
        />
      )}

      {/* Bottom-Right Fill Handle (Desktop) */}
      {isBottomRight && !isTouch && !isFilling && (
        <div 
            className="absolute -bottom-[3px] -right-[3px] w-[7px] h-[7px] bg-[#107c41] border border-white z-[60] pointer-events-auto cursor-crosshair shadow-sm hover:scale-125 transition-transform"
            style={{ boxSizing: 'content-box' }}
            onMouseDown={(e) => onFillHandleDown(e, cellId)}
        />
      )}
    </div>
  );
}, (prev, next) => {
    const colKey = parseInt(next.column.key);
    const rowId = next.row.id;
    const cellId = getCellId(colKey, rowId);
    
    // Deep compare relevant props to prevent unnecessary renders while allowing selection updates
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

    // Check bounds changes
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
  onCellClick,
  onCellChange,
  onColumnResize,
  onSelectionDrag,
  onExpandGrid,
  onFill
}) => {
  const [isTouch, setIsTouch] = useState(false);
  
  // Selection Drag State
  const [isSelecting, setIsSelecting] = useState(false);
  const [dragStartCell, setDragStartCell] = useState<string | null>(null);

  // Fill Handle State
  const [isFilling, setIsFilling] = useState(false);
  const [fillStartRange, setFillStartRange] = useState<string[] | null>(null);
  const [fillTargetRange, setFillTargetRange] = useState<string[] | null>(null);

  // Mobile Drag State
  const [mobileDrag, setMobileDrag] = useState<{ active: boolean, anchor: string } | null>(null);

  useEffect(() => {
      const checkTouch = () => setIsTouch(window.matchMedia('(pointer: coarse)').matches);
      checkTouch();
      window.addEventListener('resize', checkTouch);
      return () => window.removeEventListener('resize', checkTouch);
  }, []);

  // --- Derived Sets & Bounds ---

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

  // --- Handlers ---

  const handleMouseDown = useCallback((id: string, shift: boolean) => {
      if (isFilling) return;

      if (!shift) {
          setIsSelecting(true);
          setDragStartCell(id);
      }
      onCellClick(id, shift);
  }, [onCellClick, isFilling]);

  const handleMouseEnter = useCallback((id: string) => {
      // 1. Handle Fill Drag
      if (isFilling && fillStartRange) {
          const start = fillStartRange[0];
          // Create range from start of original selection to current hover
          // Fill logic usually extends in one direction (row or col) based on dominance
          const newRange = getRange(start, id); 
          setFillTargetRange(newRange);
          return;
      }

      // 2. Handle Selection Drag
      if (isSelecting && dragStartCell && onSelectionDrag) {
          onSelectionDrag(dragStartCell, id);
      }
  }, [isFilling, fillStartRange, isSelecting, dragStartCell, onSelectionDrag]);

  const handleFillHandleDown = useCallback((e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      e.preventDefault(); 
      if (selectionRange && selectionRange.length > 0) {
          setIsFilling(true);
          setFillStartRange(selectionRange);
          setFillTargetRange(selectionRange);
      }
  }, [selectionRange]);

  const handleMobileHandleDown = useCallback((e: React.TouchEvent, handleCellId: string, type: 'start' | 'end') => {
        if (!selectionBounds) return;
        let anchorRow, anchorCol;
        
        // When dragging a handle, the anchor is the OPPOSITE corner
        // If dragging Start (Top-Left), anchor is End (Bottom-Right)
        if (type === 'start') {
            anchorRow = selectionBounds.maxRow;
            anchorCol = selectionBounds.maxCol;
        } else {
            // If dragging End (Bottom-Right), anchor is Start (Top-Left)
            anchorRow = selectionBounds.minRow;
            anchorCol = selectionBounds.minCol;
        }
        
        const anchorId = getCellId(anchorCol, anchorRow);
        setMobileDrag({ active: true, anchor: anchorId });
  }, [selectionBounds]);

  useEffect(() => {
        if (!mobileDrag || !mobileDrag.active) return;

        const handleTouchMove = (e: TouchEvent) => {
            if (e.cancelable) e.preventDefault(); 
            const touch = e.touches[0];
            const el = document.elementFromPoint(touch.clientX, touch.clientY);
            const cellEl = el?.closest('[data-cell-id]');
            
            if (cellEl) {
                const targetId = cellEl.getAttribute('data-cell-id');
                if (targetId && onSelectionDrag) {
                    onSelectionDrag(mobileDrag.anchor, targetId);
                }
            }
        };

        const handleTouchEnd = () => {
            setMobileDrag(null);
        };

        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        window.addEventListener('touchend', handleTouchEnd);
        
        return () => {
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        };
  }, [mobileDrag, onSelectionDrag]);

  useEffect(() => {
      const handleMouseUp = () => {
          if (isFilling && fillStartRange && fillTargetRange && onFill) {
              onFill(fillStartRange, fillTargetRange);
          }
          setIsFilling(false);
          setFillStartRange(null);
          setFillTargetRange(null);

          setIsSelecting(false);
          setDragStartCell(null);
      };
      window.addEventListener('mouseup', handleMouseUp);
      return () => window.removeEventListener('mouseup', handleMouseUp);
  }, [isFilling, fillStartRange, fillTargetRange, onFill]);

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
         width: 46, 
         frozen: true, 
         resizable: false,
         renderCell: (props) => {
            const isRowActive = activeCoords?.row === props.row.id;
            return (
                <div className={cn(
                    "flex items-center justify-center w-full h-full font-semibold select-none text-[11px] border-r border-b border-[#bfbfbf]",
                    isRowActive 
                        ? "bg-[#e0f2f1] text-[#107c41] font-bold border-r-[3px] border-r-[#107c41]" 
                        : "bg-[#f8f9fa] text-[#444]"
                )}>
                    {props.row.id + 1}
                </div>
            );
         },
         renderHeaderCell: () => <div className="w-full h-full bg-[#f8f9fa] border-r border-b border-[#bfbfbf]" />
       }, 
       ...Array.from({ length: size.cols }, (_, i) => {
          const colChar = numToChar(i);
          return {
            key: i.toString(),
            name: colChar,
            resizable: true,
            width: columnWidths[colChar] || 100,
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
                    onMouseDown={handleMouseDown}
                    onMouseEnter={handleMouseEnter}
                    onFillHandleDown={handleFillHandleDown}
                    onMobileHandleDown={handleMobileHandleDown}
                />
            ),
            renderHeaderCell: (props) => {
                const isColActive = activeCoords?.col === i;
                return (
                    <div className={cn(
                        "flex items-center justify-center w-full h-full font-semibold text-[12px] border-r border-b border-[#bfbfbf]",
                        isColActive 
                            ? "bg-[#e0f2f1] text-[#107c41] font-bold border-b-[3px] border-b-[#107c41]" 
                            : "bg-[#f8f9fa] text-[#444]"
                    )}>
                        {props.column.name}
                    </div>
                );
            },
            editor: ({ row, column, onClose }) => {
                const id = getCellId(parseInt(column.key), row.id);
                return (
                    <div className="w-full h-full relative z-[100]">
                        <input 
                            autoFocus
                            className="w-full h-full px-1 outline-none bg-white text-slate-900 font-[Calibri] text-[11pt] border-2 border-[#107c41] shadow-lg"
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
  }, [size.cols, columnWidths, cells, styles, activeCell, selectionSet, fillSet, selectionBounds, fillBounds, isFilling, isTouch, activeCoords, handleMouseDown, handleMouseEnter, handleFillHandleDown, handleMobileHandleDown, onCellChange]);

  const rows = useMemo(() => Array.from({ length: size.rows }, (_, r) => ({ id: r })), [size.rows]);

  return (
    <div className="w-full h-full text-sm bg-white select-none">
        <DataGrid 
            columns={columns} 
            rows={rows} 
            rowHeight={(row) => rowHeights[row.id] || 24}
            onColumnResize={(idx, width) => {
                const col = columns[idx];
                if (col && col.name) onColumnResize(col.name, width);
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
