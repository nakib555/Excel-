
import React, { useEffect, useRef, memo, useCallback, useState, useMemo, useLayoutEffect } from 'react';
import { CellId, CellData, GridSize } from '../types';
import { numToChar, getCellId, cn } from '../utils';
import { NavigationDirection } from './Cell';
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
  onSelectionDrag: (startId: string, endId: string) => void;
  onCellDoubleClick: (id: CellId) => void;
  onCellChange: (id: CellId, val: string) => void;
  onNavigate: (direction: NavigationDirection, isShift: boolean) => void;
  onColumnResize: (id: string, width: number) => void;
  onRowResize: (rowIdx: number, height: number) => void;
  onExpandGrid: (direction: 'row' | 'col') => void;
  onZoom: (delta: number) => void;
}

// Configuration
const DEFAULT_COL_WIDTH = 100;
const DEFAULT_ROW_HEIGHT = 28;
const HEADER_COL_WIDTH = 46;
const HEADER_ROW_HEIGHT = 28;
const MIN_COL_WIDTH = 30;
const MIN_ROW_HEIGHT = 20;

// Performance Thresholds
const MAX_RENDERABLE_CELLS = 2500; // Hard limit on DOM nodes to maintain 60fps
const EXPANSION_THRESHOLD_SCREENS = 1.5; // Load more data when 1.5 screens away from edge

