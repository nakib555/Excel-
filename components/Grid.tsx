
import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { DataGrid, Column, RenderCellProps } from 'react-data-grid';
import { CellId, CellData, GridSize, CellStyle, ValidationRule } from '../types';
import { numToChar, getCellId, formatCellValue, parseCellId, cn } from '../utils';
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

const CustomCellRenderer = ({ 
    row, 
    column, 
    cells, 
    styles, 
    activeCell, 
    selectionSet,
    selectionBounds,
    onMouseDown, 
    onMouseEnter 
}: RenderCellProps<any> & { 
    cells: Record<string, CellData>, 
    styles: Record<string, CellStyle>,
    activeCell: string | null,
    selectionSet: Set<string>,
    selectionBounds: { minRow: number, maxRow: number, minCol: number, maxCol: number } | null,
    onMouseDown: (id: string, shift: boolean) => void,
    onMouseEnter: (id: string) => void
}) => {
  const cellId = getCellId(parseInt(column.key), row.id);
  const cellData = cells[cellId];
  
  const isActive = activeCell === cellId;
  const isInRange = selectionSet.has(cellId);

  // Default Style
  const baseStyle: React.CSSProperties = {
      width: '100%',
      height: '100%',
      padding: '0 4px',
      display: 'flex',
      alignItems: 'center', // Default vertical align
      overflow: 'hidden',
      position: 'relative',
      cursor: 'cell',
      fontFamily: 'Calibri, "Segoe UI", sans-serif', // Excel default font
      fontSize: '11pt', // Excel default size
  };

  const styleId = cellData?.styleId;
  const style = styleId ? styles[styleId] : {};
  const displayValue = formatCellValue(cellData?.value || '', style);

  // Map CellStyle to CSS
  const cssStyle: React.CSSProperties = {
      ...baseStyle,
      fontWeight: style.bold ? '700' : '400',
      fontStyle: style.italic ? 'italic' : 'normal',
      textDecoration: style.underline ? 'underline' : 'none',
      // Excel selection: Active cell is white (or default), Range is gray
      // We do NOT add border here for selection, we use overlays
      backgroundColor: style.bg || (isInRange && !isActive ? 'rgba(0, 0, 0, 0.05)' : undefined),
      color: style.color || 'inherit',
      textAlign: style.align || 'left',
      justifyContent: style.align === 'center' ? 'center' : style.align === 'right' ? 'flex-end' : 'flex-start',
      alignItems: style.verticalAlign === 'middle' ? 'center' : style.verticalAlign === 'top' ? 'flex-start' : 'flex-end',
      fontFamily: style.fontFamily,
      fontSize: style.fontSize ? `${style.fontSize}px` : undefined,
      whiteSpace: style.wrapText ? 'pre-wrap' : 'nowrap',
  };

  if (style.strikethrough) {
      cssStyle.textDecoration = `${cssStyle.textDecoration} line-through`;
  }

  // Handle Borders (Partial Implementation)
  if (style.borders) {
      if (style.borders.bottom) cssStyle.borderBottom = `${style.borders.bottom.style === 'thick' ? '2px' : '1px'} solid ${style.borders.bottom.color}`;
      if (style.borders.top) cssStyle.borderTop = `${style.borders.top.style === 'thick' ? '2px' : '1px'} solid ${style.borders.top.color}`;
      if (style.borders.left) cssStyle.borderLeft = `${style.borders.left.style === 'thick' ? '2px' : '1px'} solid ${style.borders.left.color}`;
      if (style.borders.right) cssStyle.borderRight = `${style.borders.right.style === 'thick' ? '2px' : '1px'} solid ${style.borders.right.color}`;
  }

  // --- Selection Logic ---
  let showSelectionBorder = false;
  let isTop = false, isBottom = false, isLeft = false, isRight = false;
  let isHandle = false;

  if (isInRange && selectionBounds) {
      showSelectionBorder = true;
      const r = row.id;
      const c = parseInt(column.key);
      
      if (r === selectionBounds.minRow) isTop = true;
      if (r === selectionBounds.maxRow) isBottom = true;
      if (c === selectionBounds.minCol) isLeft = true;
      if (c === selectionBounds.maxCol) isRight = true;

      // Handle appears on the bottom-right corner of the selection
      if (isBottom && isRight) isHandle = true;
  }

  // Checkbox Rendering
  if (cellData?.isCheckbox) {
      const isChecked = String(cellData.value).toUpperCase() === 'TRUE';
      return (
          <div 
            style={{ ...cssStyle, justifyContent: 'center' }}
            onMouseDown={(e) => onMouseDown(cellId, e.shiftKey)}
            onMouseEnter={() => onMouseEnter(cellId)}
            className="relative"
          >
              <input type="checkbox" checked={isChecked} readOnly className="w-4 h-4 accent-[#217346] pointer-events-none" />
              {showSelectionBorder && (
                  <>
                    {isTop && <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#217346] z-20 pointer-events-none" />}
                    {isBottom && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#217346] z-20 pointer-events-none" />}
                    {isLeft && <div className="absolute top-0 bottom-0 left-0 w-[2px] bg-[#217346] z-20 pointer-events-none" />}
                    {isRight && <div className="absolute top-0 bottom-0 right-0 w-[2px] bg-[#217346] z-20 pointer-events-none" />}
                    {isHandle && (
                        <div className="absolute -bottom-[3px] -right-[3px] w-[7px] h-[7px] bg-[#217346] border border-white z-30 cursor-crosshair box-content" />
                    )}
                  </>
              )}
          </div>
      );
  }

  return (
    <div 
        style={cssStyle}
        onMouseDown={(e) => onMouseDown(cellId, e.shiftKey)}
        onMouseEnter={() => onMouseEnter(cellId)}
        // Remove ring-2, rely on overlays
        className="relative"
    >
      {displayValue}
      
      {/* Hyperlink Icon */}
      {cellData?.link && (
          <ExternalLink size={10} className="ml-1 text-blue-500 opacity-50" />
      )}

      {/* Comment Indicator (Red Triangle) */}
      {cellData?.comment && (
          <div 
            className="absolute top-0 right-0 w-0 h-0 border-l-[6px] border-l-transparent border-t-[6px] border-t-red-600" 
            title={cellData.comment}
          />
      )}

      {/* Selection Box Overlays */}
      {showSelectionBorder && (
          <>
            {isTop && <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#217346] z-20 pointer-events-none shadow-sm" />}
            {isBottom && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#217346] z-20 pointer-events-none shadow-sm" />}
            {isLeft && <div className="absolute top-0 bottom-0 left-0 w-[2px] bg-[#217346] z-20 pointer-events-none shadow-sm" />}
            {isRight && <div className="absolute top-0 bottom-0 right-0 w-[2px] bg-[#217346] z-20 pointer-events-none shadow-sm" />}
            
            {/* Handle - positioned slightly outside to overlap grid lines */}
            {isHandle && (
                <div 
                    className="absolute -bottom-[3px] -right-[3px] w-[7px] h-[7px] bg-[#217346] border border-white z-30 cursor-crosshair box-content shadow-sm"
                    onMouseDown={(e) => { e.stopPropagation(); /* Drag handle logic here */ }}
                />
            )}
          </>
      )}
    </div>
  );
};

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
  onSelectionDrag
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartCell, setDragStartCell] = useState<string | null>(null);

  // Convert selection range to Set for O(1) lookup
  const selectionSet = useMemo(() => new Set(selectionRange || []), [selectionRange]);
  const activeCoords = useMemo(() => parseCellId(activeCell || ''), [activeCell]);

  // Calculate Selection Bounds for border rendering
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

  // Handle Drag Selection
  const handleMouseDown = useCallback((id: string, shift: boolean) => {
      onCellClick(id, shift);
      if (!shift) {
          setIsDragging(true);
          setDragStartCell(id);
      }
  }, [onCellClick]);

  const handleMouseEnter = useCallback((id: string) => {
      if (isDragging && dragStartCell && onSelectionDrag) {
          onSelectionDrag(dragStartCell, id);
      }
  }, [isDragging, dragStartCell, onSelectionDrag]);

  // Global mouse up to stop dragging
  useEffect(() => {
      const handleMouseUp = () => {
          setIsDragging(false);
          setDragStartCell(null);
      };
      window.addEventListener('mouseup', handleMouseUp);
      return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  // 1. Generate Columns
  const columns = useMemo((): Column<any>[] => {
    const cols: Column<any>[] = [
       // Row Header Column
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
                    isRowActive ? "bg-[#d3f0e0] text-[#107c41]" : "bg-[#e6e6e6] text-[#444]"
                )}>
                    {props.row.id + 1}
                </div>
            );
         },
         renderHeaderCell: () => (
             <div className="w-full h-full bg-[#e6e6e6] border-r border-b border-[#bfbfbf]" />
         )
       }, 
       ...Array.from({ length: size.cols }, (_, i) => {
          const colChar = numToChar(i);
          return {
            key: i.toString(),
            name: colChar,
            resizable: true,
            width: columnWidths[colChar] || 100, // Default width 100px (~80px in Excel)
            renderCell: (props) => (
                <CustomCellRenderer 
                    {...props} 
                    cells={cells} 
                    styles={styles} 
                    activeCell={activeCell}
                    selectionSet={selectionSet}
                    selectionBounds={selectionBounds}
                    onMouseDown={handleMouseDown}
                    onMouseEnter={handleMouseEnter}
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
            editor: ({ row, column, onRowChange, onClose }) => {
                const id = getCellId(parseInt(column.key), row.id);
                return (
                    <div className="w-full h-full relative z-[100]">
                        <input 
                            autoFocus
                            className="w-full h-full px-1 outline-none bg-white text-slate-900 font-[Calibri] text-[11pt] border-2 border-[#217346] shadow-lg"
                            value={row[column.key]?.raw || ''}
                            onChange={(e) => {
                                // Local state handled by DataGrid via onRowChange if we were using it for data
                            }}
                            onBlur={(e) => {
                                onCellChange(id, e.target.value);
                                onClose(true);
                            }}
                            onKeyDown={(e) => {
                                if(e.key === 'Enter') {
                                    onCellChange(id, (e.target as HTMLInputElement).value);
                                    onClose(true);
                                }
                            }}
                            defaultValue={cells[id]?.raw || ''}
                        />
                    </div>
                );
            }
          };
       })
    ];
    return cols;
  }, [size.cols, columnWidths, cells, styles, activeCell, selectionSet, selectionBounds, handleMouseDown, handleMouseEnter, onCellChange, activeCoords]);

  // 2. Generate Rows
  const rows = useMemo(() => {
    return Array.from({ length: size.rows }, (_, r) => ({ id: r }));
  }, [size.rows]);

  return (
    <div className="w-full h-full text-sm bg-white select-none">
        <DataGrid 
            columns={columns} 
            rows={rows} 
            rowHeight={(row) => rowHeights[row.id] || 24} // Excel default row height ~20px/15pt, usually 24px in web
            onColumnResize={(idx, width) => {
                const col = columns[idx];
                if (col && col.name) onColumnResize(col.name, width);
            }}
            className="rdg-light fill-grid h-full"
            style={{ blockSize: '100%' }}
            rowKeyGetter={(r) => r.id}
        />
    </div>
  );
};

export default Grid;
