
import React, { useEffect, useRef, memo, useCallback, useState, useMemo, useLayoutEffect, Suspense } from 'react';
import { CellId, CellData, GridSize } from '../types';
import { numToChar, getCellId, cn } from '../utils';
import { NavigationDirection } from './Cell';
import Cell from './Cell';
import { Loader2, AlertTriangle } from 'lucide-react';

// --- CONFIGURATION CONSTANTS ---
const DEFAULT_COL_WIDTH = 100;
const DEFAULT_ROW_HEIGHT = 28;
const HEADER_COL_WIDTH = 46;
const HEADER_ROW_HEIGHT = 28;
const MIN_COL_WIDTH = 30;
const MIN_ROW_HEIGHT = 20;

// Dynamic memory limit detection
const getDeviceSafeNodeLimit = () => {
    if (typeof navigator !== 'undefined' && 'deviceMemory' in navigator) {
        // @ts-ignore
        const ram = (navigator as any).deviceMemory as number;
        // Increase limits for modern devices to prevent aggressive virtualization culling
        return ram && ram <= 4 ? 1500 : 3500; 
    }
    return 2500; // Conservative default bumped up
};

const MAX_DOM_NODES = getDeviceSafeNodeLimit();

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

// --- ROW GENERATOR COMPONENT ---
// Separated to optimize rendering cycle
const GridRow = memo(({ 
    rowIdx, 
    visibleCols, 
    height, 
    spacerLeft, 
    spacerRight, 
    getColW, 
    cells, 
    activeCell, 
    selectionRange, 
    scale, 
    onCellClick, 
    handleMouseDown, 
    handleMouseEnter, 
    onCellDoubleClick, 
    onCellChange, 
    onNavigate, 
    startResize,
    headerColW,
    isGhost,
    bgPatternStyle
}: any) => {
    const isActiveRow = activeCell && parseInt(activeCell.replace(/[A-Z]+/, '')) === rowIdx + 1;
    
    return (
        <div className="flex" style={{ width: 'max-content', height }}>
            {/* Row Header */}
            <div 
                className={cn(
                    "sticky left-0 z-10 flex items-center justify-center border-r border-b border-slate-300 bg-[#f8f9fa] font-semibold text-slate-700 select-none flex-shrink-0 hover:bg-slate-200 text-xs transition-colors", 
                    isActiveRow && "bg-emerald-100 text-emerald-800"
                )}
                style={{ width: headerColW, height }}
                onClick={() => onCellClick(getCellId(0, rowIdx), false)}
            >
                {rowIdx + 1}
                <div 
                    className="absolute bottom-0 left-0 right-0 h-1 cursor-row-resize hover:bg-emerald-500 z-10"
                    onMouseDown={(e) => startResize(e, 'row', rowIdx, height)} 
                />
            </div>

            {/* Spacer Left with Pattern */}
            <div style={{ width: spacerLeft, height: '100%', flexShrink: 0, ...bgPatternStyle }} />
            
            {/* Cells Loop */}
            {visibleCols.map((col: number) => {
                const id = getCellId(col, rowIdx);
                const data = cells[id] || { id, raw: '', value: '', style: {} };
                const isSelected = activeCell === id;
                const isInRange = selectionRange ? selectionRange.includes(id) : false;
                
                return (
                    <Cell 
                        key={id} 
                        id={id} 
                        data={data}
                        isSelected={isSelected}
                        isActive={isSelected} 
                        isInRange={isInRange}
                        width={getColW(col)}
                        height={height}
                        scale={scale}
                        isGhost={isGhost}
                        onMouseDown={handleMouseDown}
                        onMouseEnter={handleMouseEnter}
                        onDoubleClick={onCellDoubleClick}
                        onChange={onCellChange}
                        onNavigate={onNavigate}
                    />
                );
            })}

            {/* Spacer Right with Pattern */}
            <div style={{ width: spacerRight, height: '100%', flexShrink: 0, ...bgPatternStyle }} />
        </div>
    );
}, (prev, next) => {
    // Custom check if row needs re-render
    if (prev.scale !== next.scale) return false;
    if (prev.height !== next.height) return false;
    if (prev.isGhost !== next.isGhost) return false;
    if (prev.visibleCols !== next.visibleCols) return false;
    // Deep check avoided for speed; relying on parent passing stable props or specific change signals
    return false; 
});

