import React, { useEffect, useRef, memo, useCallback, useState, useMemo, useLayoutEffect, Suspense } from 'react';
import { CellId, CellData, GridSize, CellStyle } from '../types';
import { numToChar, charToNum, getCellId, parseCellId, cn } from '../utils';
import { NavigationDirection } from './Cell';
import { Loader2 } from 'lucide-react';
import { RowSkeleton } from './Skeletons';

// Static imports for smoother scrolling performance and reduced overhead
import GridRow from './GridRow';
import ColumnHeader from './ColumnHeader';

// --- EXCEL-LIKE ENGINE CONSTANTS ---
const DEFAULT_COL_WIDTH = 100;
const DEFAULT_ROW_HEIGHT = 28;
const HEADER_ROW_HEIGHT = 28;
const MIN_COL_WIDTH = 30;
const MIN_ROW_HEIGHT = 20;

const SCROLL_UPDATE_THRESHOLD = 20; 

interface GridProps {
  size: GridSize;
  cells: Record<CellId, CellData>;
  styles: Record<string, CellStyle>;
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

const Grid: React.FC<GridProps> = ({
  size,
  cells,
  styles,
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
  const gridLayerRef = useRef<HTMLDivElement>(null);
  const lastScrollPos = useRef({ top: 0, left: 0, time: 0 });
  const velocityRef = useRef({ y: 0, x: 0 });
  
  // Detect Mobile/Tablet to reduce buffer size
  const isMobile = useRef(typeof navigator !== 'undefined' && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)).current;

  // Interaction State
  const isDraggingRef = useRef(false);
  const selectionStartRef = useRef<string | null>(null);
  const resizingRef = useRef<{ type: 'col' | 'row'; index: number; start: number; initialSize: number; } | null>(null);

  // Transient State
  const [isPinching, setIsPinching] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const touchStartDist = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  
  // Offloading Timer
  const offloadTimerRef = useRef<any>(null);
  const [isIdle, setIsIdle] = useState(true);
  
  // Virtualization State
  const [scrollState, setScrollState] = useState({ 
    scrollTop: 0, 
    scrollLeft: 0, 
    clientHeight: 800, 
    clientWidth: 1200,
    velocityFactor: 0 
  });
  
  const [isExpanding, setIsExpanding] = useState(false);
  const loadingRef = useRef(false);

  // Scroll Anchor Persistence
  const prevScaleRef = useRef(scale);
  const currentScaleRef = useRef(scale);
  useEffect(() => { currentScaleRef.current = scale; }, [scale]);

  // --- Dynamic Header Width Calculation ---
  // Calculates width based on number of digits in max row index to prevent overflow
  const headerColW = useMemo(() => {
     const digits = size.rows.toString().length;
     // Base 46px, plus roughly 8px per extra digit beyond 3
     const baseW = Math.max(46, (digits * 8) + 20); 
     return baseW * scale;
  }, [size.rows, scale]);

  // --- 0. SELECTION BOUNDS OPTIMIZATION (O(1)) ---
  const selectionBounds = useMemo(() => {
    if (!selectionRange || selectionRange.length === 0) return null;
    const start = parseCellId(selectionRange[0]);
    const end = parseCellId(selectionRange[selectionRange.length - 1]);
    if (!start || !end) return null;
    return {
        minRow: Math.min(start.row, end.row),
        maxRow: Math.max(start.row, end.row),
        minCol: Math.min(start.col, end.col),
        maxCol: Math.max(start.col, end.col)
    };
  }, [selectionRange]);

  // --- 1. EXCEL-LIKE VIRTUALIZATION LOGIC ---
  const { 
    visibleRows, visibleCols, 
    spacerTop, spacerBottom, 
    spacerLeft, spacerRight 
  } = useMemo(() => {
    const { scrollTop, scrollLeft, clientHeight, clientWidth, velocityFactor } = scrollState;
    
    // Tweak buffers based on device capability
    const IDLE_BUFFER = isMobile ? 3 : 5; 
    const BASE_BUFFER = isMobile ? 8 : 15;
    const MAX_BUFFER = isMobile ? 20 : 80;

    const avgRowH = DEFAULT_ROW_HEIGHT * scale;
    const avgColW = DEFAULT_COL_WIDTH * scale;

    // Calculate Viewport
    const viewportStartRow = Math.floor(scrollTop / avgRowH);
    const viewportEndRow = Math.min(size.rows - 1, Math.ceil((scrollTop + clientHeight) / avgRowH));
    
    const viewportStartCol = Math.floor(scrollLeft / avgColW);
    const viewportEndCol = Math.min(size.cols - 1, Math.ceil((scrollLeft + clientWidth) / avgColW));

    // Dynamic Buffer Calculation based on Velocity
    let dynamicBuffer = isIdle ? IDLE_BUFFER : BASE_BUFFER;
    
    // Aggressive buffering for smoothness, but capped for mobile memory
    if (velocityFactor > 3) dynamicBuffer = MAX_BUFFER; 
    else if (velocityFactor > 1) dynamicBuffer = Math.min(MAX_BUFFER, BASE_BUFFER * 2);
    else if (velocityFactor > 0.5) dynamicBuffer = Math.min(MAX_BUFFER, BASE_BUFFER * 1.5);

    const renderStartRow = Math.max(0, viewportStartRow - dynamicBuffer);
    const renderEndRow = Math.min(size.rows - 1, viewportEndRow + dynamicBuffer);
    
    const renderStartCol = Math.max(0, viewportStartCol - dynamicBuffer);
    const renderEndCol = Math.min(size.cols - 1, viewportEndCol + dynamicBuffer);

    // Spacers
    const spacerTop = renderStartRow * avgRowH;
    const spacerBottom = (size.rows - 1 - renderEndRow) * avgRowH;
    const spacerLeft = renderStartCol * avgColW;
    const spacerRight = (size.cols - 1 - renderEndCol) * avgColW;

    // Generate indices
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
  }, [scrollState, size, scale, isIdle, isMobile]); 

  // Background Pattern
  const bgPatternStyle = useMemo(() => ({
    backgroundImage: `linear-gradient(to right, #f1f5f9 1px, transparent 1px), linear-gradient(to bottom, #f1f5f9 1px, transparent 1px)`,
    backgroundSize: `${DEFAULT_COL_WIDTH * scale}px ${DEFAULT_ROW_HEIGHT * scale}px`,
    backgroundPosition: '0 0'
  }), [scale]);

  // --- 2. SMOOTH ZOOM & SELECTION CENTERING ---
  useLayoutEffect(() => {
    if (Math.abs(prevScaleRef.current - scale) > 0.001 && containerRef.current) {
        const el = containerRef.current;
        let targetUnscaledCenterX = 0;
        let targetUnscaledCenterY = 0;
        let hasTarget = false;

        if (selectionBounds) {
             const { minRow, maxRow, minCol, maxCol } = selectionBounds;
             let top = minRow * DEFAULT_ROW_HEIGHT;
             let bottom = (maxRow + 1) * DEFAULT_ROW_HEIGHT;
             
             for (const [rStr, h] of Object.entries(rowHeights)) {
                 const r = parseInt(rStr);
                 const delta = Number(h) - DEFAULT_ROW_HEIGHT;
                 if (r < minRow) { top += delta; bottom += delta; } 
                 else if (r <= maxRow) { bottom += delta; }
             }

             let left = minCol * DEFAULT_COL_WIDTH;
             let right = (maxCol + 1) * DEFAULT_COL_WIDTH;
             
             for (const [cStr, w] of Object.entries(columnWidths)) {
                 const c = charToNum(cStr);
                 const delta = Number(w) - DEFAULT_COL_WIDTH;
                 if (c < minCol) { left += delta; right += delta; } 
                 else if (c <= maxCol) { right += delta; }
             }

             targetUnscaledCenterY = (top + bottom) / 2;
             targetUnscaledCenterX = (left + right) / 2;
             hasTarget = true;
        }

        if (hasTarget) {
            el.scrollTop = (targetUnscaledCenterY * scale) - el.clientHeight / 2;
            el.scrollLeft = (targetUnscaledCenterX * scale) - el.clientWidth / 2;
        } else {
            const scaleRatio = scale / prevScaleRef.current;
            const centerY = el.scrollTop + el.clientHeight / 2;
            const centerX = el.scrollLeft + el.clientWidth / 2;
            el.scrollTop = (centerY * scaleRatio) - el.clientHeight / 2;
            el.scrollLeft = (centerX * scaleRatio) - el.clientWidth / 2;
        }
        prevScaleRef.current = scale;
    }
  }, [scale, selectionBounds, rowHeights, columnWidths]);

  // --- 2.5 JUMP TO CELL (SCROLL SYNC) ---
  // When activeCell changes drastically (e.g. NameBox jump), scroll to it.
  useEffect(() => {
    if (!activeCell || !containerRef.current) return;
    
    const parsed = parseCellId(activeCell);
    if (!parsed) return;
    const { row, col } = parsed;
    
    // Calculate approximate position (O(K) where K is number of resized rows/cols)
    // Much faster than O(N) iteration
    let top = row * DEFAULT_ROW_HEIGHT;
    for (const [rStr, h] of Object.entries(rowHeights)) {
        const r = parseInt(rStr);
        if (r < row) top += (Number(h) - DEFAULT_ROW_HEIGHT);
    }
    top *= scale;

    let left = col * DEFAULT_COL_WIDTH;
    for (const [cStr, w] of Object.entries(columnWidths)) {
        const c = charToNum(cStr);
        if (c < col) left += (Number(w) - DEFAULT_COL_WIDTH);
    }
    left *= scale;

    const el = containerRef.current;
    const cellH = ((rowHeights[row] ? Number(rowHeights[row]) : undefined) || DEFAULT_ROW_HEIGHT) * scale;
    const cellW = ((columnWidths[numToChar(col)] ? Number(columnWidths[numToChar(col)]) : undefined) || DEFAULT_COL_WIDTH) * scale;

    // Scroll if out of view
    if (top < el.scrollTop) el.scrollTop = top;
    else if (top + cellH > el.scrollTop + el.clientHeight) el.scrollTop = top + cellH - el.clientHeight;

    if (left < el.scrollLeft) el.scrollLeft = left;
    else if (left + cellW > el.scrollLeft + el.clientWidth) el.scrollLeft = left + cellW - el.clientWidth;

  }, [activeCell, rowHeights, columnWidths, scale]);

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
                 gridLayerRef.current.style.transition = 'none';
                 gridLayerRef.current.style.transformOrigin = `${originX}px ${originY}px`;
                 gridLayerRef.current.style.willChange = 'transform';
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
                gridLayerRef.current.style.transition = ''; 
                gridLayerRef.current.style.willChange = 'auto';
                
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

  // --- 4. EXPANSION & SCROLL LOGIC ---
  const checkExpansion = useCallback((vy: number, vx: number) => {
     if (!containerRef.current || loadingRef.current) return;
     const { scrollTop, scrollLeft, clientHeight, clientWidth, scrollHeight, scrollWidth } = containerRef.current;
     
     const yMultiplier = Math.max(1, vy); 
     const xMultiplier = Math.max(1, vx);
     
     const rowThreshold = clientHeight * (2 + yMultiplier * 1.5); 
     const colThreshold = clientWidth * (2 + xMultiplier * 1.5); 
     
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
    
    const now = performance.now();
    const currentTop = element.scrollTop;
    const currentLeft = element.scrollLeft;
    
    const dt = Math.max(1, now - lastScrollPos.current.time);
    const dy = Math.abs(currentTop - lastScrollPos.current.top);
    const dx = Math.abs(currentLeft - lastScrollPos.current.left);
    
    const vy = dy / dt;
    const vx = dx / dt;
    velocityRef.current = { x: vx, y: vy };

    lastScrollPos.current = { top: currentTop, left: currentLeft, time: now };

    if (isIdle) setIsIdle(false);
    setIsScrolling(true);
    
    if (offloadTimerRef.current) clearTimeout(offloadTimerRef.current);
    offloadTimerRef.current = setTimeout(() => {
        setIsScrolling(false);
        setIsIdle(true); 
    }, 800); 

    checkExpansion(vy, vx);

    // Throttle for touch devices to prevent main thread blocking
    const updateThreshold = isMobile ? SCROLL_UPDATE_THRESHOLD * 1.5 : SCROLL_UPDATE_THRESHOLD;
    if (dy < updateThreshold && dx < updateThreshold) return;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
        setScrollState({ 
            scrollTop: currentTop, 
            scrollLeft: currentLeft, 
            clientHeight: element.clientHeight, 
            clientWidth: element.clientWidth,
            velocityFactor: Math.max(vy, vx)
        });
    });
  }, [checkExpansion, isIdle, isMobile]);

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
          return;
      }
      if (e.altKey && activeCell) {
          e.preventDefault();
          const { row, col } = parseCellId(activeCell)!;
          if (e.deltaY !== 0) {
              const currentH = rowHeights[row] || DEFAULT_ROW_HEIGHT;
              const change = e.deltaY > 0 ? -5 : 5; 
              onRowResize(row, Math.max(MIN_ROW_HEIGHT, currentH + change));
          } else if (e.deltaX !== 0) {
              const colChar = numToChar(col);
              const currentW = columnWidths[colChar] || DEFAULT_COL_WIDTH;
              const change = e.deltaX > 0 ? -5 : 5;
              onColumnResize(colChar, Math.max(MIN_COL_WIDTH, currentW + change));
          }
      }
  };

  const getColW = useCallback((i: number) => (columnWidths[numToChar(i)] || DEFAULT_COL_WIDTH) * scale, [columnWidths, scale]);
  const getRowH = useCallback((i: number) => (rowHeights[i] || DEFAULT_ROW_HEIGHT) * scale, [rowHeights, scale]);
  const headerRowH = HEADER_ROW_HEIGHT * scale;
  const headerFontSize = Math.max(7, 12 * scale);
  const arrowSize = Math.max(4, 8 * scale);
  const arrowOffset = Math.max(2, 4 * scale);

  // Velocity threshold is lower on mobile to trigger fast mode earlier
  const velocityThreshold = isMobile ? 0.5 : 2;
  const isScrollingFast = Math.abs(scrollState.velocityFactor) > velocityThreshold;

  return (
    <div 
        ref={containerRef}
        className="flex-1 overflow-auto bg-slate-50 relative w-full h-full scrollbar-thin touch-pan-x touch-pan-y outline-none transform-gpu"
        style={{ contain: 'strict' }}
        onScroll={handleScroll}
        onWheel={handleWheel}
        tabIndex={0}
    >
      <div 
        ref={gridLayerRef}
        className={cn(
            "inline-block bg-white min-w-full relative origin-top-left",
            !isPinching && "transition-[transform] duration-75 ease-out", 
        )}
      >
        <div className="sticky top-0 z-20 bg-[#f8f9fa] shadow-sm flex" style={{ width: 'max-content' }}>
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

            <div className="flex border-b border-slate-300">
                <div style={{ width: spacerLeft, height: 1, flexShrink: 0 }} />
                {visibleCols.map(col => {
                    const width = getColW(col);
                    const colChar = numToChar(col);
                    const isActive = activeCell?.startsWith(colChar);
                    return (
                        <ColumnHeader 
                            key={col}
                            col={col}
                            width={width}
                            height={headerRowH}
                            colChar={colChar}
                            isActive={isActive}
                            fontSize={headerFontSize}
                            onCellClick={onCellClick}
                            startResize={startResize}
                        />
                    )
                })}
                <div style={{ width: spacerRight, height: 1, flexShrink: 0 }} />
            </div>
        </div>

        <div>
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
                    styles={styles}
                    activeCell={activeCell}
                    selectionBounds={selectionBounds} 
                    scale={scale}
                    headerColW={headerColW}
                    onCellClick={onCellClick}
                    handleMouseDown={handleMouseDown}
                    handleMouseEnter={handleMouseEnter}
                    onCellDoubleClick={onCellDoubleClick}
                    onCellChange={onCellChange}
                    onNavigate={onNavigate}
                    startResize={startResize}
                    isGhost={isScrolling && Math.abs(scrollState.velocityFactor) > 6} 
                    isScrollingFast={isScrollingFast}
                    bgPatternStyle={bgPatternStyle}
                />
            ))}
            
            <div style={{ height: spacerBottom, width: '100%', ...bgPatternStyle }} />
        </div>

        {(isExpanding) && (
           <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
               <div className="backdrop-blur text-white px-4 py-2 rounded-full flex items-center gap-3 shadow-2xl animate-in fade-in slide-in-from-bottom-2 border border-white/10 bg-slate-800/90">
                   <Loader2 className="animate-spin text-emerald-400" size={16} />
                   <span className="text-xs font-medium">Adding more cells...</span>
               </div>
           </div>
        )}

      </div>
    </div>
  );
};

export default memo(Grid);