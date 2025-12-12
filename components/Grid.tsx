import React, { useEffect, useRef, memo, useCallback, useState, useMemo } from 'react';
import { CellId, CellData, GridSize } from '../types';
import { numToChar, getCellId, cn } from '../utils';
import { NavigationDirection } from './Cell';
import { CellSkeleton } from './Skeletons';
import Cell from './Cell'; // Direct import for performance
import { Loader2 } from 'lucide-react';

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
  onZoom: (delta: number) => void;
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
  onExpandGrid,
  onZoom
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // State to track scroll position for virtualization
  const [scrollState, setScrollState] = useState({ 
    scrollTop: 0, 
    scrollLeft: 0, 
    clientHeight: 800, 
    clientWidth: 1200 
  });
  
  const [isExpanding, setIsExpanding] = useState(false);
  const loadingRef = useRef(false);
  const resizingRef = useRef<{
    type: 'col' | 'row';
    index: number;
    start: number;
    initialSize: number;
  } | null>(null);

  const isCellInRange = (id: string) => selectionRange ? selectionRange.includes(id) : false;

  // Scaled dimensions helper
  const sHeaderColWidth = HEADER_COL_WIDTH * scale;
  const sHeaderRowHeight = HEADER_ROW_HEIGHT * scale;
  
  const getColWidth = useCallback((colIndex: number) => {
    const raw = columnWidths[numToChar(colIndex)] || DEFAULT_COL_WIDTH;
    return raw * scale;
  }, [columnWidths, scale]);
  
  const getRowHeight = useCallback((rowIndex: number) => {
    const raw = rowHeights[rowIndex] || DEFAULT_ROW_HEIGHT;
    return raw * scale;
  }, [rowHeights, scale]);

  // --- VIRTUALIZATION / OFFLOAD LOGIC ---
  const { 
    visibleRowStart, visibleRowEnd, 
    visibleColStart, visibleColEnd, 
    spacerTop, spacerBottom, 
    spacerLeft, spacerRight 
  } = useMemo(() => {
    const { scrollTop, scrollLeft, clientHeight, clientWidth } = scrollState;
    
    const defaultRowH = DEFAULT_ROW_HEIGHT * scale;
    const defaultColW = DEFAULT_COL_WIDTH * scale;

    // Calculate dynamic buffer based on scale to keep screen filled
    // We limit buffer to avoid rendering too many nodes at 25% zoom
    const rowBuffer = Math.min(50, Math.ceil(800 / Math.max(1, defaultRowH)));
    const colBuffer = Math.min(20, Math.ceil(800 / Math.max(1, defaultColW)));

    // Calculate approx indices based on scroll
    const rowStartIndex = Math.floor(scrollTop / defaultRowH);
    const rowEndIndex = Math.min(size.rows - 1, Math.floor((scrollTop + clientHeight) / defaultRowH));
    
    const colStartIndex = Math.floor(scrollLeft / defaultColW);
    const colEndIndex = Math.min(size.cols - 1, Math.floor((scrollLeft + clientWidth) / defaultColW));

    // Apply Buffer
    const visibleRowStart = Math.max(0, rowStartIndex - rowBuffer);
    const visibleRowEnd = Math.min(size.rows - 1, rowEndIndex + rowBuffer);
    
    const visibleColStart = Math.max(0, colStartIndex - colBuffer);
    const visibleColEnd = Math.min(size.cols - 1, colEndIndex + colBuffer);

    // Calculate Spacers to fake the scrollbar size for the offloaded items
    const spacerTop = visibleRowStart * defaultRowH;
    const spacerBottom = (size.rows - 1 - visibleRowEnd) * defaultRowH;
    
    const spacerLeft = visibleColStart * defaultColW;
    const spacerRight = (size.cols - 1 - visibleColEnd) * defaultColW;

    return {
        visibleRowStart, visibleRowEnd,
        visibleColStart, visibleColEnd,
        spacerTop, spacerBottom,
        spacerLeft, spacerRight
    };
  }, [scrollState, size, scale]);

  // Generate index arrays for rendering
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

  // --- AUTO EXPANSION ON ZOOM/RESIZE ---
  useEffect(() => {
     if (!containerRef.current) return;
     const { scrollHeight, scrollWidth, clientHeight, clientWidth } = containerRef.current;
     
     // Calculate total expected dimensions with current scale
     const virtualHeight = size.rows * DEFAULT_ROW_HEIGHT * scale;
     const virtualWidth = size.cols * DEFAULT_COL_WIDTH * scale;

     // Ensure we have at least 1.5 screens worth of grid generated
     const minHeight = clientHeight * 1.5;
     const minWidth = clientWidth * 1.5;
     
     const needsRows = scrollHeight <= minHeight || virtualHeight <= minHeight;
     const needsCols = scrollWidth <= minWidth || virtualWidth <= minWidth;
     
     if (needsRows && !loadingRef.current) {
        onExpandGrid('row');
     }
     
     if (needsCols && !loadingRef.current) {
        onExpandGrid('col');
     }
  }, [scale, size, onExpandGrid, scrollState.clientHeight]); // Check when scrollState updates too

  // --- EVENT HANDLERS ---

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.target as HTMLElement).tagName === 'INPUT') return;
    let handled = false;
    if (e.key === 'ArrowUp') { onNavigate('up'); handled = true; }
    else if (e.key === 'ArrowDown') { onNavigate('down'); handled = true; }
    else if (e.key === 'ArrowLeft') { onNavigate('left'); handled = true; }
    else if (e.key === 'ArrowRight') { onNavigate('right'); handled = true; }
    else if (e.key === 'Tab') { onNavigate(e.shiftKey ? 'left' : 'right'); handled = true; }
    else if (e.key === 'Enter') { onNavigate(e.shiftKey ? 'up' : 'down'); handled = true; }
    
    // Zoom shortcut: Ctrl + + / -
    if (e.ctrlKey && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        onZoom(0.1);
        handled = true;
    } else if (e.ctrlKey && e.key === '-') {
        e.preventDefault();
        onZoom(-0.1);
        handled = true;
    }

    if (handled) { e.preventDefault(); e.stopPropagation(); }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        onZoom(delta);
    }
  };

  // Resize Handlers
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
    e.preventDefault(); e.stopPropagation();
    resizingRef.current = { type, index, start: type === 'col' ? e.clientX : e.clientY, initialSize: currentSize / scale };
    document.body.style.cursor = type === 'col' ? 'col-resize' : 'row-resize';
    document.body.style.userSelect = 'none';
  };

  // Scroll Handler with Optimized Infinite Scroll Logic
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    
    const element = containerRef.current;
    const { scrollTop, scrollHeight, clientHeight, scrollLeft, scrollWidth, clientWidth } = element;
    
    // Update state for virtualization synchronously
    setScrollState({ scrollTop, scrollLeft, clientHeight, clientWidth });

    if (loadingRef.current) return;

    requestAnimationFrame(() => {
        // Increase threshold to load earlier (1.5 screens or 1500px)
        const threshold = Math.max(1500, clientHeight * 1.5);
        
        const isBottom = scrollTop + clientHeight >= scrollHeight - threshold;
        const isRight = scrollLeft + clientWidth >= scrollWidth - threshold;

        if (isBottom || isRight) {
            loadingRef.current = true;
            setIsExpanding(true);
            
            if (isBottom) onExpandGrid('row');
            if (isRight) onExpandGrid('col');

            setTimeout(() => { 
                loadingRef.current = false;
                setIsExpanding(false);
            }, 300);
        }
    });
  }, [onExpandGrid]);

  // Initial measurement
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
        onWheel={handleWheel}
    >
      <div className="inline-block bg-white min-w-full pb-32 pr-32 relative">
        
        {/* Sticky Headers Container */}
        <div className="sticky top-0 z-20 bg-[#f8f9fa] shadow-sm flex">
          {/* Corner */}
          <div className="flex-shrink-0 bg-[#f8f9fa] border-r border-slate-300 border-b border-slate-300 sticky left-0 z-30 group hover:bg-slate-200 transition-colors cursor-pointer" 
               style={{ 
                 width: sHeaderColWidth, 
                 height: sHeaderRowHeight,
                 transition: 'width 0.1s ease-out, height 0.1s ease-out'
               }}
               onClick={() => {
                   // Placeholder for Select All
               }}
          >
              <div className="w-full h-full relative">
                  <div className="absolute bottom-1 right-1 w-0 h-0 border-l-[8px] border-l-transparent border-b-[8px] border-b-slate-400"></div>
              </div>
          </div>
          
          {/* Virtualized Column Headers */}
          <div className="flex border-b border-slate-300">
            <div style={{ width: spacerLeft, height: 1, flexShrink: 0 }} />
            
            {visibleCols.map((col) => {
                const width = getColWidth(col);
                const colLetter = numToChar(col);
                const isActiveCol = activeCell && activeCell.startsWith(colLetter); 

                return (
                <div
                    key={`header-${col}`}
                    className={cn(
                    "flex items-center justify-center font-semibold border-r border-slate-300 select-none transition-colors relative flex-shrink-0 group box-border",
                    isActiveCol 
                        ? "bg-emerald-50 text-emerald-700 font-bold" 
                        : "bg-[#f8f9fa] text-slate-700 hover:bg-[#e9ecef] hover:text-black"
                    )}
                    style={{ 
                      width, 
                      height: sHeaderRowHeight, 
                      fontSize: `${12 * scale}px`,
                      transition: 'width 0.1s ease-out, height 0.1s ease-out, font-size 0.1s ease-out'
                    }}
                    onClick={(e) => {
                        if(!e.shiftKey) onCellClick(getCellId(col, 0), false);
                    }}
                >
                    {colLetter}
                    <div className={cn("absolute bottom-0 left-0 right-0 h-[2px]", isActiveCol ? "bg-emerald-500" : "bg-transparent")} />
                    <div className="absolute right-0 top-0 bottom-0 w-[5px] translate-x-1/2 cursor-col-resize hover:bg-emerald-500/50 transition-colors z-20"
                         onMouseDown={(e) => startResize(e, 'col', col, width)}
                    />
                </div>
                );
            })}
            
            <div style={{ width: spacerRight, height: 1, flexShrink: 0 }} />
          </div>
        </div>

        {/* Rows Container */}
        <div>
          <div style={{ height: spacerTop, width: '100%' }} />

          {visibleRows.map((row) => {
             const height = getRowHeight(row);
             const isActiveRow = activeCell && parseInt(activeCell.replace(/[A-Z]+/, '')) === row + 1;
             
             return (
              <div key={`row-${row}`} className="flex h-max group/row">
                {/* Row Header - Sticky Left */}
                <div
                  className={cn(
                     "sticky left-0 z-10 flex items-center justify-center font-semibold border-r border-b border-slate-300 select-none transition-colors flex-shrink-0 relative group box-border",
                     isActiveRow 
                        ? "bg-emerald-50 text-emerald-700 font-bold border-r-emerald-500" 
                        : "bg-[#f8f9fa] text-slate-700 hover:bg-[#e9ecef] hover:text-black"
                  )}
                  style={{ 
                    width: sHeaderColWidth, 
                    height: height, 
                    fontSize: `${12 * scale}px`,
                    transition: 'width 0.1s ease-out, height 0.1s ease-out, font-size 0.1s ease-out'
                  }}
                  onClick={(e) => {
                       if(!e.shiftKey) onCellClick(getCellId(0, row), false);
                  }}
                >
                  {row + 1}
                  <div className="absolute bottom-0 left-0 right-0 h-[5px] translate-y-1/2 cursor-row-resize hover:bg-emerald-500/50 transition-colors z-20"
                      onMouseDown={(e) => startResize(e, 'row', row, height)}
                  />
                </div>

                <div style={{ width: spacerLeft, height: 1, flexShrink: 0 }} />

                {visibleCols.map((col) => {
                  const id = getCellId(col, row);
                  const cellData = cells[id] || { id, raw: '', value: '', style: {} };
                  const width = getColWidth(col);

                  return (
                    <Cell
                      key={id}
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
                  );
                })}
              </div>
            );
          })}

          <div style={{ height: spacerBottom, width: '100%' }} />
        </div>

        {/* Loading Indicator */}
        {isExpanding && (
           <div className="absolute bottom-4 right-4 z-50 bg-white/90 backdrop-blur border border-slate-200 shadow-elevation px-3 py-2 rounded-full flex items-center gap-2 animate-in fade-in duration-200 slide-in-from-bottom-2">
               <Loader2 className="animate-spin text-emerald-600" size={16} />
               <span className="text-xs font-medium text-slate-600">Generating cells...</span>
           </div>
        )}
      </div>
    </div>
  );
};

export default memo(Grid);