GridRow.displayName = 'GridRow';

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
  const pinchScaleRef = useRef(1); 
  const touchStartDist = useRef<number>(0);
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

  // --- 1. LOAD & OFFLOAD LOGIC (Virtualization) ---
  const { 
    visibleRowStart, visibleRowEnd, 
    visibleColStart, visibleColEnd, 
    spacerTop, spacerBottom, 
    spacerLeft, spacerRight,
    isOverloaded
  } = useMemo(() => {
    const { scrollTop, scrollLeft, clientHeight, clientWidth } = scrollState;
    
    // Effective dimensions
    const avgRowH = DEFAULT_ROW_HEIGHT * scale;
    const avgColW = DEFAULT_COL_WIDTH * scale;

    // Viewport Calculation
    const rowStartIndex = Math.floor(scrollTop / avgRowH);
    const rowEndIndex = Math.min(size.rows - 1, Math.ceil((scrollTop + clientHeight) / avgRowH));
    
    const colStartIndex = Math.floor(scrollLeft / avgColW);
    const colEndIndex = Math.min(size.cols - 1, Math.ceil((scrollLeft + clientWidth) / avgColW));
    
    const rowsVisible = rowEndIndex - rowStartIndex + 1;
    const colsVisible = colEndIndex - colStartIndex + 1;
    const totalVisible = rowsVisible * colsVisible;

    // Buffer Strategy (Load)
    // When zoomed out (scale < 1), we see many more cells, so we need a larger buffer 
    // to prevent white space while scrolling.
    const inverseScaleMultiplier = Math.max(1, 1 / scale);
    let rowBuffer = Math.ceil(4 * inverseScaleMultiplier); 
    let colBuffer = Math.ceil(2 * inverseScaleMultiplier);
    
    // Cap buffer if it gets too crazy to prevent massive DOM
    rowBuffer = Math.min(rowBuffer, 12);
    colBuffer = Math.min(colBuffer, 6);

    // Offload Strategy (Memory Overload Protection)
    let safeRowEnd = rowEndIndex;
    let safeColEnd = colEndIndex;
    let isOverloaded = false;

    if (totalVisible > MAX_DOM_NODES) {
        // We are overloaded. 
        // Strategy: Reduce buffer to minimum, but try to keep visible area intact
        const ratio = MAX_DOM_NODES / totalVisible;
        const safeRows = Math.floor(rowsVisible * Math.sqrt(ratio));
        const safeCols = Math.floor(colsVisible * Math.sqrt(ratio));
        
        safeRowEnd = rowStartIndex + safeRows;
        safeColEnd = colStartIndex + safeCols;
        rowBuffer = 1; // Minimal buffer
        colBuffer = 1;
        isOverloaded = true;
    }

    const finalRowStart = Math.max(0, rowStartIndex - rowBuffer);
    const finalRowEnd = Math.min(size.rows - 1, safeRowEnd + rowBuffer);
    
    const finalColStart = Math.max(0, colStartIndex - colBuffer);
    const finalColEnd = Math.min(size.cols - 1, safeColEnd + colBuffer);

    // Spacers
    const spacerTop = finalRowStart * avgRowH;
    const spacerBottom = (size.rows - 1 - finalRowEnd) * avgRowH;
    const spacerLeft = finalColStart * avgColW;
    const spacerRight = (size.cols - 1 - finalColEnd) * avgColW;

    return {
        visibleRowStart: finalRowStart, visibleRowEnd: finalRowEnd,
        visibleColStart: finalColStart, visibleColEnd: finalColEnd,
        spacerTop, spacerBottom,
        spacerLeft, spacerRight,
        isOverloaded
    };
  }, [scrollState, size, scale]);

  // Generate Indices Arrays
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

  // Background Pattern for Spacers (to look like empty cells)
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

  // --- 3. PINCH ZOOM LOGIC (Mobile & Trackpad) ---
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleTouchStart = (e: TouchEvent) => {
        if (e.touches.length === 2) {
            e.preventDefault();
            setIsPinching(true);
            const dx = e.touches[0].pageX - e.touches[1].pageX;
            const dy = e.touches[0].pageY - e.touches[1].pageY;
            touchStartDist.current = Math.sqrt(dx * dx + dy * dy);
            pinchScaleRef.current = scale;
        }
    };

    const handleTouchMove = (e: TouchEvent) => {
        if (e.touches.length === 2 && isPinching) {
            e.preventDefault();
            const dx = e.touches[0].pageX - e.touches[1].pageX;
            const dy = e.touches[0].pageY - e.touches[1].pageY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (touchStartDist.current > 0) {
                const ratio = dist / touchStartDist.current;
                
                // Visual feedback using transform (GPU)
                if (gridLayerRef.current) {
                    gridLayerRef.current.style.transform = `scale(${ratio})`;
                    gridLayerRef.current.style.transformOrigin = `${scrollState.scrollLeft + scrollState.clientWidth/2}px ${scrollState.scrollTop + scrollState.clientHeight/2}px`;
                }
            }
        }
    };

    const handleTouchEnd = (e: TouchEvent) => {
        if (isPinching && e.touches.length < 2) {
            setIsPinching(false);
            if (gridLayerRef.current) {
                const currentTransform = gridLayerRef.current.style.transform;
                const match = currentTransform.match(/scale\(([^)]+)\)/);
                const ratio = match ? parseFloat(match[1]) : 1;
                
                gridLayerRef.current.style.transform = '';
                const newScale = Math.max(0.25, Math.min(4, scale * ratio));
                onZoom(newScale - scale);
            }
        }
    };

    el.addEventListener('touchstart', handleTouchStart, { passive: false });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd);

    return () => {
        el.removeEventListener('touchstart', handleTouchStart);
        el.removeEventListener('touchmove', handleTouchMove);
        el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [scale, onZoom, isPinching, scrollState]);

  // --- 4. EXPANSION & SCROLL HANDLER ---
  const checkExpansion = useCallback(() => {
     if (!containerRef.current || loadingRef.current) return;
     const { scrollTop, scrollLeft, clientHeight, clientWidth, scrollHeight, scrollWidth } = containerRef.current;
     
     const rowThreshold = clientHeight; 
     const colThreshold = clientWidth; 
     
     if ((scrollHeight - (scrollTop + clientHeight)) < rowThreshold) {
        loadingRef.current = true;
        setIsExpanding(true);
        onExpandGrid('row');
        setTimeout(() => { loadingRef.current = false; setIsExpanding(false); }, 300);
     } else if ((scrollWidth - (scrollLeft + clientWidth)) < colThreshold) {
        loadingRef.current = true;
        setIsExpanding(true);
        onExpandGrid('col');
        setTimeout(() => { loadingRef.current = false; setIsExpanding(false); }, 300);
     }
  }, [onExpandGrid]);

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const element = containerRef.current;
    
    // Ghost Mode: Detect fast scrolling
    setIsScrollingFast(true);
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => setIsScrollingFast(false), 150);

    // Idle Trim Detection
    if (trimTimeoutRef.current) clearTimeout(trimTimeoutRef.current);
    trimTimeoutRef.current = setTimeout(() => {
        if (onTrimGrid) onTrimGrid();
    }, 1200);

    checkExpansion();

    requestAnimationFrame(() => {
        setScrollState({ 
            scrollTop: element.scrollTop, 
            scrollLeft: element.scrollLeft, 
            clientHeight: element.clientHeight, 
            clientWidth: element.clientWidth 
        });
    });
  }, [checkExpansion, onTrimGrid]);

  // Helpers
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
            "inline-block bg-white min-w-full relative transition-transform duration-75 ease-out origin-top-left",
            isPinching && "will-change-transform"
        )}
      >
        
        {/* Sticky Headers Wrapper */}
        <div className="sticky top-0 z-20 bg-[#f8f9fa] shadow-sm flex" style={{ width: 'max-content' }}>
            {/* Corner */}
            <div 
                className="flex-shrink-0 bg-[#f8f9fa] border-r border-b border-slate-300 sticky left-0 z-30 select-none"
                style={{ width: headerColW, height: headerRowH }}
            >
                <div className="absolute bottom-1 right-1 w-0 h-0 border-l-[8px] border-l-transparent border-b-[8px] border-b-slate-400" />
            </div>

            {/* Column Headers */}
            <div className="flex border-b border-slate-300">
                <div style={{ width: spacerLeft, height: 1, flexShrink: 0 }} />
                {visibleCols.map(col => {
                    const width = getColW(col);
                    const colChar = numToChar(col);
                    const isActive = activeCell?.startsWith(colChar);
                    return (
                        <div key={col} className={cn("relative flex items-center justify-center border-r border-slate-300 select-none flex-shrink-0 text-slate-700 font-semibold bg-[#f8f9fa] hover:bg-slate-200 text-xs", isActive && "bg-emerald-100 text-emerald-800")}
                             style={{ width, height: headerRowH }}
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
            {/* Top Spacer with Grid Pattern */}
            <div style={{ height: spacerTop, width: '100%', ...bgPatternStyle }} />
            
            {visibleRows.map(row => (
                <GridRow 
                    key={row}
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
                    // Pass handlers
                    onCellClick={onCellClick}
                    handleMouseDown={handleMouseDown}
                    handleMouseEnter={handleMouseEnter}
                    onCellDoubleClick={onCellDoubleClick}
                    onCellChange={onCellChange}
                    onNavigate={onNavigate}
                    startResize={startResize}
                    // Code Logic: Use Ghost element when scrolling fast for performance or overloaded
                    isGhost={isScrollingFast || isOverloaded}
                    bgPatternStyle={bgPatternStyle}
                />
            ))}
            
            {/* Bottom Spacer with Grid Pattern */}
            <div style={{ height: spacerBottom, width: '100%', ...bgPatternStyle }} />
        </div>

        {/* --- 5. GHOST OVERLAY / FEEDBACK --- */}
        {/* Displayed when memory protection kicks in or loading */}
        {(isExpanding || isOverloaded) && (
           <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
               <div className={cn(
                   "backdrop-blur text-white px-4 py-2 rounded-full flex items-center gap-3 shadow-2xl animate-in fade-in slide-in-from-bottom-2 border border-white/10",
                   isOverloaded ? "bg-amber-600/90" : "bg-slate-800/90"
               )}>
                   {isExpanding ? <Loader2 className="animate-spin text-emerald-400" size={16} /> : <AlertTriangle className="text-white" size={16} />}
                   <span className="text-xs font-medium">
                       {isExpanding ? "Expanding Sheet..." : "View Optimized (Reduced Detail)"}
                   </span>
               </div>
           </div>
        )}

      </div>
    </div>
  );
};

export default memo(Grid);
