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
const DEFAULT_ROW_HEIGHT = 30; // Slightly tighter for desktop feel, standard for spreadsheet
const HEADER_COL_WIDTH = 46;
const HEADER_ROW_HEIGHT = 30;

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
    <div className="flex-1 overflow-auto bg-white relative w-full h-full scrollbar-thin touch-auto" style={{ contain: 'strict' }}>
      <div className="inline-block bg-white min-w-full pb-20 pr-20">
        
        {/* Column Headers */}
        <div className="flex sticky top-0 z-20 bg-slate-50 shadow-sm border-b border-slate-300">
          {/* Corner */}
          <div 
            className="flex-shrink-0 bg-slate-100 border-r border-slate-300 border-b border-slate-300 sticky left-0 z-30" 
            style={{ width: HEADER_COL_WIDTH, height: HEADER_ROW_HEIGHT }} 
          >
              <div className="w-full h-full relative">
                  <div className="absolute bottom-0 right-0 w-0 h-0 border-l-[10px] border-l-transparent border-b-[10px] border-b-slate-400/50"></div>
              </div>
          </div>
          
          {cols.map((col) => {
            const width = columnWidths[numToChar(col)] || DEFAULT_COL_WIDTH;
            const colLetter = numToChar(col);
            const isActiveCol = activeCell && activeCell.startsWith(colLetter); 

            return (
              <div
                key={`header-${col}`}
                className={`
                  flex items-center justify-center text-[12px] font-semibold border-r border-slate-300 select-none transition-colors relative flex-shrink-0 group
                  ${isActiveCol 
                    ? 'bg-emerald-50 text-emerald-700 border-b-emerald-400' 
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }
                `}
                style={{ width, height: HEADER_ROW_HEIGHT }}
              >
                {colLetter}
                <div className={`absolute bottom-0 left-0 right-0 h-[2px] ${isActiveCol ? 'bg-emerald-500' : 'bg-transparent'}`} />
                {/* Resize handle */}
                <div className="absolute right-0 top-0 bottom-0 w-[4px] cursor-col-resize hover:bg-primary-400 opacity-0 group-hover:opacity-100 transition-opacity z-10" />
              </div>
            );
          })}
        </div>

        {/* Rows */}
        <div>
          {rows.map((row) => (
            <div key={`row-${row}`} className="flex h-max">
              {/* Row Header */}
              <div
                className={`
                   sticky left-0 z-10 flex items-center justify-center text-[12px] font-semibold border-r border-b border-slate-300 select-none transition-colors flex-shrink-0
                   ${activeCell && parseInt(activeCell.replace(/[A-Z]+/, '')) === row + 1 
                        ? 'bg-emerald-50 text-emerald-700 border-r-emerald-400' 
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                   }
                `}
                style={{ 
                  width: HEADER_COL_WIDTH, 
                  height: rowHeights[row] || DEFAULT_ROW_HEIGHT
                }}
              >
                {row + 1}
                <div className={`absolute top-0 right-0 bottom-0 w-[2px] ${activeCell && parseInt(activeCell.replace(/[A-Z]+/, '')) === row + 1 ? 'bg-emerald-500' : 'bg-transparent'}`} />
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