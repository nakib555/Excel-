import React, { useEffect, useRef, memo, useCallback, useState, useMemo, useLayoutEffect, Suspense, lazy } from 'react';
import { CellId, CellData, GridSize } from '../types';
import { numToChar, getCellId, cn } from '../utils';
import { NavigationDirection } from './Cell';
import { Loader2 } from 'lucide-react';

// Lazy load GridRow to handle sheet expansion and scrolling efficiently
const GridRow = lazy(() => import('./GridRow'));

// --- EXCEL-LIKE ENGINE CONSTANTS ---
const DEFAULT_COL_WIDTH = 100;
const DEFAULT_ROW_HEIGHT = 28;
const HEADER_COL_WIDTH = 46;
const HEADER_ROW_HEIGHT = 28;
const MIN_COL_WIDTH = 30;
const MIN_ROW_HEIGHT = 20;

/**
 * 3️⃣ VISIBLE CELLS & SCROLLING BUFFER
 * Excel keeps "Visible rows + a buffer above and below".
 * Usually ~2-3 screens worth of rows are kept in the pre-render cache.
 * We increase BUFFER_SIZE to 50 (approx 2.5 screens) to ensure silky smooth scrolling.
 */
const BUFFER_SIZE = 50; 

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
  onTrimGrid?: () => void;
  onZoom: (delta: number) => void;
}

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
  onTrimGrid,
  onZoom
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gridLayerRef = useRef<HTMLDivElement>(null);
  
  // Interaction State
  const isDraggingRef = useRef(false);
  const selectionStartRef = useRef<string | null>(null);
  const resizingRef = useRef<{ type: 'col' | 'row'; index: number; start: number; initialSize: number; } | null>(null);

  // Transient State
  const [isPinching, setIsPinching] = useState(false);
  const [isScrollingFast, setIsScrollingFast] = useState(false);
  const touchStartDist = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const scrollTimeoutRef = useRef<any>(null);
  const trimTimeoutRef = useRef<any>(null);
  
  // Virtualization State
  const [scrollState, setScrollState] = useState({ 
    scrollTop: 0, 
    scrollLeft: 0, 
    clientHeight: 800, 
    clientWidth: 1200 
  });
  
  const [isExpanding, setIsExpanding] = useState(false);
  const loadingRef = useRef(false);

  // Scroll Anchor Persistence
  const prevScaleRef = useRef(scale);
  const currentScaleRef = useRef(scale);
  useEffect(() => { currentScaleRef.current = scale; }, [scale]);

  // --- 1. EXCEL-LIKE VIRTUALIZATION LOGIC ---
  // Calculates the "Visible + Used" set of cells.
  // Everything else is treated as "Empty / Conceptual" and offloaded from DOM.
  const { 
    visibleRows, visibleCols, 
    spacerTop, spacerBottom, 
    spacerLeft, spacerRight 
  } = useMemo(() => {
    const { scrollTop, scrollLeft, clientHeight, clientWidth } = scrollState;
    
    // Effective dimensions with scale
    const avgRowH = DEFAULT_ROW_HEIGHT * scale;
    const avgColW = DEFAULT_COL_WIDTH * scale;

    // 1. Calculate the exact Viewport (The Green Zone)
    const viewportStartRow = Math.floor(scrollTop / avgRowH);
    const viewportEndRow = Math.min(size.rows - 1, Math.ceil((scrollTop + clientHeight) / avgRowH));
    
    const viewportStartCol = Math.floor(scrollLeft / avgColW);
    const viewportEndCol = Math.min(size.cols - 1, Math.ceil((scrollLeft + clientWidth) / avgColW));

    // 2. Apply Strict Buffering (The Yellow Zone) - "2-3 screens worth"
    const renderStartRow = Math.max(0, viewportStartRow - BUFFER_SIZE);
    const renderEndRow = Math.min(size.rows - 1, viewportEndRow + BUFFER_SIZE);
    
    const renderStartCol = Math.max(0, viewportStartCol - BUFFER_SIZE);
    const renderEndCol = Math.min(size.cols - 1, viewportEndCol + BUFFER_SIZE);

    // 3. Calculate Spacers (The Black Zone / Void)
    // These represent the "conceptual" empty cells that do not exist in RAM/DOM.
    const spacerTop = renderStartRow * avgRowH;
    const spacerBottom = (size.rows - 1 - renderEndRow) * avgRowH;
    const spacerLeft = renderStartCol * avgColW;
    const spacerRight = (size.cols - 1 - renderEndCol) * avgColW;

    // 4. Generate Render Indices
    const rows = [];
    for (let i = renderStartRow; i <= renderEndRow; i++) rows.push(i);

    const cols = [];
    for (let i = renderStartCol; i <= renderEndCol; i++) cols.push(i);

    return {
        visibleRows: rows, 
        visibleCols: cols,
        spacerTop, spacerBottom,
        spacerLeft, spacerRight
    };
  }, [scrollState, size, scale]); 

  // Background Pattern for Spacers (Visual "Empty Cells" Trick)
  const bgPatternStyle = useMemo(() => ({
    backgroundImage: `linear-gradient(to right, #f1f5f9 1px, transparent 1px), linear-gradient(to bottom, #f1f5f9 1px, transparent 1px)`,
    backgroundSize: `${DEFAULT_COL_WIDTH * scale}px ${DEFAULT_ROW_HEIGHT * scale}px`,
    backgroundPosition: '0 0'
  }), [scale]);

  // --- 2. SMOOTH ZOOM & SCROLL PRESERVATION ---
  useLayoutEffect(() => {
    if (Math.abs(prevScaleRef.current - scale) > 0.001 && containerRef.current) {
        const el = containerRef.current;
        const scaleRatio = scale / prevScaleRef.current;
        
        // Keep focus point stable
        const centerY = el.scrollTop + el.clientHeight / 2;
        const centerX = el.scrollLeft + el.clientWidth / 2;
        
        el.scrollTop = (centerY * scaleRatio) - el.clientHeight / 2;
        el.scrollLeft = (centerX * scaleRatio) - el.clientWidth / 2;
        
        prevScaleRef.current = scale;
    }
  }, [scale]);

  // --- 3. PINCH ZOOM LOGIC ---
  const isPinchingRef = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleTouchStart = (e: TouchEvent) => {
        if (e.touches.length === 2) {
            e.preventDefault();
            isPinchingRef.current = true;
            setIsPinching(true);
            
            const dx = e.touches[0].pageX - e.touches[1].pageX;
            const dy = e.touches[0].pageY - e.touches[1].pageY;
            touchStartDist.current = Math.sqrt(dx * dx + dy * dy);
            
            if (gridLayerRef.current) {
                 const rect = el.getBoundingClientRect();
                 const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
                 const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2;
                 const originX = el.scrollLeft + (cx - rect.left);
                 const originY = el.scrollTop + (cy - rect.top);
                 gridLayerRef.current.style.transformOrigin = `${originX}px ${originY}px`;
            }
        }
    };

    const handleTouchMove = (e: TouchEvent) => {
        if (e.touches.length === 2 && isPinchingRef.current) {
            e.preventDefault();
            const dx = e.touches[0].pageX - e.touches[1].pageX;
            const dy = e.touches[0].pageY - e.touches[1].pageY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (touchStartDist.current > 0) {
                const ratio = dist / touchStartDist.current;
                if (rafRef.current) cancelAnimationFrame(rafRef.current);
                rafRef.current = requestAnimationFrame(() => {
                    if (gridLayerRef.current) {
                        gridLayerRef.current.style.transform = `scale(${ratio})`;
                    }
                });
            }
        }
    };

    const handleTouchEnd = (e: TouchEvent) => {
        if (isPinchingRef.current && e.touches.length < 2) {
            isPinchingRef.current = false;
            setIsPinching(false);
            
            if (gridLayerRef.current) {
                const currentTransform = gridLayerRef.current.style.transform;
                const match = currentTransform.match(/scale\(([^)]+)\)/);
                const ratio = match ? parseFloat(match[1]) : 1;
                gridLayerRef.current.style.transform = '';
                const newScale = Math.max(0.25, Math.min(4, currentScaleRef.current * ratio));
                onZoom(newScale - currentScaleRef.current);
            }
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        }
    };

    el.addEventListener('touchstart', handleTouchStart, { passive: false });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd);

    return () => {
        el.removeEventListener('touchstart', handleTouchStart);
        el.removeEventListener('touchmove', handleTouchMove);
        el.removeEventListener('touchend', handleTouchEnd);
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [onZoom]);

  // --- 4. EXPANSION & TRIM LOGIC ---
  const checkExpansion = useCallback(() => {
     if (!containerRef.current || loadingRef.current) return;
     const { scrollTop, scrollLeft, clientHeight, clientWidth, scrollHeight, scrollWidth } = containerRef.current;
     
     // Infinite Scroll Expansion
     const rowThreshold = clientHeight; 
     const colThreshold = clientWidth; 
     
     if ((scrollHeight - (scrollTop + clientHeight)) < rowThreshold) {
        loadingRef.current = true;
        setIsExpanding(true);
        onExpandGrid('row');
        setTimeout(() => { loadingRef.current = false; setIsExpanding(false); }, 150);
     } else if ((scrollWidth - (scrollLeft + clientWidth)) < colThreshold) {
        loadingRef.current = true;
        setIsExpanding(true);
        onExpandGrid('col');
        setTimeout(() => { loadingRef.current = false; setIsExpanding(false); }, 150);
     }
  }, [onExpandGrid]);

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const element = containerRef.current;
    
    // 1. Detect fast scrolling to enable Ghost Mode
    setIsScrollingFast(true);
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    
    scrollTimeoutRef.current = setTimeout(() => {
        setIsScrollingFast(false);
        
        // 2. Trigger Trim Logic (Garbage Collection of Empty Space)
        // This offloads "Conceptual Cells" that are far outside the viewport
        if (onTrimGrid) {
            if (trimTimeoutRef.current) clearTimeout(trimTimeoutRef.current);
            trimTimeoutRef.current = setTimeout(() => {
                onTrimGrid();
            }, 500); // Wait a bit after scroll stops
        }
    }, 150);

    checkExpansion();

    // Use rAF for high-performance scroll sync
    requestAnimationFrame(() => {
        setScrollState({ 
            scrollTop: element.scrollTop, 
            scrollLeft: element.scrollLeft, 
            clientHeight: element.clientHeight, 
            clientWidth: element.clientWidth 
        });
    });
  }, [checkExpansion, onTrimGrid]);

  // --- 5. EVENT HANDLERS ---
  const handleMouseDown = useCallback((id: string, isShift: boolean) => {
      isDraggingRef.current = true;
      if (!isShift) selectionStartRef.current = id;
      onCellClick(id, isShift);
  }, [onCellClick]);

  const handleMouseEnter = useCallback((id: string) => {
      if (isDraggingRef.current && selectionStartRef.current) {
          onSelectionDrag(selectionStartRef.current, id);
      }
  }, [onSelectionDrag]);

  useEffect(() => {
      const up = () => { isDraggingRef.current = false; };
      window.addEventListener('mouseup', up);
      return () => window.removeEventListener('mouseup', up);
  }, []);

  const startResize = (e: React.MouseEvent, type: 'col' | 'row', index: number, currentSize: number) => {
    e.preventDefault(); e.stopPropagation();
    resizingRef.current = { type, index, start: type === 'col' ? e.clientX : e.clientY, initialSize: currentSize / scale };
    document.body.style.cursor = type === 'col' ? 'col-resize' : 'row-resize';
  };

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (!resizingRef.current) return;
      const { type, index, start, initialSize } = resizingRef.current;
      const diff = (type === 'col' ? e.clientX : e.clientY) - start;
      const newSize = Math.max(type === 'col' ? MIN_COL_WIDTH : MIN_ROW_HEIGHT, initialSize + diff / scale);
      if (type === 'col') onColumnResize(numToChar(index), newSize);
      else onRowResize(index, newSize);
    };
    const up = () => {
      if(resizingRef.current) { resizingRef.current = null; document.body.style.cursor = ''; }
    };
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
    return () => { document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up); };
  }, [onColumnResize, onRowResize, scale]);

  const handleWheel = (e: React.WheelEvent) => {
      if (e.ctrlKey) {
          e.preventDefault();
          const delta = e.deltaY > 0 ? -0.1 : 0.1;
          onZoom(delta);
      }
  };

  // Dimensions Helpers
  const getColW = useCallback((i: number) => (columnWidths[numToChar(i)] || DEFAULT_COL_WIDTH) * scale, [columnWidths, scale]);
  const getRowH = useCallback((i: number) => (rowHeights[i] || DEFAULT_ROW_HEIGHT) * scale, [rowHeights, scale]);
  const headerColW = HEADER_COL_WIDTH * scale;
  const headerRowH = HEADER_ROW_HEIGHT * scale;
  const headerFontSize = Math.max(7, 12 * scale);
  const arrowSize = Math.max(4, 8 * scale);
  const arrowOffset = Math.max(2, 4 * scale);

  return (
    <div 
        ref={containerRef}
        className="flex-1 overflow-auto bg-slate-50 relative w-full h-full scrollbar-thin touch-pan-x touch-pan-y outline-none transform-gpu"
        onScroll={handleScroll}
        onWheel={handleWheel}
        tabIndex={0}
    >
      <div 
        ref={gridLayerRef}
        className={cn(
            "inline-block bg-white min-w-full relative origin-top-left",
            !isPinching && "transition-transform duration-100 ease-out", 
            isPinching && "will-change-transform"
        )}
      >
        
        {/* Sticky Headers Wrapper */}
        <div className="sticky top-0 z-20 bg-[#f8f9fa] shadow-sm flex" style={{ width: 'max-content' }}>
            {/* Corner */}
            <div 
                className="flex-shrink-0 bg-[#f8f9fa] border-r border-b border-slate-300 sticky left-0 z-30 select-none relative"
                style={{ width: headerColW, height: headerRowH }}
            >
                <div 
                    className="absolute border-l-transparent border-b-slate-400" 
                    style={{
                        right: `${arrowOffset}px`,
                        bottom: `${arrowOffset}px`,
                        borderLeftWidth: `${arrowSize}px`,
                        borderBottomWidth: `${arrowSize}px`,
                        borderLeftStyle: 'solid',
                        borderBottomStyle: 'solid',
                        width: 0,
                        height: 0
                    }}
                 />
            </div>

            {/* Column Headers */}
            <div className="flex border-b border-slate-300">
                <div style={{ width: spacerLeft, height: 1, flexShrink: 0 }} />
                {visibleCols.map(col => {
                    const width = getColW(col);
                    const colChar = numToChar(col);
                    const isActive = activeCell?.startsWith(colChar);
                    return (
                        <div key={col} className={cn("relative flex items-center justify-center border-r border-slate-300 select-none flex-shrink-0 text-slate-700 font-semibold bg-[#f8f9fa] hover:bg-slate-200 transition-colors overflow-hidden", isActive && "bg-emerald-100 text-emerald-800")}
                             style={{ width, height: headerRowH, fontSize: `${headerFontSize}px` }}
                             onClick={() => onCellClick(getCellId(col, 0), false)}>
                            {colChar}
                            <div className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-emerald-500 z-10"
                                 onMouseDown={(e) => startResize(e, 'col', col, width)} />
                        </div>
                    )
                })}
                <div style={{ width: spacerRight, height: 1, flexShrink: 0 }} />
            </div>
        </div>

        {/* Grid Body */}
        <div>
            {/* Top Spacer (Offloaded rows) */}
            <div style={{ height: spacerTop, width: '100%', ...bgPatternStyle }} />
            
            {visibleRows.map(row => (
                <Suspense 
                    key={row} 
                    fallback={
                        <div className="flex" style={{ height: getRowH(row), width: 'max-content' }}>
                            <div className="sticky left-0 z-10 border-r border-b border-slate-300 bg-[#f8f9fa]" style={{ width: headerColW, height: getRowH(row) }} />
                            <div style={{ width: spacerLeft, height: '100%' }} />
                            <div className="flex-1 border-b border-slate-100 bg-white skeleton-shine" style={{ minWidth: '800px' }} />
                        </div>
                    }
                >
                    <GridRow 
                        rowIdx={row}
                        visibleCols={visibleCols}
                        height={getRowH(row)}
                        spacerLeft={spacerLeft}
                        spacerRight={spacerRight}
                        getColW={getColW}
                        cells={cells}
                        activeCell={activeCell}
                        selectionRange={selectionRange}
                        scale={scale}
                        headerColW={headerColW}
                        onCellClick={onCellClick}
                        handleMouseDown={handleMouseDown}
                        handleMouseEnter={handleMouseEnter}
                        onCellDoubleClick={onCellDoubleClick}
                        onCellChange={onCellChange}
                        onNavigate={onNavigate}
                        startResize={startResize}
                        isGhost={isScrollingFast}
                        bgPatternStyle={bgPatternStyle}
                    />
                </Suspense>
            ))}
            
            {/* Bottom Spacer (Offloaded rows) */}
            <div style={{ height: spacerBottom, width: '100%', ...bgPatternStyle }} />
        </div>

        {/* Feedback Overlay */}
        {(isExpanding) && (
           <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
               <div className="backdrop-blur text-white px-4 py-2 rounded-full flex items-center gap-3 shadow-2xl animate-in fade-in slide-in-from-bottom-2 border border-white/10 bg-slate-800/90">
                   <Loader2 className="animate-spin text-emerald-400" size={16} />
                   <span className="text-xs font-medium">Expanding Sheet...</span>
               </div>
           </div>
        )}

      </div>
    </div>
  );
};

export default memo(Grid);