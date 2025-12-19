
import React, { useEffect, useRef, memo, useCallback, useState, useMemo, useLayoutEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { CellId, CellData, GridSize, CellStyle, ValidationRule } from '../types';
import { numToChar, charToNum, getCellId, parseCellId, cn, getRange, getMergeRangeDimensions } from '../utils';
import { NavigationDirection } from './Cell';
import { Loader2 } from 'lucide-react';
import { GroupSkeleton } from './Skeletons';

import GridRow from './GridRow';
import ColumnHeader from './ColumnHeader';
import Cell from './Cell';

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
  merges: string[];
  validations: Record<CellId, ValidationRule>;
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
  merges,
  validations,
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
  
  const isMobile = useRef(typeof navigator !== 'undefined' && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)).current;
  const isDraggingRef = useRef(false);
  const selectionStartRef = useRef<string | null>(null);
  const resizingRef = useRef<{ type: 'col' | 'row'; index: number; start: number; initialSize: number; } | null>(null);
  const dragSelectionRef = useRef<{ anchorId: string } | null>(null);

  const [isPinching, setIsPinching] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const touchStartDist = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  
  const offloadTimerRef = useRef<any>(null);
  const [isIdle, setIsIdle] = useState(true);
  
  const [scrollState, setScrollState] = useState({ 
    scrollTop: 0, 
    scrollLeft: 0, 
    clientHeight: window.innerHeight - 300, 
    clientWidth: window.innerWidth,
    velocityFactor: 0 
  });
  
  const [isExpanding, setIsExpanding] = useState(false);
  const loadingRef = useRef(false);

  const prevScaleRef = useRef(scale);
  const currentScaleRef = useRef(scale);
  useEffect(() => { currentScaleRef.current = scale; }, [scale]);

  const headerColW = useMemo(() => {
     const digits = size.rows.toString().length;
     const baseW = Math.max(46, (digits * 8) + 20); 
     return baseW * scale;
  }, [size.rows, scale]);

  useLayoutEffect(() => {
      if (containerRef.current) {
          setScrollState(prev => ({
              ...prev,
              clientHeight: containerRef.current!.clientHeight,
              clientWidth: containerRef.current!.clientWidth
          }));
      }
  }, []);

  // --- PRE-CALCULATE MERGED CELL SET (Optimization) ---
  const mergedCellsSet = useMemo(() => {
      const set = new Set<string>();
      merges.forEach(range => {
          const cellsInRange = getRange(range.split(':')[0], range.split(':')[1] || range.split(':')[0]);
          cellsInRange.forEach(id => set.add(id));
      });
      return set;
  }, [merges]);

  // Optimized Position Calculators
  const getRowTop = useCallback((row: number) => {
      let top = row * DEFAULT_ROW_HEIGHT;
      for (const [rStr, h] of Object.entries(rowHeights)) {
          const r = parseInt(rStr);
          if (r < row) top += (Number(h) - DEFAULT_ROW_HEIGHT);
      }
      return top * scale;
  }, [rowHeights, scale]);

  const getColLeft = useCallback((col: number) => {
      let left = col * DEFAULT_COL_WIDTH;
      for (const [cStr, w] of Object.entries(columnWidths)) {
          const c = charToNum(cStr);
          if (c < col) left += (Number(w) - DEFAULT_COL_WIDTH);
      }
      return left * scale;
  }, [columnWidths, scale]);

  const getRowHeight = useCallback((r: number) => ((rowHeights[r] ?? DEFAULT_ROW_HEIGHT) * scale), [rowHeights, scale]);
  const getColWidth = useCallback((c: number) => ((columnWidths[numToChar(c)] ?? DEFAULT_COL_WIDTH) * scale), [columnWidths, scale]);

  // --- HELPER TO GET TOP/LEFT POSITION OF A CELL ---
  const getCellPosition = useCallback((col: number, row: number) => {
      return { top: getRowTop(row), left: getColLeft(col) };
  }, [getRowTop, getColLeft]);

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

  const { 
    visibleRows, visibleCols, 
    spacerTop, spacerBottom, 
    spacerLeft, spacerRight,
    viewStartRow, viewEndRow, viewStartCol, viewEndCol
  } = useMemo(() => {
    const { scrollTop, scrollLeft, clientHeight, clientWidth, velocityFactor } = scrollState;
    
    const IDLE_BUFFER = isMobile ? 3 : 5; 
    const BASE_BUFFER = isMobile ? 8 : 15;
    const MAX_BUFFER = isMobile ? 20 : 80;

    const avgRowH = DEFAULT_ROW_HEIGHT * scale;
    const avgColW = DEFAULT_COL_WIDTH * scale;

    const viewportStartRow = Math.floor(scrollTop / avgRowH);
    const viewportEndRow = Math.min(size.rows - 1, Math.ceil((scrollTop + clientHeight) / avgRowH));
    const viewportStartCol = Math.floor(scrollLeft / avgColW);
    const viewportEndCol = Math.min(size.cols - 1, Math.ceil((scrollLeft + clientWidth) / avgColW));

    let dynamicBuffer = isIdle ? IDLE_BUFFER : BASE_BUFFER;
    if (velocityFactor > 3) dynamicBuffer = MAX_BUFFER; 
    else if (velocityFactor > 1) dynamicBuffer = Math.min(MAX_BUFFER, BASE_BUFFER * 2);
    else if (velocityFactor > 0.5) dynamicBuffer = Math.min(MAX_BUFFER, BASE_BUFFER * 1.5);

    const renderStartRow = Math.max(0, viewportStartRow - dynamicBuffer);
    const renderEndRow = Math.min(size.rows - 1, viewportEndRow + dynamicBuffer);
    const renderStartCol = Math.max(0, viewportStartCol - dynamicBuffer);
    const renderEndCol = Math.min(size.cols - 1, viewportEndCol + dynamicBuffer);

    const spacerTop = renderStartRow * avgRowH;
    const spacerBottom = (size.rows - 1 - renderEndRow) * avgRowH;
    const spacerLeft = renderStartCol * avgColW;
    const spacerRight = (size.cols - 1 - renderEndCol) * avgColW;

    const rows = [];
    for (let i = renderStartRow; i <= renderEndRow; i++) rows.push(i);
    const cols = [];
    for (let i = renderStartCol; i <= renderEndCol; i++) cols.push(i);

    return {
        visibleRows: rows, 
        visibleCols: cols,
        spacerTop, spacerBottom,
        spacerLeft, spacerRight,
        viewStartRow: renderStartRow, viewEndRow: renderEndRow,
        viewStartCol: renderStartCol, viewEndCol: renderEndCol
    };
  }, [scrollState, size, scale, isIdle, isMobile]); 

  const visibleMerges = useMemo(() => {
      return merges.filter(range => {
          const s = parseCellId(range.split(':')[0]);
          const e = parseCellId(range.split(':')[1] || range.split(':')[0]);
          if (!s || !e) return false;
          return !(
              e.row < viewStartRow || 
              s.row > viewEndRow || 
              e.col < viewStartCol || 
              s.col > viewEndCol
          );
      });
  }, [merges, viewStartRow, viewEndRow, viewStartCol, viewEndCol]);

  const bgPatternStyle = useMemo(() => ({
    backgroundImage: `linear-gradient(to right, #f1f5f9 1px, transparent 1px), linear-gradient(to bottom, #f1f5f9 1px, transparent 1px)`,
    backgroundSize: `${DEFAULT_COL_WIDTH * scale}px ${DEFAULT_ROW_HEIGHT * scale}px`,
    backgroundPosition: '0 0'
  }), [scale]);

  useLayoutEffect(() => {
    if (Math.abs(prevScaleRef.current - scale) > 0.001 && containerRef.current) {
        const el = containerRef.current;
        let targetUnscaledCenterX = 0;
        let targetUnscaledCenterY = 0;
        let hasTarget = false;

        if (selectionBounds) {
             const { minRow, maxRow, minCol, maxCol } = selectionBounds;
             let top = getRowTop(minRow) / scale; // unscale logic moved
             // Simplified unscale center calc due to re-calc refactor complexity
             // Reverting to basic scale ratio preservation if not perfect target calc available in this scope
             const scaleRatio = scale / prevScaleRef.current;
             const centerY = el.scrollTop + el.clientHeight / 2;
             const centerX = el.scrollLeft + el.clientHeight / 2;
             el.scrollTop = (centerY * scaleRatio) - el.clientHeight / 2;
             el.scrollLeft = (centerX * scaleRatio) - el.clientWidth / 2;
        } else {
            const scaleRatio = scale / prevScaleRef.current;
            const centerY = el.scrollTop + el.clientHeight / 2;
            const centerX = el.scrollLeft + el.clientHeight / 2;
            el.scrollTop = (centerY * scaleRatio) - el.clientHeight / 2;
            el.scrollLeft = (centerX * scaleRatio) - el.clientWidth / 2;
        }
        prevScaleRef.current = scale;
    }
  }, [scale, selectionBounds, rowHeights, columnWidths, getRowTop, getColLeft]);

  useEffect(() => {
    if (!activeCell || !containerRef.current) return;
    const parsed = parseCellId(activeCell);
    if (!parsed) return;
    const { row, col } = parsed;
    
    const top = getRowTop(row);
    const left = getColLeft(col);

    const el = containerRef.current;
    const cellH = getRowHeight(row);
    const cellW = getColWidth(col);

    if (top < el.scrollTop) el.scrollTop = top;
    else if (top + cellH > el.scrollTop + el.clientHeight) el.scrollTop = top + cellH - el.clientHeight;

    if (left < el.scrollLeft) el.scrollLeft = left;
    else if (left + cellW > el.scrollLeft + el.clientWidth) el.scrollLeft = left + cellW - el.clientWidth;

  }, [activeCell, getRowTop, getColLeft, getRowHeight, getColWidth, scale]);

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
        setScrollState(prev => ({ ...prev, velocityFactor: 0 }));
    }, 150); 
    checkExpansion(vy, vx);
    const updateThreshold = isMobile ? SCROLL_UPDATE_THRESHOLD * 1.5 : SCROLL_UPDATE_THRESHOLD;
    if (dy < updateThreshold && dx < updateThreshold) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
        setScrollState(prev => ({ 
            ...prev,
            scrollTop: currentTop, 
            scrollLeft: currentLeft, 
            clientHeight: element.clientHeight, 
            clientWidth: element.clientWidth,
            velocityFactor: Math.max(vy, vx)
        }));
    });
  }, [checkExpansion, isIdle, isMobile]);

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

  // Touch Selection Logic for Mobile Handles
  const onHandleTouchStart = (e: React.TouchEvent, type: 'topLeft' | 'bottomRight') => {
      e.stopPropagation(); 
      if (!selectionBounds) return;
      const { minRow, maxRow, minCol, maxCol } = selectionBounds;
      
      let anchorId;
      if (type === 'topLeft') {
          // If moving top-left handle, anchor is bottom-right
          anchorId = getCellId(maxCol, maxRow);
      } else {
          // If moving bottom-right handle, anchor is top-left
          anchorId = getCellId(minCol, minRow);
      }
      dragSelectionRef.current = { anchorId };
  };

  useEffect(() => {
      const handleTouchMove = (e: TouchEvent) => {
          if (!dragSelectionRef.current) return;
          e.preventDefault(); // Stop scrolling while dragging handle
          
          const touch = e.touches[0];
          // Use elementsFromPoint to pierce through the handle/overlay
          const elements = document.elementsFromPoint(touch.clientX, touch.clientY);
          const cellEl = elements.find(el => el.hasAttribute('data-cell-id'));
          
          if (cellEl) {
              const cellId = cellEl.getAttribute('data-cell-id');
              if (cellId) {
                  onSelectionDrag(dragSelectionRef.current.anchorId, cellId);
              }
          }
      };
      
      const handleTouchEnd = () => {
          dragSelectionRef.current = null;
      };

      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      return () => {
          document.removeEventListener('touchmove', handleTouchMove);
          document.removeEventListener('touchend', handleTouchEnd);
      };
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
          const parsed = parseCellId(activeCell);
          if (!parsed) return;
          const { row, col } = parsed;
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

        <div className="relative">
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
                    mergedCellsSet={mergedCellsSet}
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

            {/* SELECTION OVERLAY */}
            {selectionBounds && !isScrollingFast && (
                (() => {
                    const { minRow, maxRow, minCol, maxCol } = selectionBounds;
                    const top = getRowTop(minRow);
                    const left = getColLeft(minCol);
                    
                    let height = 0;
                    for(let r = minRow; r <= maxRow; r++) height += getRowHeight(r);
                    
                    let width = 0;
                    for(let c = minCol; c <= maxCol; c++) width += getColWidth(c);

                    // Determine animation behavior
                    // We disable animation ('duration: 0') when dragging to keep the box responsive
                    // We use a spring animation when navigating via keyboard or single clicks
                    const isDragging = isDraggingRef.current;

                    return (
                        <motion.div 
                            className="absolute pointer-events-none z-30 border-[2px] border-primary-500 shadow-glow mix-blend-multiply rounded-[2px]"
                            initial={false}
                            animate={{
                                top,
                                left: left + headerColW,
                                width,
                                height
                            }}
                            transition={isDragging ? { duration: 0 } : {
                                type: "spring",
                                stiffness: 500,
                                damping: 28,
                                mass: 0.8
                            }}
                        >
                            {/* Mobile Touch Handles */}
                            <div 
                                className="absolute -top-3 -left-3 w-6 h-6 bg-white border-2 border-primary-500 rounded-full shadow-md z-50 flex items-center justify-center pointer-events-auto md:hidden touch-none"
                                onTouchStart={(e) => onHandleTouchStart(e, 'topLeft')}
                            />
                            <div 
                                className="absolute -bottom-3 -right-3 w-6 h-6 bg-white border-2 border-primary-500 rounded-full shadow-md z-50 flex items-center justify-center pointer-events-auto md:hidden touch-none"
                                onTouchStart={(e) => onHandleTouchStart(e, 'bottomRight')}
                            />

                            {/* Fill Handle (Desktop) */}
                            <div 
                                className="absolute -bottom-[4px] -right-[4px] bg-primary-500 border border-white cursor-crosshair rounded-[2.5px] shadow-sm z-50 pointer-events-auto hover:scale-125 transition-transform hidden md:block"
                                style={{ width: Math.max(6, 9 * scale), height: Math.max(6, 9 * scale) }}
                                onMouseDown={(e) => {
                                    e.stopPropagation();
                                    // Drag fill logic would go here
                                }}
                            />
                        </motion.div>
                    );
                })()
            )}

            {visibleMerges.map(range => {
                const s = parseCellId(range.split(':')[0]);
                if (!s) return null;
                const { width, height } = getMergeRangeDimensions(range, columnWidths, rowHeights, DEFAULT_COL_WIDTH, DEFAULT_ROW_HEIGHT);
                const { top, left } = getCellPosition(s.col, s.row);
                
                const id = getCellId(s.col, s.row);
                const data = cells[id];
                const safeData = data || { id, raw: '', value: '' };
                const cellStyle = (safeData.styleId && styles[safeData.styleId]) ? styles[safeData.styleId] : {};
                const isSelected = activeCell === id;
                const validation = validations[id];

                return (
                    <div 
                        key={range}
                        className="absolute z-20"
                        style={{
                            top: top,
                            left: left + headerColW,
                            width: width * scale,
                            height: height * scale
                        }}
                    >
                         <Cell 
                            id={id} 
                            data={safeData}
                            style={cellStyle}
                            isSelected={isSelected}
                            isActive={isSelected} 
                            isInRange={false}
                            width={width * scale}
                            height={height * scale}
                            scale={scale}
                            isGhost={false}
                            validation={validation}
                            onMouseDown={handleMouseDown}
                            onMouseEnter={handleMouseEnter}
                            onDoubleClick={onCellDoubleClick}
                            onChange={onCellChange}
                            onNavigate={(dir) => onNavigate(dir, false)}
                        />
                    </div>
                );
            })}
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
