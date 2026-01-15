
import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { DataGrid, Column, RenderCellProps } from 'react-data-grid';
import { CellId, CellData, GridSize, CellStyle, ValidationRule } from '../types';
import { numToChar, getCellId, formatCellValue } from '../utils';
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
    onMouseDown, 
    onMouseEnter 
}: RenderCellProps<any> & { 
    cells: Record<string, CellData>, 
    styles: Record<string, CellStyle>,
    activeCell: string | null,
    selectionSet: Set<string>,
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
      cursor: 'cell'
  };

  const styleId = cellData?.styleId;
  const style = styleId ? styles[styleId] : {};
  const displayValue = formatCellValue(cellData?.value || '', style);

  // Map CellStyle to CSS
  const cssStyle: React.CSSProperties = {
      ...baseStyle,
      fontWeight: style.bold ? '600' : '400',
      fontStyle: style.italic ? 'italic' : 'normal',
      textDecoration: style.underline ? 'underline' : 'none',
      backgroundColor: style.bg || (isInRange && !isActive ? 'rgba(16, 185, 129, 0.1)' : undefined),
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

  // Checkbox Rendering
  if (cellData?.isCheckbox) {
      const isChecked = String(cellData.value).toUpperCase() === 'TRUE';
      return (
          <div 
            style={{ ...cssStyle, justifyContent: 'center' }}
            onMouseDown={(e) => onMouseDown(cellId, e.shiftKey)}
            onMouseEnter={() => onMouseEnter(cellId)}
            className={isActive ? "ring-2 ring-emerald-600 z-10" : ""}
          >
              <input type="checkbox" checked={isChecked} readOnly className="w-4 h-4 accent-emerald-600 pointer-events-none" />
          </div>
      );
  }

  return (
    <div 
        style={cssStyle}
        onMouseDown={(e) => onMouseDown(cellId, e.shiftKey)}
        onMouseEnter={() => onMouseEnter(cellId)}
        className={isActive ? "ring-2 ring-emerald-600 z-10 bg-white" : ""}
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
            return (
                <div className="flex items-center justify-center w-full h-full bg-[#f8f9fa] border-r border-slate-300 font-semibold text-slate-500 select-none text-[11px]">
                    {props.row.id + 1}
                </div>
            );
         },
         renderHeaderCell: () => (
             <div className="w-full h-full bg-[#f8f9fa] border-r border-b border-slate-300" />
         )
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
                    onMouseDown={handleMouseDown}
                    onMouseEnter={handleMouseEnter}
                />
            ),
            renderHeaderCell: (props) => (
                <div className="flex items-center justify-center w-full h-full font-semibold text-slate-600 bg-[#f8f9fa] text-[12px]">
                    {props.column.name}
                </div>
            ),
            editor: ({ row, column, onRowChange, onClose }) => {
                const id = getCellId(parseInt(column.key), row.id);
                return (
                    <input 
                        autoFocus
                        className="w-full h-full px-1 outline-none bg-white text-slate-900"
                        value={row[column.key]?.raw || ''}
                        onChange={(e) => {
                            // Local state handled by DataGrid via onRowChange if we were using it for data,
                            // but here we just need to capture input for our external state.
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
                );
            }
          };
       })
    ];
    return cols;
  }, [size.cols, columnWidths, cells, styles, activeCell, selectionSet, handleMouseDown, handleMouseEnter, onCellChange]);

  // 2. Generate Rows
  const rows = useMemo(() => {
    return Array.from({ length: size.rows }, (_, r) => ({ id: r }));
  }, [size.rows]);

  return (
    <div className="w-full h-full text-sm bg-white select-none">
        <DataGrid 
            columns={columns} 
            rows={rows} 
            rowHeight={(row) => rowHeights[row.id] || 28}
            onColumnResize={(idx, width) => {
                const col = columns[idx];
                if (col && col.name) onColumnResize(col.name, width);
            }}
            className="rdg-light fill-grid h-full"
            style={{ blockSize: '100%' }}
            rowKeyGetter={(r) => r.id}
            onKeyDown={(e) => {
                // Allow our global shortcut handler to process navigation if needed, 
                // but DataGrid might consume arrows.
            }}
        />
    </div>
  );
};

export default Grid;
