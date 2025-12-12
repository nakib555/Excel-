import React, { useEffect, useRef, memo, useState } from 'react';
import Cell, { NavigationDirection } from './Cell';
import { CellId, CellData, GridSize } from '../types';
import { numToChar, getCellId, cn } from '../utils';

interface GridProps {
  size: GridSize;
  cells: Record<CellId, CellData>;
  activeCell: CellId | null;
  selectionRange: CellId[] | null;
  columnWidths: Record<string, number>;
  rowHeights: Record<number, number>;
  scale?: number;
  onCellClick: (id: CellId, isShift: boolean) => void;
  onCellDoubleClick: (id: CellId) => void;
  onCellChange: (id: CellId, val: string) => void;
  onNavigate: (direction: NavigationDirection) => void;
  onColumnResize: (id: string, width: number) => void;
  onRowResize: (rowIdx: number, height: number) => void;
  onSelectionDrag: (startId: CellId, currentId: CellId) => void;
  onContextMenu: (e: React.MouseEvent, id: CellId) => void;
}

const DEFAULT_COL_WIDTH = 100;
const DEFAULT_ROW_HEIGHT = 28;
const HEADER_COL_WIDTH = 46;
const HEADER_ROW_HEIGHT = 28;
const MIN_COL_WIDTH = 30;
const MIN_ROW_HEIGHT = 20;

