
import React, { useMemo, useCallback } from 'react';
import DataGrid, { Column, RenderCellProps, SelectColumn } from 'react-data-grid';
import { CellId, CellData, GridSize, CellStyle, ValidationRule } from '../types';
import { numToChar, getCellId, parseCellId, formatCellValue, updateCellInHF } from '../utils';
import { NavigationDirection } from './Cell';

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
  onCellClick: (id: CellId, isShift: boolean) => void;
  onCellChange: (id: CellId, val: string) => void;
  onNavigate: (direction: NavigationDirection, isShift: boolean) => void;
  onColumnResize: (id: string, width: number) => void;
  onRowResize: (rowIdx: number, height: number) => void;
}

const CustomCellRenderer = ({ row, column, cells, styles }: RenderCellProps<any> & { cells: Record<string, CellData>, styles: Record<string, CellStyle> }) => {
  const cellId = getCellId(parseInt(column.key), row.id);
  const cellData = cells[cellId];
  
  if (!cellData) return null;

  const styleId = cellData.styleId;
  const style = styleId ? styles[styleId] : {};
  
  const displayValue = formatCellValue(cellData.value, style);

  const cssStyle: React.CSSProperties = {
      fontWeight: style.bold ? 'bold' : 'normal',
      fontStyle: style.italic ? 'italic' : 'normal',
      textDecoration: style.underline ? 'underline' : 'none',
      backgroundColor: style.bg || 'transparent',
      color: style.color || 'inherit',
      textAlign: style.align || 'left',
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: style.verticalAlign === 'middle' ? 'center' : style.verticalAlign === 'top' ? 'flex-start' : 'flex-end',
      padding: '0 4px',
      overflow: 'hidden'
  };

  return (
    <div style={cssStyle}>
      {displayValue}
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
       SelectColumn, // Built-in selection column or custom row header
       ...Array.from({ length: size.cols }, (_, i) => {
          const colChar = numToChar(i);
          return {
            key: i.toString(),
            name: colChar,
            resizable: true,
            width: columnWidths[colChar] || 100,
            renderCell: (props) => <CustomCellRenderer {...props} cells={cells} styles={styles} />,
            editor: ({ row, column, onRowChange, onClose }) => {
                const id = getCellId(parseInt(column.key), row.id);
                return (
                    <input 
                        autoFocus
                        className="w-full h-full px-1 outline-none"
                        value={row[column.key]?.raw || ''}
                        onChange={(e) => {
                            // Local update for responsiveness
                            onRowChange({ ...row, [column.key]: { ...row[column.key], raw: e.target.value } });
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
                    />
                );
            }
          };
       })
    ];
    return cols;
  }, [size.cols, columnWidths, cells, styles, onCellChange]);

  // 2. Generate Rows
  const rows = useMemo(() => {
    // Map sparse cells to row objects for RDG
    const rowData = new Array(size.rows);
    for (let r = 0; r < size.rows; r++) {
        const row: any = { id: r };
        // Optimization: Only populate if data exists? 
        // RDG needs properties to render.
        // We can just pass the row index and let CustomCellRenderer look up via `cells` map + row index.
        rowData[r] = row;
    }
    return rowData;
  }, [size.rows]); // Re-generate only if row count changes. 
  // Note: We don't depend on `cells` here because the renderer reads directly from props.cells

  // 3. Selection Sync
  const onSelectedCellChange = useCallback((args: { idx: number; rowIdx: number }) => {
      const colKey = columns[args.idx].key;
      // Skip SelectColumn (idx 0 usually if mapped)
      if (!colKey || isNaN(parseInt(colKey))) return;
      
      const id = getCellId(parseInt(colKey), args.rowIdx);
      onCellClick(id, false);
  }, [columns, onCellClick]);

  return (
    <div className="w-full h-full text-sm">
        <DataGrid 
            columns={columns} 
            rows={rows} 
            rowHeight={(row) => rowHeights[row.id] || 28}
            onColumnResize={(idx, width) => {
                const col = columns[idx];
                if (col && col.name) onColumnResize(col.name, width);
            }}
            onSelectedCellChange={onSelectedCellChange}
            className="rdg-light fill-grid"
            style={{ blockSize: '100%' }}
        />
    </div>
  );
};

export default Grid;
