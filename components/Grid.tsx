import React from 'react';
import Cell from './Cell';
import { CellId, CellData, GridSize } from '../types';
import { numToChar, getCellId } from '../utils/helpers';

interface GridProps {
  size: GridSize;
  cells: Record<CellId, CellData>;
  activeCell: CellId | null;
  selectionRange: CellId[] | null;
  columnWidths: Record<string, number>;
  rowHeights: Record<number, number>;
  onCellClick: (id: CellId, isShift: boolean) => void;
  onCellDoubleClick: (id: CellId) => void;
  onCellChange: (id: CellId, val: string) => void;
}

const DEFAULT_COL_WIDTH = 100;
const DEFAULT_ROW_HEIGHT = 32; // Increased for better touch targets
const HEADER_COL_WIDTH = 48;

const Grid: React.FC<GridProps> = ({
  size,
  cells,
  activeCell,
  selectionRange,
  columnWidths,
  rowHeights,
  onCellClick,
  onCellDoubleClick,
  onCellChange
}) => {
  const cols = Array.from({ length: size.cols }, (_, i) => i);
  const rows = Array.from({ length: size.rows }, (_, i) => i);

  const isCellInRange = (id: string) => selectionRange ? selectionRange.includes(id) : false;

  return (
    <div className="flex-1 overflow-auto bg-slate-50 relative w-full h-full scrollbar-thin touch-auto">
      <div className="inline-block bg-white shadow-soft min-w-full pb-8 pr-8">
        
        {/* Column Headers */}
        <div className="flex sticky top-0 z-30 bg-slate-50 border-b border-slate-200 shadow-sm">
          {/* Corner */}
          <div 
            className="flex-shrink-0 border-r border-slate-200 bg-slate-100/50 sticky left-0 z-40" 
            style={{ width: HEADER_COL_WIDTH, height: DEFAULT_ROW_HEIGHT }} 
          />
          
          {cols.map((col) => {
            const width = columnWidths[numToChar(col)] || DEFAULT_COL_WIDTH;
            const colLetter = numToChar(col);
            const isActiveCol = activeCell && activeCell.startsWith(colLetter); // Simple check

            return (
              <div
                key={`header-${col}`}
                className={`
                  flex items-center justify-center text-[11px] font-bold border-r border-slate-200 select-none transition-colors relative flex-shrink-0
                  ${isActiveCol ? 'bg-primary-50 text-primary-700' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}
                `}
                style={{ width, height: DEFAULT_ROW_HEIGHT }}
              >
                {colLetter}
                {/* Resize handle visual */}
                <div className="absolute right-0 top-0 bottom-0 w-[2px] cursor-col-resize hover:bg-primary-300 hidden md:block" />
              </div>
            );
          })}
        </div>

        {/* Rows */}
        <div>
          {rows.map((row) => (
            <div key={`row-${row}`} className="flex">
              {/* Row Header */}
              <div
                className={`
                   sticky left-0 z-20 flex items-center justify-center text-[11px] font-bold border-r border-b border-slate-200 select-none transition-colors flex-shrink-0
                   ${activeCell && parseInt(activeCell.replace(/[A-Z]+/, '')) === row + 1 ? 'bg-primary-50 text-primary-700' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}
                `}
                style={{ 
                  width: HEADER_COL_WIDTH, 
                  height: rowHeights[row] || DEFAULT_ROW_HEIGHT
                }}
              >
                {row + 1}
              </div>

              {/* Cells */}
              {cols.map((col) => {
                const id = getCellId(col, row);
                const cellData = cells[id] || { id, raw: '', value: '', style: {} };

                return (
                  <Cell
                    key={id}
                    id={id}
                    data={cellData}
                    isSelected={activeCell === id}
                    isActive={activeCell === id}
                    isInRange={isCellInRange(id)}
                    width={columnWidths[numToChar(col)] || DEFAULT_COL_WIDTH}
                    height={rowHeights[row] || DEFAULT_ROW_HEIGHT}
                    onClick={onCellClick}
                    onDoubleClick={onCellDoubleClick}
                    onChange={onCellChange}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Grid;