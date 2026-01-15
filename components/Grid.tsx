
import React, { useMemo, useCallback } from 'react';
import DataGrid, { Column, RenderCellProps, SelectColumn } from 'react-data-grid';
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

const CustomCellRenderer = ({ row, column, cells, styles }: RenderCellProps<any> & { cells: Record<string, CellData>, styles: Record<string, CellStyle> }) => {
  const cellId = getCellId(parseInt(column.key), row.id);
  const cellData = cells[cellId];
  
  // Default Style
  const baseStyle: React.CSSProperties = {
      width: '100%',
      height: '100%',
      padding: '0 4px',
      display: 'flex',
      alignItems: 'center', // Default vertical align
      overflow: 'hidden',
      position: 'relative'
  };

  if (!cellData) {
      return <div style={baseStyle} />;
  }

  const styleId = cellData.styleId;
  const style = styleId ? styles[styleId] : {};
  const displayValue = formatCellValue(cellData.value, style);

  // Map CellStyle to CSS
  const cssStyle: React.CSSProperties = {
      ...baseStyle,
      fontWeight: style.bold ? 'bold' : 'normal',
      fontStyle: style.italic ? 'italic' : 'normal',
      textDecoration: style.underline ? 'underline' : 'none',
      backgroundColor: style.bg || undefined,
      color: style.color || 'inherit',
      textAlign: style.align || 'left',
      alignItems: style.verticalAlign === 'middle' ? 'center' : style.verticalAlign === 'top' ? 'flex-start' : 'flex-end',
      fontFamily: style.fontFamily,
      fontSize: style.fontSize ? `${style.fontSize}px` : undefined,
      whiteSpace: style.wrapText ? 'pre-wrap' : 'nowrap',
  };

  if (style.strikethrough) {
      cssStyle.textDecoration = `${cssStyle.textDecoration} line-through`;
  }

  // Checkbox Rendering
  if (cellData.isCheckbox) {
      const isChecked = String(cellData.value).toUpperCase() === 'TRUE';
      return (
          <div style={{ ...cssStyle, justifyContent: 'center' }}>
              <input type="checkbox" checked={isChecked} readOnly className="w-4 h-4 accent-emerald-600 pointer-events-none" />
          </div>
      );
  }

  return (
    <div style={cssStyle}>
      {displayValue}
      
      {/* Hyperlink Icon */}
      {cellData.link && (
          <ExternalLink size={10} className="ml-1 text-blue-500 opacity-50" />
      )}

      {/* Comment Indicator (Red Triangle) */}
      {cellData.comment && (
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
  onColumnResize
}) => {

  // 1. Generate Columns
  const columns = useMemo((): Column<any>[] => {
    // Add Row Header Column
    const cols: Column<any>[] = [
       SelectColumn, 
       ...Array.from({ length: size.cols }, (_, i) => {
          const colChar = numToChar(i);
          return {
            key: i.toString(),
            name: colChar,
            resizable: true,
            width: columnWidths[colChar] || 100,
            renderCell: (props) => <CustomCellRenderer {...props} cells={cells} styles={styles} />,
            renderHeaderCell: (props) => (
                <div className="flex items-center justify-center w-full h-full font-semibold text-slate-500">
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
                            // Optimistic local update not strictly needed as onRowChange drives state in controlled mode, 
                            // but here we are bridging controlled grid with external state.
                            // We mainly want to capture the final value.
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
  }, [size.cols, columnWidths, cells, styles, onCellChange]);

  // 2. Generate Rows
  // Since our data is sparse (Record<string, cell>), we create lightweight row objects 
  // that serve as coordinate holders for the renderer.
  const rows = useMemo(() => {
    return Array.from({ length: size.rows }, (_, r) => ({ id: r }));
  }, [size.rows]);

  // 3. Selection Sync
  const onSelectedCellChange = useCallback((args: { idx: number; rowIdx: number }) => {
      // idx 0 is SelectColumn, actual data starts at 1
      if (args.idx === 0) return;
      
      const colKey = columns[args.idx].key;
      const id = getCellId(parseInt(colKey), args.rowIdx);
      onCellClick(id, false);
  }, [columns, onCellClick]);

  return (
    <div className="w-full h-full text-sm bg-white">
        <DataGrid 
            columns={columns} 
            rows={rows} 
            rowHeight={(row) => rowHeights[row.id] || 28}
            onColumnResize={(idx, width) => {
                const col = columns[idx];
                if (col && col.name) onColumnResize(col.name, width);
            }}
            onSelectedCellChange={onSelectedCellChange}
            className="rdg-light fill-grid h-full"
            style={{ blockSize: '100%' }}
            rowKeyGetter={(r) => r.id}
        />
    </div>
  );
};

export default Grid;