const Grid: React.FC<GridProps> = ({
  size,
  cells,
  activeCell,
  selectionRange,
  columnWidths,
  rowHeights,
  scale = 1,
  onCellClick,
  onSelectionDrag,
  onCellDoubleClick,
  onCellChange,
  onNavigate,
  onColumnResize,
  onRowResize,
  onExpandGrid,
  onZoom
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Drag Selection State
  const isDraggingRef = useRef(false);
  const selectionStartRef = useRef<string | null>(null);

  // Pinch Zoom State (Mobile)
  const touchStartDist = useRef<number>(0);
  const lastZoomScale = useRef<number>(scale);

  // Scroll Preservation on Zoom
  const prevScaleRef = useRef(scale);
  const scrollRatioRef = useRef({ x: 0, y: 0 });

  // Virtualization State
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

  // --- SCROLL ANCHORING LOGIC ---
  // When scale changes, we want to maintain the center position relative to the viewport
  useLayoutEffect(() => {
    if (Math.abs(prevScaleRef.current - scale) > 0.001 && containerRef.current) {
        const el = containerRef.current;
        
        // Calculate the new scroll position based on the scale ratio
        // We stored the ratio (scrollTop / scrollHeight) before the render
        // But since dimensions change instantly, simpler math is:
        // NewScroll = OldScroll * (NewScale / OldScale)
        
        const scaleRatio = scale / prevScaleRef.current;
        
        // We aim to keep the center of the viewport consistent
        const centerY = el.scrollTop + el.clientHeight / 2;
        const centerX = el.scrollLeft + el.clientWidth / 2;
        
        const newCenterY = centerY * scaleRatio;
        const newCenterX = centerX * scaleRatio;
        
        el.scrollTop = newCenterY - el.clientHeight / 2;
        el.scrollLeft = newCenterX - el.clientWidth / 2;
        
        prevScaleRef.current = scale;
    }
  }, [scale]);

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

  // --- ADVANCED VIRTUALIZATION LOGIC ---
  const { 
    visibleRowStart, visibleRowEnd, 
    visibleColStart, visibleColEnd, 
    spacerTop, spacerBottom, 
    spacerLeft, spacerRight 
  } = useMemo(() => {
    const { scrollTop, scrollLeft, clientHeight, clientWidth } = scrollState;
    
    // Average sizes for estimation
    const avgRowH = DEFAULT_ROW_HEIGHT * scale;
    const avgColW = DEFAULT_COL_WIDTH * scale;

    // Viewport Calculation
    const rowStartIndex = Math.floor(scrollTop / avgRowH);
    const rowEndIndex = Math.min(size.rows - 1, Math.floor((scrollTop + clientHeight) / avgRowH));
    
    const colStartIndex = Math.floor(scrollLeft / avgColW);
    const colEndIndex = Math.min(size.cols - 1, Math.floor((scrollLeft + clientWidth) / avgColW));
    
    // Determine Visible Count
    const rowsVisible = rowEndIndex - rowStartIndex + 1;
    const colsVisible = colEndIndex - colStartIndex + 1;
    
    // Dynamic Buffer Calculation based on Memory Budget
    // If we are zoomed out (scale < 0.5), we see MANY cells. We must throttle buffer.
    const currentRenderCount = rowsVisible * colsVisible;
    const spareCapacity = Math.max(0, MAX_RENDERABLE_CELLS - currentRenderCount);
    
    // Distribute spare capacity to rows/cols buffers
    // We prioritize vertical scrolling smoothness usually
    const rowBufferLimit = Math.floor(spareCapacity / (colsVisible || 1) / 2); // Divide by 2 for top/bottom
    const colBufferLimit = Math.floor(spareCapacity / (rowsVisible || 1) / 2);
    
    // Apply safe limits
    const rowBuffer = Math.min(Math.max(2, Math.ceil(5 / scale)), rowBufferLimit); 
    const colBuffer = Math.min(Math.max(1, Math.ceil(2 / scale)), colBufferLimit);

    // Apply Buffer
    const visibleRowStart = Math.max(0, rowStartIndex - rowBuffer);
    const visibleRowEnd = Math.min(size.rows - 1, rowEndIndex + rowBuffer);
    
    const visibleColStart = Math.max(0, colStartIndex - colBuffer);
    const visibleColEnd = Math.min(size.cols - 1, colEndIndex + colBuffer);

    // Precise Spacer Calculation
    // Note: In a real production app with variable heights, we'd need a prefix-sum tree. 
    // Here we use average/index estimation which is fast and "good enough" for this demo.
    // Ideally, iterate specifically if variable sizes are heavy used.
    
    const spacerTop = visibleRowStart * avgRowH;
    const spacerBottom = (size.rows - 1 - visibleRowEnd) * avgRowH;
    
    const spacerLeft = visibleColStart * avgColW;
    const spacerRight = (size.cols - 1 - visibleColEnd) * avgColW;

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

  // --- AUTO EXPANSION ON SCROLL BOUNDARIES ---
  useEffect(() => {
     if (!containerRef.current || loadingRef.current) return;
     
     const { scrollTop, scrollLeft, clientHeight, clientWidth, scrollHeight, scrollWidth } = containerRef.current;
     
     // Calculate thresholds relative to screen size (responsive)
     const rowThreshold = clientHeight * EXPANSION_THRESHOLD_SCREENS;
     const colThreshold = clientWidth * EXPANSION_THRESHOLD_SCREENS;
     
     const nearBottom = (scrollHeight - (scrollTop + clientHeight)) < rowThreshold;
     const nearRight = (scrollWidth - (scrollLeft + clientWidth)) < colThreshold;
     
     if (nearBottom) {
        loadingRef.current = true;
        setIsExpanding(true);
        onExpandGrid('row');
        // Debounce reset
        setTimeout(() => { loadingRef.current = false; setIsExpanding(false); }, 500);
     }
     
     if (nearRight && !loadingRef.current) {
        loadingRef.current = true;
        setIsExpanding(true);
        onExpandGrid('col');
        setTimeout(() => { loadingRef.current = false; setIsExpanding(false); }, 500);
     }
  }, [scrollState, onExpandGrid]);

  // --- TOUCH / PINCH EVENTS ---
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleTouchStart = (e: TouchEvent) => {
        if (e.touches.length === 2) {
            e.preventDefault();
            const dx = e.touches[0].pageX - e.touches[1].pageX;
            const dy = e.touches[0].pageY - e.touches[1].pageY;
            touchStartDist.current = Math.sqrt(dx * dx + dy * dy);
            lastZoomScale.current = scale;
        }
    };

    const handleTouchMove = (e: TouchEvent) => {
        if (e.touches.length === 2) {
            e.preventDefault();
            const dx = e.touches[0].pageX - e.touches[1].pageX;
            const dy = e.touches[0].pageY - e.touches[1].pageY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (touchStartDist.current > 0) {
                const ratio = dist / touchStartDist.current;
                const newScale = Math.min(4, Math.max(0.25, lastZoomScale.current * ratio));
                // We don't call onZoom immediately here to avoid thrashing, 
                // we could throttle it, but for now let's just do delta logic
                // For simplicity in this architecture, we calculate delta
                const delta = newScale - scale;
                if (Math.abs(delta) > 0.05) { // Threshold to prevent jitter
                    onZoom(delta);
                    touchStartDist.current = dist; // Reset base
                    lastZoomScale.current = newScale;
                }
            }
        }
    };

    el.addEventListener('touchstart', handleTouchStart, { passive: false });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
        el.removeEventListener('touchstart', handleTouchStart);
        el.removeEventListener('touchmove', handleTouchMove);
    };
  }, [scale, onZoom]);


  // --- EVENT HANDLERS ---

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.target as HTMLElement).tagName === 'INPUT') return;
    let handled = false;
    
    // Movement
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        const direction = e.key.replace('Arrow', '').toLowerCase() as NavigationDirection;
        onNavigate(direction, e.shiftKey);
        handled = true;
    }
    else if (e.key === 'Tab') { onNavigate(e.shiftKey ? 'left' : 'right', false); handled = true; }
    else if (e.key === 'Enter') { onNavigate(e.shiftKey ? 'up' : 'down', false); handled = true; }
    
    // Zoom shortcuts
    if (e.ctrlKey) {
        if (e.key === '=' || e.key === '+') { onZoom(0.1); handled = true; }
        if (e.key === '-') { onZoom(-0.1); handled = true; }
        if (e.key === '0') { onZoom(1 - scale); handled = true; } // Reset
    }

    if (handled) { e.preventDefault(); e.stopPropagation(); }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey) {
        e.preventDefault();
        // Finer grain zoom for touchpads
        const delta = e.deltaY > 0 ? -0.05 : 0.05;
        onZoom(delta);
    }
  };

  // Drag Selection Logic
  const handleCellMouseDown = useCallback((id: string, isShift: boolean) => {
      isDraggingRef.current = true;
      if (!isShift) {
        selectionStartRef.current = id;
      }
      onCellClick(id, isShift);
  }, [onCellClick]);

  const handleCellMouseEnter = useCallback((id: string) => {
      if (isDraggingRef.current && selectionStartRef.current) {
          onSelectionDrag(selectionStartRef.current, id);
      }
  }, [onSelectionDrag]);

  // Global Mouse Up for drag end
  useEffect(() => {
      const handleMouseUp = () => {
          isDraggingRef.current = false;
      }
      window.addEventListener('mouseup', handleMouseUp);
      return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

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

  // Scroll Handler (Optimized)
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    
    const element = containerRef.current;
    
    // Using a requestAnimationFrame here to detach scroll reads from state writes
    // helps maintain 60fps scrolling
    requestAnimationFrame(() => {
        setScrollState({ 
            scrollTop: element.scrollTop, 
            scrollLeft: element.scrollLeft, 
            clientHeight: element.clientHeight, 
            clientWidth: element.clientWidth 
        });
    });
  }, []);

  // Initial measurement
  useEffect(() => {
      if (containerRef.current) {
          const { clientHeight, clientWidth } = containerRef.current;
          setScrollState(prev => ({ ...prev, clientHeight, clientWidth }));
      }
  }, []);

  const handleCellNavigate = useCallback((direction: NavigationDirection) => {
      onNavigate(direction, false);
  }, [onNavigate]);

  return (
    <div 
        ref={containerRef}
        className="flex-1 overflow-auto bg-white relative w-full h-full scrollbar-thin touch-none outline-none" 
        style={{ contain: 'strict', willChange: 'scroll-position' }}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onScroll={handleScroll}
        onWheel={handleWheel}
    >
      {/* 
        Virtual container must be large enough to contain all potential cells 
        We use padding/spacers instead of a single giant div to reduce browser painting area
      */}
      <div className="inline-block bg-white min-w-full relative">
        
        {/* Sticky Headers Container */}
        <div className="sticky top-0 z-20 bg-[#f8f9fa] shadow-sm flex" style={{ width: 'max-content' }}>
          {/* Corner */}
          <div className="flex-shrink-0 bg-[#f8f9fa] border-r border-slate-300 border-b border-slate-300 sticky left-0 z-30 group hover:bg-slate-200 transition-colors cursor-pointer" 
               style={{ 
                 width: sHeaderColWidth, 
                 height: sHeaderRowHeight,
                 willChange: 'width, height'
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
                      fontSize: `${Math.max(10, 12 * scale)}px`,
                      contain: 'content'
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
              <div key={`row-${row}`} className="flex h-max group/row" style={{ width: 'max-content' }}>
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
                    fontSize: `${Math.max(10, 12 * scale)}px`,
                    contain: 'content'
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
                      onMouseDown={handleCellMouseDown}
                      onMouseEnter={handleCellMouseEnter}
                      onDoubleClick={onCellDoubleClick}
                      onChange={onCellChange}
                      onNavigate={handleCellNavigate}
                    />
                  );
                })}
                
                <div style={{ width: spacerRight, height: 1, flexShrink: 0 }} />
              </div>
            );
          })}

          <div style={{ height: spacerBottom, width: '100%' }} />
        </div>

        {/* Loading Indicator */}
        {isExpanding && (
           <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 backdrop-blur text-white px-4 py-2 rounded-full flex items-center gap-3 shadow-2xl animate-in fade-in slide-in-from-bottom-4">
               <Loader2 className="animate-spin text-emerald-400" size={18} />
               <span className="text-sm font-medium">Loading cells...</span>
           </div>
        )}
      </div>
    </div>
  );
};

export default memo(Grid);
