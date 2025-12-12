import React, { useEffect, useRef, memo, lazy, Suspense, useCallback, useState, useMemo } from 'react';
import { CellId, CellData, GridSize } from '../types';
import { numToChar, getCellId, cn } from '../utils';
import { NavigationDirection } from './Cell';
import { CellSkeleton } from './Skeletons';

// Lazy load Cell component
const Cell = lazy(async () => {
    // Keep a tiny delay to allow the UI thread to breathe during massive scrolling operations
    // reducing frame drops during the suspense fallback switch
    await new Promise(resolve => setTimeout(resolve, 0)); 
    return import('./Cell');
});

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
  onExpandGrid: (direction: 'row' | 'col') => void;
}

const DEFAULT_COL_WIDTH = 100;
const DEFAULT_ROW_HEIGHT = 28;
const HEADER_COL_WIDTH = 46;
const HEADER_ROW_HEIGHT = 28;
const MIN_COL_WIDTH = 30;
const MIN_ROW_HEIGHT = 20;
const BUFFER = 10; // The requested buffer size (10 rows/cols)

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
  onExpandGrid
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState({ scrollTop: 0, scrollLeft: 0, clientHeight: 800, clientWidth: 1200 });
  const loadingRef = useRef(false);

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
  
  // Helper to get size
  const getColWidth = useCallback((colIndex: number) => {
    const raw = columnWidths[numToChar(colIndex)] || DEFAULT_COL_WIDTH;
    return raw * scale;
  }, [columnWidths, scale]);
  
  const getRowHeight = useCallback((rowIndex: number) => {
    const raw = rowHeights[rowIndex] || DEFAULT_ROW_HEIGHT;
    return raw * scale;
  }, [rowHeights, scale]);

  // Virtualization Calculations
  const { visibleRowStart, visibleRowEnd, visibleColStart, visibleColEnd, spacerTop, spacerBottom, spacerLeft, spacerRight } = useMemo(() => {
    const { scrollTop, scrollLeft, clientHeight, clientWidth } = scrollState;
    
    // 1. Calculate Row Indices
    // Approximation for performance on massive datasets:
    // We assume default height for the fast scroll calculation to avoid O(N) iteration on every scroll event.
    // Precise calculations would require a binary search tree or summed area table for 1M rows.
    const defaultRowH = DEFAULT_ROW_HEIGHT * scale;
    const defaultColW = DEFAULT_COL_WIDTH * scale;

    const rowStartIndex = Math.floor(scrollTop / defaultRowH);
    const rowEndIndex = Math.min(size.rows - 1, Math.floor((scrollTop + clientHeight) / defaultRowH));
    
    const colStartIndex = Math.floor(scrollLeft / defaultColW);
    const colEndIndex = Math.min(size.cols - 1, Math.floor((scrollLeft + clientWidth) / defaultColW));

    // Apply Buffer
    const visibleRowStart = Math.max(0, rowStartIndex - BUFFER);
    const visibleRowEnd = Math.min(size.rows - 1, rowEndIndex + BUFFER);
    
    const visibleColStart = Math.max(0, colStartIndex - BUFFER);
    const visibleColEnd = Math.min(size.cols - 1, colEndIndex + BUFFER);

    // Calculate Spacers (The empty space to simulate full size)
    // Note: This matches the approximation logic. 
    // If user resizes a specific row, the scrollbar might jump slightly, which is an acceptable tradeoff for 1M row performance without complex libraries.
    const spacerTop = visibleRowStart * defaultRowH;
    const spacerBottom = (size.rows - 1 - visibleRowEnd) * defaultRowH;
    
    const spacerLeft = visibleColStart * defaultColW;
    const spacerRight = (size.cols - 1 - visibleColEnd) * defaultColW;

    return {
        visibleRowStart,
        visibleRowEnd,
        visibleColStart,
        visibleColEnd,
        spacerTop,
        spacerBottom,
        spacerLeft,
        spacerRight
    };
  }, [scrollState, size, scale]); // Removed rowHeights/columnWidths from dependency to prevent recalc on every resize drag

  // Generate the arrays of indices to render
  const visibleRows = useMemo(() => {
    const rows = [];
    for (let i = visibleRowStart; i <= visibleRowEnd; i++) rows.push(i);
    return rows;
  }, [visibleRowStart, visibleRowEnd]);

  const visibleCols = useMemo(() => {
    const cols = [];
    for (let i = visibleColStart; i <= visibleColEnd; i++) cols.push(i);
    return cols;
  }, [visibleColStart, visibleColEnd]);


  // Global Grid Key Handler
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

  // Resizing Logic
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizingRef.current) return;
      
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
    };

    const handleMouseUp = () => {
      if (resizingRef.current) {
        resizingRef.current = null;
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto';
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [onColumnResize, onRowResize, scale]);

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

  // Infinite Scroll Handler
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight, scrollLeft, scrollWidth, clientWidth } = containerRef.current;
    
    // Update virtualization state
    // We use a requestAnimationFrame throttle implicit in React state updates usually, 
    // but for 60fps scroll we want this to be fast.
    setScrollState({ scrollTop, scrollLeft, clientHeight, clientWidth });

    if (loadingRef.current) return;

    // Threshold to trigger load (px)
    const threshold = 400;

    const isBottom = scrollTop + clientHeight >= scrollHeight - threshold;
    const isRight = scrollLeft + clientWidth >= scrollWidth - threshold;

    if (isBottom) {
        loadingRef.current = true;
        onExpandGrid('row');
        setTimeout(() => { loadingRef.current = false; }, 100);
    }

    if (isRight) {
        loadingRef.current = true;
        onExpandGrid('col');
        setTimeout(() => { loadingRef.current = false; }, 100);
    }
  }, [onExpandGrid]);

  // Initial size check
  useEffect(() => {
      if (containerRef.current) {
          const { clientHeight, clientWidth } = containerRef.current;
          setScrollState(prev => ({ ...prev, clientHeight, clientWidth }));
      }
  }, []);

  return (
    <div 
        ref={containerRef}
        className="flex-1 overflow-auto bg-white relative w-full h-full scrollbar-thin touch-auto outline-none" 
        style={{ contain: 'strict' }}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onScroll={handleScroll}
    >
      <div className="inline-block bg-white min-w-full pb-20 pr-20">
        
        {/* Sticky Headers Container */}
        <div className="sticky top-0 z-20 bg-slate-50 shadow-sm border-b border-slate-300 flex">
          
          {/* Corner */}
          <div 
            className="flex-shrink-0 bg-slate-100 border-r border-slate-300 border-b border-slate-300 sticky left-0 z-30" 
            style={{ width: sHeaderColWidth, height: sHeaderRowHeight }} 
          >
              <div className="w-full h-full relative">
                  <div className="absolute bottom-0 right-0 w-0 h-0 border-l-[10px] border-l-transparent border-b-[10px] border-b-slate-400/50"></div>
              </div>
          </div>
          
          {/* Virtualized Column Headers */}
          <div className="flex">
            {/* Left Spacer for Columns */}
            <div style={{ width: spacerLeft, height: 1, flexShrink: 0 }} />
            
            {visibleCols.map((col) => {
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
            
            {/* Right Spacer for Columns */}
            <div style={{ width: spacerRight, height: 1, flexShrink: 0 }} />
          </div>
        </div>

        {/* Rows Container */}
        <div>
          {/* Top Spacer for Rows */}
          <div style={{ height: spacerTop, width: '100%' }} />

          {visibleRows.map((row) => {
             const height = getRowHeight(row);
             const isActiveRow = activeCell && parseInt(activeCell.replace(/[A-Z]+/, '')) === row + 1;
             
             return (
              <div key={`row-${row}`} className="flex h-max group/row">
                {/* Row Header - Sticky Left */}
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
                >
                  {row + 1}
                  <div className={cn("absolute top-0 right-0 bottom-0 w-[2px]", isActiveRow ? "bg-emerald-500" : "bg-transparent")} />
                  
                  {/* Resize Handle */}
                  <div 
                      className="absolute bottom-0 left-0 right-0 h-[6px] translate-y-1/2 cursor-row-resize hover:bg-primary-500/50 transition-colors z-20"
                      onMouseDown={(e) => startResize(e, 'row', row, height)}
                  />
                </div>

                {/* Horizontal Virtualization Spacers inside Row */}
                <div style={{ width: spacerLeft, height: 1, flexShrink: 0 }} />

                {/* Visible Cells */}
                {visibleCols.map((col) => {
                  const id = getCellId(col, row);
                  const cellData = cells[id] || { id, raw: '', value: '', style: {} };
                  const width = getColWidth(col);

                  return (
                    <Suspense key={id} fallback={<CellSkeleton width={width} height={height} />}>
                        <Cell
                          id={id}
                          data={cellData}
                          isSelected={activeCell === id}
                          isActive={activeCell === id}
                          isInRange={isCellInRange(id)}
                          width={width}
                          height={height}
                          scale={scale}
                          onClick={onCellClick}
                          onDoubleClick={onCellDoubleClick}
                          onChange={onCellChange}
                          onNavigate={onNavigate}
                        />
                    </Suspense>
                  );
                })}
                
                {/* We don't strictly need the right spacer here for layout flow, 
                    but the header has it to stretch the scrollbar. 
                    The container width comes from the header row mostly. 
                */}
              </div>
            );
          })}

          {/* Bottom Spacer for Rows */}
          <div style={{ height: spacerBottom, width: '100%' }} />
        </div>
      </div>
    </div>
  );
};

export default memo(Grid);