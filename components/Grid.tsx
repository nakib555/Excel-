
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
            className="fixed z-[9999] bg-[#ffffe1] border border-slate-400 shadow-[2px_2px_5px_rgba(0,0,0,0.2)] p-2 text-xs text-slate-900 pointer-events-none max-w-[200px] break-words"
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

// --- OPTIMIZED CELL RENDERER ---
const CustomCellRenderer = memo(({ 
    row, 
    column, 
    cells, 
    styles, 
    activeCell, 
    selectionSet,
    selectionBounds,
    isTouch,
    onMouseDown, 
    onMouseEnter,
    onFillHandleDown
}: RenderCellProps<any> & { 
    cells: Record<string, CellData>, 
    styles: Record<string, CellStyle>,
    activeCell: string | null,
    selectionSet: Set<string>,
    selectionBounds: { minRow: number, maxRow: number, minCol: number, maxCol: number } | null,
    isTouch: boolean,
    onMouseDown: (id: string, shift: boolean) => void,
    onMouseEnter: (id: string) => void,
    onFillHandleDown: (e: React.MouseEvent, id: string) => void
}) => {
  const cellId = getCellId(parseInt(column.key), row.id);
  const cellData = cells[cellId];
  const [isHovered, setIsHovered] = useState(false);
  const cellRef = useRef<HTMLDivElement>(null);
  
  const isActive = activeCell === cellId;
  const isInRange = selectionSet.has(cellId);

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
      backgroundColor: style.bg, // Apply background color from style directly
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

  // --- Selection Logic ---
  let showSelectionBorder = false;
  let isTop = false, isBottom = false, isLeft = false, isRight = false;
  let isTopLeft = false;
  let isBottomRight = false;

  const selectionColor = "#107c41"; 

  if (isInRange && selectionBounds) {
      showSelectionBorder = true;
      const r = row.id;
      const c = parseInt(column.key);
      
      if (r === selectionBounds.minRow) isTop = true;
      if (r === selectionBounds.maxRow) isBottom = true;
      if (c === selectionBounds.minCol) isLeft = true;
      if (c === selectionBounds.maxCol) isRight = true;

      if (isTop && isLeft) isTopLeft = true;
      if (isBottom && isRight) isBottomRight = true;
  }

  return (
    <div 
        ref={cellRef}
        style={baseStyle}
        onMouseDown={(e) => onMouseDown(cellId, e.shiftKey)}
        onMouseEnter={() => { onMouseEnter(cellId); setIsHovered(true); }}
        onMouseLeave={() => setIsHovered(false)}
        className="relative group select-none"
    >
      {/* Selection Overlay (Dim inactive cells in range) */}
      {isInRange && !isActive && (
          <div className="absolute inset-0 bg-[#107c41] bg-opacity-10 pointer-events-none z-[5]" />
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

      {showSelectionBorder && (
          <>
            {/* Using higher z-index (50) to ensure border draws over adjacent cells */}
            {isTop && <div className="absolute top-[-1px] left-[-1px] right-[-1px] h-[2px] z-50 pointer-events-none" style={{ backgroundColor: selectionColor }} />}
            {isBottom && <div className="absolute bottom-[-1px] left-[-1px] right-[-1px] h-[2px] z-50 pointer-events-none" style={{ backgroundColor: selectionColor }} />}
            {isLeft && <div className="absolute top-[-1px] bottom-[-1px] left-[-1px] w-[2px] z-50 pointer-events-none" style={{ backgroundColor: selectionColor }} />}
            {isRight && <div className="absolute top-[-1px] bottom-[-1px] right-[-1px] w-[2px] z-50 pointer-events-none" style={{ backgroundColor: selectionColor }} />}
            
            {/* Top-Left Handle (Visual Only) */}
            {isTopLeft && (
                <div 
                    className="absolute -top-[6px] -left-[6px] w-[12px] h-[12px] rounded-full bg-white border-[2px] border-[#107c41] z-[60] pointer-events-none shadow-sm"
                />
            )}

            {/* Bottom-Right Handle (Fill Handle) */}
            {isBottomRight && (
                <div 
                    className="absolute -bottom-[6px] -right-[6px] w-[12px] h-[12px] rounded-full bg-white border-[2px] border-[#107c41] z-[60] cursor-crosshair hover:scale-110 transition-transform shadow-sm"
                    onMouseDown={(e) => onFillHandleDown(e, cellId)}
                />
            )}
          </>
      )}
    </div>
  );
}, (prev, next) => {
    // Custom Comparator for Performance
    const colKey = parseInt(next.column.key);
    const rowId = next.row.id;
    const cellId = getCellId(colKey, rowId);
    
    // Check Content
    if (prev.cells[cellId] !== next.cells[cellId]) return false;
    
    // Check Styles (Registry Reference)
    if (prev.styles !== next.styles) return false;

    // Check Selection
    const wasActive = prev.activeCell === cellId;
    const isActive = next.activeCell === cellId;
    if (wasActive !== isActive) return false;
    
    const wasInSelection = prev.selectionSet.has(cellId);
    const isInSelection = next.selectionSet.has(cellId);
    if (wasInSelection !== isInSelection) return false;
    
    // Check Bounds only if involved in selection to update borders
    if ((isInSelection || wasInSelection) && prev.selectionBounds !== next.selectionBounds) return false;

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
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartCell, setDragStartCell] = useState<string | null>(null);
  const [isTouch, setIsTouch] = useState(false);
  
  // Fill Handle State
  const [isFilling, setIsFilling] = useState(false);
  const [fillStartRange, setFillStartRange] = useState<string[] | null>(null);
  const [fillTargetRange, setFillTargetRange] = useState<string[] | null>(null);

  useEffect(() => {
      const checkTouch = () => setIsTouch(window.matchMedia('(pointer: coarse)').matches);
      checkTouch();
      window.addEventListener('resize', checkTouch);
      return () => window.removeEventListener('resize', checkTouch);
  }, []);

  // Set for fast lookup
  const selectionSet = useMemo(() => {
      // During filling, we show the selection expanded to the target
      if (isFilling && fillTargetRange) {
          return new Set(fillTargetRange);
      }
      return new Set(selectionRange || []);
  }, [selectionRange, isFilling, fillTargetRange]);

  const activeCoords = useMemo(() => parseCellId(activeCell || ''), [activeCell]);

  const selectionBounds = useMemo(() => {
      const range = isFilling && fillTargetRange ? fillTargetRange : selectionRange;
      if (!range || range.length === 0) return null;
      const pFirst = parseCellId(range[0]);
      const pLast = parseCellId(range[range.length - 1]);
      if (!pFirst || !pLast) return null;
      return {
          minRow: Math.min(pFirst.row, pLast.row),
          maxRow: Math.max(pFirst.row, pLast.row),
          minCol: Math.min(pFirst.col, pLast.col),
          maxCol: Math.max(pFirst.col, pLast.col)
      };
  }, [selectionRange, isFilling, fillTargetRange]);

  // --- Handlers ---

  // Selection Drag
  const handleMouseDown = useCallback((id: string, shift: boolean) => {
      onCellClick(id, shift);
      if (!shift) {
          setIsDragging(true);
          setDragStartCell(id);
      }
  }, [onCellClick]);

  const handleMouseEnter = useCallback((id: string) => {
      if (isFilling && fillStartRange) {
          // Calculate Fill Range Preview
          const start = fillStartRange[0];
          // We use simple rectangle extension logic for visual preview
          const newRange = getRange(start, id); 
          setFillTargetRange(newRange);
      } else if (isDragging && dragStartCell && onSelectionDrag) {
          onSelectionDrag(dragStartCell, id);
      }
  }, [isDragging, dragStartCell, onSelectionDrag, isFilling, fillStartRange]);

  // Fill Handle Start
  const handleFillHandleDown = useCallback((e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      e.preventDefault();
      if (selectionRange && selectionRange.length > 0) {
          setIsFilling(true);
          setFillStartRange(selectionRange);
          setFillTargetRange(selectionRange);
      }
  }, [selectionRange]);

  // Global Mouse Up
  useEffect(() => {
      const handleMouseUp = () => {
          if (isFilling && fillStartRange && fillTargetRange && onFill) {
              // Trigger Fill
              onFill(fillStartRange, fillTargetRange);
          }
          setIsDragging(false);
          setIsFilling(false);
          setDragStartCell(null);
          setFillStartRange(null);
          setFillTargetRange(null);
      };
      window.addEventListener('mouseup', handleMouseUp);
      return () => window.removeEventListener('mouseup', handleMouseUp);
  }, [isFilling, fillStartRange, fillTargetRange, onFill]);

  // Infinite Scroll Handler
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollHeight, clientHeight, scrollLeft, scrollWidth, clientWidth } = event.currentTarget;
      
      // Threshold: 200px from edge
      if (scrollHeight - scrollTop - clientHeight < 200) {
          onExpandGrid?.('row');
      }
      if (scrollWidth - scrollLeft - clientWidth < 200) {
          onExpandGrid?.('col');
      }
  }, [onExpandGrid]);

  // --- Column Definitions ---
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
                    isRowActive ? "bg-[#d3f0e0] text-[#107c41] border-r-[#107c41]" : "bg-[#e6e6e6] text-[#444]"
                )}>
                    {props.row.id + 1}
                </div>
            );
         },
         renderHeaderCell: () => <div className="w-full h-full bg-[#e6e6e6] border-r border-b border-[#bfbfbf]" />
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
                    selectionBounds={selectionBounds}
                    isTouch={isTouch}
                    onMouseDown={handleMouseDown}
                    onMouseEnter={handleMouseEnter}
                    onFillHandleDown={handleFillHandleDown}
                />
            ),
            renderHeaderCell: (props) => {
                const isColActive = activeCoords?.col === i;
                return (
                    <div className={cn(
                        "flex items-center justify-center w-full h-full font-semibold text-[12px] border-r border-b border-[#bfbfbf]",
                        isColActive ? "bg-[#d3f0e0] text-[#107c41] border-b-2 border-b-[#107c41]" : "bg-[#e6e6e6] text-[#444]"
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
  }, [size.cols, columnWidths, cells, styles, activeCell, selectionSet, selectionBounds, isTouch, activeCoords, handleMouseDown, handleMouseEnter, handleFillHandleDown, onCellChange]);

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
