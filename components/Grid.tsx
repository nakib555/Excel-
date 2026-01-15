
import React, { useMemo, useCallback, useState, useEffect, useRef, memo } from 'react';
import { createPortal } from 'react-dom';
import { DataGrid, type Column, type RenderCellProps, type DataGridHandle } from 'react-data-grid';
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

// --- EXCEL CELL RENDERER ---
const CustomCellRenderer = memo(({ 
    row, 
    column, 
    cells, 
    styles, 
    activeCell,
    scale,
    onMouseDown, 
    onMouseEnter,
}: RenderCellProps<any> & { 
    cells: Record<string, CellData>, 
    styles: Record<string, CellStyle>,
    activeCell: string | null,
    scale: number,
    onMouseDown: (id: string, shift: boolean) => void,
    onMouseEnter: (id: string) => void,
}) => {
  const cellId = getCellId(parseInt(column.key), row.id);
  const cellData = cells[cellId];
  const [isHovered, setIsHovered] = useState(false);
  const cellRef = useRef<HTMLDivElement>(null);
  
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

  // Adjust border thickness based on scale (optional, but looks better)
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
        onMouseDown={(e) => onMouseDown(cellId, e.shiftKey)}
        onMouseEnter={() => { onMouseEnter(cellId); setIsHovered(true); }}
        onMouseLeave={() => setIsHovered(false)}
        className="relative group select-none"
        data-cell-id={cellId}
    >
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
    
    // Only re-render if data/style changes. Selection is now handled by overlay.
    if (prev.scale !== next.scale) return false;
    if (prev.cells[cellId] !== next.cells[cellId]) return false;
    if (prev.styles !== next.styles) return false;

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
  const gridRef = useRef<DataGridHandle>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  
  const [isSelecting, setIsSelecting] = useState(false);
  const [dragStartCell, setDragStartCell] = useState<string | null>(null);

  const [isFilling, setIsFilling] = useState(false);
  const [fillStartRange, setFillStartRange] = useState<string[] | null>(null);
  const [fillTargetRange, setFillTargetRange] = useState<string[] | null>(null);

  // Scroll Sync State
  const [scrollTop, setScrollTop] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Memoized Geometry Calculator
  const getRect = useCallback((startId: string, endId: string) => {
      const p1 = parseCellId(startId);
      const p2 = parseCellId(endId);
      if (!p1 || !p2) return { top: 0, left: 0, width: 0, height: 0 };

      const minR = Math.min(p1.row, p2.row);
      const maxR = Math.max(p1.row, p2.row);
      const minC = Math.min(p1.col, p2.col);
      const maxC = Math.max(p1.col, p2.col);

      // --- Vertical Calc ---
      let top = 0;
      // Fast path for default height
      const defaultH = 24 * scale;
      top = minR * defaultH;
      // Adjust for specific row heights before minR
      const resizedRows = Object.keys(rowHeights).map(Number).filter(r => r < minR);
      resizedRows.forEach(r => {
          top += (rowHeights[r] * scale) - defaultH;
      });

      let height = 0;
      // Fast path for default height range
      height = (maxR - minR + 1) * defaultH;
      // Adjust for specific heights in range
      const rangeResized = Object.keys(rowHeights).map(Number).filter(r => r >= minR && r <= maxR);
      rangeResized.forEach(r => {
          height += (rowHeights[r] * scale) - defaultH;
      });

      // --- Horizontal Calc ---
      let left = 0;
      const defaultW = 100 * scale;
      left = minC * defaultW;
      // Adjust for specific widths before minC
      const resizedCols = Object.keys(columnWidths).map(k => parseCellId(k + "1")!.col).filter(c => c < minC);
      resizedCols.forEach(c => {
          const char = numToChar(c);
          left += (columnWidths[char] * scale) - defaultW;
      });

      let width = 0;
      width = (maxC - minC + 1) * defaultW;
      const rangeResizedCols = Object.keys(columnWidths).map(k => parseCellId(k + "1")!.col).filter(c => c >= minC && c <= maxC);
      rangeResizedCols.forEach(c => {
          const char = numToChar(c);
          width += (columnWidths[char] * scale) - defaultW;
      });

      // Account for Row Headers width (46px * scale)
      const headerOffset = 46 * scale;
      left += headerOffset;

      // Account for Column Header height (32px * scale)
      const topOffset = 32 * scale;
      top += topOffset;

      return { top, left, width, height };
  }, [rowHeights, columnWidths, scale]);

  const activeRect = useMemo(() => {
      if (!activeCell) return { top: 0, left: 0, width: 0, height: 0 };
      return getRect(activeCell, activeCell);
  }, [activeCell, getRect]);

  const selectionRect = useMemo(() => {
      if (!selectionRange || selectionRange.length === 0) return { top: 0, left: 0, width: 0, height: 0 };
      return getRect(selectionRange[0], selectionRange[selectionRange.length - 1]);
  }, [selectionRange, getRect]);

  const fillRect = useMemo(() => {
      if (!fillTargetRange || fillTargetRange.length === 0) return null;
      return getRect(fillTargetRange[0], fillTargetRange[fillTargetRange.length - 1]);
  }, [fillTargetRange, getRect]);

  // Programmatic Scroll Effect for Search/GoTo
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

  useEffect(() => {
      if (isFilling) {
          document.body.style.cursor = 'crosshair';
      } else {
          document.body.style.cursor = '';
      }
  }, [isFilling]);

  const handleMouseDown = useCallback((id: string, shift: boolean) => {
      if (isFilling) return;

      if (!shift) {
          setIsSelecting(true);
          setDragStartCell(id);
      }
      onCellClick(id, shift);
  }, [onCellClick, isFilling]);

  const handleMouseEnter = useCallback((id: string) => {
      if (isFilling && fillStartRange && selectionRange) {
          // Fill Drag Logic
          const hoverCoords = parseCellId(id);
          const startBounds = getRect(fillStartRange[0], fillStartRange[fillStartRange.length - 1]);
          // ... simplified fill target calculation logic would go here
          // For smoothness demo, we skip complex bounds recalc and just extend range
          const startId = fillStartRange[0];
          const newRange = getRange(startId, id); // Basic implementation
          setFillTargetRange(newRange);
          return;
      }

      if (isSelecting && dragStartCell && onSelectionDrag) {
          onSelectionDrag(dragStartCell, id);
      }
  }, [isFilling, fillStartRange, isSelecting, dragStartCell, onSelectionDrag, selectionRange, getRect]);

  const handleFillHandleDown = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault(); 
      if (selectionRange && selectionRange.length > 0) {
          setIsFilling(true);
          setFillStartRange(selectionRange);
          setFillTargetRange(selectionRange);
      }
  }, [selectionRange]);

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
      const { scrollTop, scrollLeft, scrollHeight, clientHeight, scrollWidth, clientWidth } = event.currentTarget;
      setScrollTop(scrollTop);
      setScrollLeft(scrollLeft);
      
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
            const isRowInSelection = selectionRange && selectionRange.some(id => parseCellId(id)?.row === props.row.id);
            return (
                <Tooltip content={`Row ${props.row.id + 1}`}>
                    <div className={cn(
                        "flex items-center justify-center w-full h-full font-semibold select-none",
                        isRowInSelection 
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
                    scale={scale}
                    onMouseDown={handleMouseDown}
                    onMouseEnter={handleMouseEnter}
                />
            ),
            renderHeaderCell: (props) => {
                const isColInSelection = selectionRange && selectionRange.some(id => parseCellId(id)?.col === i);
                return (
                    <Tooltip content={`Column ${props.column.name}`}>
                        <div className={cn(
                            "flex items-center justify-center w-full h-full font-semibold",
                            isColInSelection 
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
  }, [size.cols, columnWidths, cells, styles, activeCell, selectionRange, scale, handleMouseDown, handleMouseEnter, onCellChange]);

  const rows = useMemo(() => Array.from({ length: size.rows }, (_, r) => ({ id: r })), [size.rows]);

  return (
    <div className="w-full h-full text-sm bg-white select-none relative overflow-hidden">
        {/* Selection Overlay Layer - Moves with Scroll */}
        <div 
            ref={overlayRef}
            className="absolute top-0 left-0 pointer-events-none z-[60]"
            style={{ 
                transform: `translate3d(${-scrollLeft}px, ${-scrollTop}px, 0)`,
                willChange: 'transform'
            }}
        >
            {/* Range Background */}
            <div 
                className="selection-area"
                style={{
                    top: selectionRect.top,
                    left: selectionRect.left,
                    width: selectionRect.width,
                    height: selectionRect.height,
                    // Clip out active cell to keep it white
                    clipPath: `polygon(
                        0% 0%, 
                        0% 100%, 
                        100% 100%, 
                        100% 0%, 
                        0% 0%,
                        ${(activeRect.left - selectionRect.left)}px ${(activeRect.top - selectionRect.top)}px,
                        ${(activeRect.left - selectionRect.left + activeRect.width)}px ${(activeRect.top - selectionRect.top)}px,
                        ${(activeRect.left - selectionRect.left + activeRect.width)}px ${(activeRect.top - selectionRect.top + activeRect.height)}px,
                        ${(activeRect.left - selectionRect.left)}px ${(activeRect.top - selectionRect.top + activeRect.height)}px,
                        ${(activeRect.left - selectionRect.left)}px ${(activeRect.top - selectionRect.top)}px
                    )`
                }} 
            />

            {/* Selection Border & Fill Handle */}
            <div 
                className="selection-border"
                style={{
                    top: selectionRect.top,
                    left: selectionRect.left,
                    width: selectionRect.width,
                    height: selectionRect.height
                }}
            >
                {/* Only show fill handle if not filling currently */}
                {!isFilling && (
                    <div 
                        className="fill-handle" 
                        onMouseDown={handleFillHandleDown}
                    />
                )}
            </div>

            {/* Dragging/Filling Ghost Area */}
            {isFilling && fillRect && (
                <div 
                    className="absolute border border-dashed border-gray-500 z-[18] bg-gray-400/20 transition-all duration-75 ease-linear"
                    style={{
                        top: fillRect.top,
                        left: fillRect.left,
                        width: fillRect.width,
                        height: fillRect.height
                    }}
                />
            )}

            {/* Active Cell Highlight */}
            <div 
                className="active-cell-indicator"
                style={{
                    top: activeRect.top,
                    left: activeRect.left,
                    width: activeRect.width,
                    height: activeRect.height
                }}
            />
        </div>

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

export default memo(Grid);