const Grid: React.FC<GridProps> = ({
  size,
  cells,
  activeCell,
  selectionRange,
  columnWidths,
  rowHeights,
  scale = 1,
  onCellClick,
  onCellDoubleClick,
  onCellChange,
  onNavigate,
  onColumnResize,
  onRowResize,
  onSelectionDrag,
  onContextMenu
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cols = Array.from({ length: size.cols }, (_, i) => i);
  const rows = Array.from({ length: size.rows }, (_, i) => i);

  // Drag Selection State
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<CellId | null>(null);

  // Resize State
  const resizingRef = useRef<{
    type: 'col' | 'row';
    index: number;
    start: number;
    initialSize: number;
  } | null>(null);

  const isCellInRange = (id: string) => selectionRange ? selectionRange.includes(id) : false;

  // Scaled dimensions
  const sHeaderColWidth = HEADER_COL_WIDTH * scale;
  const sHeaderRowHeight = HEADER_ROW_HEIGHT * scale;
  
  const getColWidth = (colIndex: number) => {
    const raw = columnWidths[numToChar(colIndex)] || DEFAULT_COL_WIDTH;
    return raw * scale;
  };
  
  const getRowHeight = (rowIndex: number) => {
    const raw = rowHeights[rowIndex] || DEFAULT_ROW_HEIGHT;
    return raw * scale;
  };

  // Global Grid Key Handler (Navigation Mode)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.target as HTMLElement).tagName === 'INPUT') return;

    let handled = false;
    if (e.key === 'ArrowUp') { onNavigate('up'); handled = true; }
    else if (e.key === 'ArrowDown') { onNavigate('down'); handled = true; }
    else if (e.key === 'ArrowLeft') { onNavigate('left'); handled = true; }
    else if (e.key === 'ArrowRight') { onNavigate('right'); handled = true; }
    else if (e.key === 'Tab') { onNavigate(e.shiftKey ? 'left' : 'right'); handled = true; }
    else if (e.key === 'Enter') { onNavigate(e.shiftKey ? 'up' : 'down'); handled = true; }

    if (handled) {
        e.preventDefault();
        e.stopPropagation();
    }
  };

  // Drag & Resize Logic
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Handle Column/Row Resize
      if (resizingRef.current) {
        const { type, index, start, initialSize } = resizingRef.current;
        if (type === 'col') {
          const diff = e.clientX - start;
          const newWidth = Math.max(MIN_COL_WIDTH, initialSize + diff / scale);
          onColumnResize(numToChar(index), newWidth);
        } else {
          const diff = e.clientY - start;
          const newHeight = Math.max(MIN_ROW_HEIGHT, initialSize + diff / scale);
          onRowResize(index, newHeight);
        }
      }
    };

    const handleMouseUp = () => {
      // Stop Resizing
      if (resizingRef.current) {
        resizingRef.current = null;
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto';
      }
      // Stop Selection Dragging
      if (isDragging) {
          setIsDragging(false);
          dragStartRef.current = null;
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [onColumnResize, onRowResize, scale, isDragging]);

  const startResize = (e: React.MouseEvent, type: 'col' | 'row', index: number, currentSize: number) => {
    e.preventDefault();
    e.stopPropagation();
    resizingRef.current = { 
      type, 
      index, 
      start: type === 'col' ? e.clientX : e.clientY, 
      initialSize: currentSize / scale 
    };
    document.body.style.cursor = type === 'col' ? 'col-resize' : 'row-resize';
    document.body.style.userSelect = 'none';
  };

  const handleCellMouseDown = (id: CellId) => {
      setIsDragging(true);
      dragStartRef.current = id;
      onCellClick(id, false); // Select the cell
  };

  const handleCellMouseEnter = (id: CellId) => {
      if (isDragging && dragStartRef.current) {
          onSelectionDrag(dragStartRef.current, id);
      }
  };

  return (
    <div 
        ref={containerRef}
        className="flex-1 overflow-auto bg-white relative w-full h-full scrollbar-thin touch-auto outline-none" 
        style={{ contain: 'strict' }}
        tabIndex={0}
        onKeyDown={handleKeyDown}
    >
      <div className="inline-block bg-white min-w-full pb-20 pr-20">
        
        {/* Column Headers */}
        <div className="flex sticky top-0 z-20 bg-slate-50 shadow-sm border-b border-slate-300">
          {/* Corner */}
          <div 
            className="flex-shrink-0 bg-slate-100 border-r border-slate-300 border-b border-slate-300 sticky left-0 z-30" 
            style={{ width: sHeaderColWidth, height: sHeaderRowHeight }} 
          >
              <div className="w-full h-full relative">
                  <div className="absolute bottom-0 right-0 w-0 h-0 border-l-[10px] border-l-transparent border-b-[10px] border-b-slate-400/50"></div>
              </div>
          </div>
          
          {cols.map((col) => {
            const width = getColWidth(col);
            const colLetter = numToChar(col);
            const isActiveCol = activeCell && activeCell.startsWith(colLetter); 

            return (
              <div
                key={`header-${col}`}
                className={cn(
                  "flex items-center justify-center font-semibold border-r border-slate-300 select-none transition-colors relative flex-shrink-0 group",
                  isActiveCol 
                    ? "bg-emerald-50 text-emerald-700 border-b-emerald-400" 
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                )}
                style={{ width, height: sHeaderRowHeight, fontSize: `${12 * scale}px` }}
                onContextMenu={(e) => { e.preventDefault(); /* Could add col context menu here */ }}
              >
                {colLetter}
                <div className={cn("absolute bottom-0 left-0 right-0 h-[2px]", isActiveCol ? "bg-emerald-500" : "bg-transparent")} />
                
                {/* Resize handle */}
                <div 
                  className="absolute right-0 top-0 bottom-0 w-[6px] translate-x-1/2 cursor-col-resize hover:bg-primary-500/50 transition-colors z-20"
                  onMouseDown={(e) => startResize(e, 'col', col, width)}
                />
              </div>
            );
          })}
        </div>

        {/* Rows */}
        <div>
          {rows.map((row) => {
             const height = getRowHeight(row);
             const isActiveRow = activeCell && parseInt(activeCell.replace(/[A-Z]+/, '')) === row + 1;
             
             return (
              <div key={`row-${row}`} className="flex h-max">
                {/* Row Header */}
                <div
                  className={cn(
                     "sticky left-0 z-10 flex items-center justify-center font-semibold border-r border-b border-slate-300 select-none transition-colors flex-shrink-0 relative group",
                     isActiveRow 
                          ? "bg-emerald-50 text-emerald-700 border-r-emerald-400" 
                          : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  )}
                  style={{ 
                    width: sHeaderColWidth, 
                    height: height,
                    fontSize: `${12 * scale}px`
                  }}
                  onContextMenu={(e) => { e.preventDefault(); /* Could add row context menu here */ }}
                >
                  {row + 1}
                  <div className={cn("absolute top-0 right-0 bottom-0 w-[2px]", isActiveRow ? "bg-emerald-500" : "bg-transparent")} />
                  
                  {/* Resize Handle */}
                  <div 
                      className="absolute bottom-0 left-0 right-0 h-[6px] translate-y-1/2 cursor-row-resize hover:bg-primary-500/50 transition-colors z-20"
                      onMouseDown={(e) => startResize(e, 'row', row, height)}
                  />
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
                      width={getColWidth(col)}
                      height={height}
                      scale={scale}
                      onClick={onCellClick}
                      onDoubleClick={onCellDoubleClick}
                      onChange={onCellChange}
                      onNavigate={onNavigate}
                      onMouseDown={handleCellMouseDown}
                      onMouseEnter={handleCellMouseEnter}
                      onContextMenu={onContextMenu}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default memo(Grid);