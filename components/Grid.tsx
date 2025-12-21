
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

export const DEFAULT_COL_WIDTH = 100;
export const DEFAULT_ROW_HEIGHT = 28;
export const HEADER_ROW_HEIGHT = 28;
export const MIN_COL_WIDTH = 30;
export const MIN_ROW_HEIGHT = 20;

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
  centerActiveCell?: boolean;
  onCellClick: (id: CellId, isShift: boolean) => void;
  onSelectionDrag: (startId: string, endId: string) => void;
  onCellDoubleClick: (id: CellId) => void;
  onCellChange: (id: CellId, val: string) => void;
  onNavigate: (direction: NavigationDirection, isShift: boolean) => void;
  onColumnResize: (id: string, width: number) => void;
  onRowResize: (rowIdx: number, height: number) => void;
  onExpandGrid: (direction: 'row' | 'col') => void;
  onZoom: (delta: number) => void;
  onFill?: (sourceRange: CellId[], targetRange: CellId[]) => void;
  onAutoFit?: (col: number) => void;
  onScrollToActiveCell?: () => void;
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
  centerActiveCell = false,
  onCellClick,
  onSelectionDrag,
  onCellDoubleClick,
  onCellChange,
  onNavigate,
  onColumnResize,
  onRowResize,
  onExpandGrid,
  onZoom,
  onFill,
  onAutoFit,
  onScrollToActiveCell
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gridLayerRef = useRef<HTMLDivElement>(null);
  const lastScrollPos = useRef({ top: 0, left: 0, time: 0 });
  const velocityRef = useRef({ y: 0, x: 0 });
  
  const isMobile = useRef(typeof navigator !== 'undefined' && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)).current;
  const isDraggingRef = useRef(false);
  const isFillDraggingRef = useRef(false);
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

  // Fill Handle State
  const [fillRange, setFillRange] = useState<CellId[] | null>(null);
  
  // Filter Menu State (Exclusive opening)
  const [activeFilterId, setActiveFilterId] = useState<string | null>(null);

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

  // Reset loading state when size changes
  useEffect(() => {
      if (loadingRef.current) {
          loadingRef.current = false;
          setIsExpanding(false);
      }
  }, [size]);

  // --- PRE-CALCULATE MERGED CELL SET (Optimization) ---
  const mergedCellsSet = useMemo(() => {
      const set = new Set<string>();
      merges.forEach(range => {
          const cellsInRange = getRange(range.split(':')[0], range.split(':')[1] || range.split(':')[0]);
          cellsInRange.forEach(id => set.add(id));
      });
      return set;
  }, [merges]);

  // --- DISJOINT SELECTION SUPPORT ---
  const selectionSet = useMemo(() => new Set(selectionRange || []), [selectionRange]);

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

  // --- SMOOTH SCROLL TO ACTIVE CELL ---
  const prevActiveCellRef = useRef<string | null>(null);
  
  useEffect(() => {
      const hasChanged = activeCell !== prevActiveCellRef.current;
      prevActiveCellRef.current = activeCell;

      if (!activeCell || !containerRef.current) return;
      
      if (!hasChanged && !centerActiveCell) return;

      const parsed = parseCellId(activeCell);
      if (!parsed) return;
      const { col, row } = parsed;

      // Calculate absolute position of target cell
      const top = getRowTop(row);
      const left = getColLeft(col);
      const height = getRowHeight(row);
      const width = getColWidth(col);

      const container = containerRef.current;
      const { clientHeight, clientWidth, scrollTop, scrollLeft } = container;

      // Effective Viewport (accounting for sticky headers)
      const headerH = HEADER_ROW_HEIGHT * scale;
      const headerW = headerColW;

      // Visible area bounds in scroll coordinates
      const visibleTop = scrollTop + headerH;
      const visibleBottom = scrollTop + clientHeight;
      const visibleLeft = scrollLeft + headerW;
      const visibleRight = scrollLeft + clientWidth;

      // Target bounds
      const cellTop = top;
      const cellBottom = top + height;
      const cellLeft = left;
      const cellRight = left + width;

      let newScrollTop = scrollTop;
      let newScrollLeft = scrollLeft;
      let needsScroll = false;

      if (centerActiveCell) {
          // --- Center Logic (For Search/Jump) ---
          const centeredTop = top - headerH - (clientHeight - headerH) / 2 + height / 2;
          const centeredLeft = left - headerW - (clientWidth - headerW) / 2 + width / 2;
          
          // Clamp to scroll bounds
          newScrollTop = Math.max(0, centeredTop);
          newScrollLeft = Math.max(0, centeredLeft);
          needsScroll = true;
      } else {
          // --- Minimal Scroll Logic (For Navigation) ---
          
          // Vertical Logic
          if (cellTop < visibleTop) {
              newScrollTop = Math.max(0, cellTop - headerH - 10);
              needsScroll = true;
          } else if (cellBottom > visibleBottom) {
              newScrollTop = cellBottom - clientHeight + 10;
              needsScroll = true;
          }

          // Horizontal Logic
          if (cellLeft < visibleLeft) {
              newScrollLeft = Math.max(0, cellLeft - headerW - 10);
              needsScroll = true;
          } else if (cellRight > visibleRight) {
              newScrollLeft = cellRight - clientWidth + 10;
              needsScroll = true;
          }
      }

      if (needsScroll) {
          container.scrollTo({
              top: newScrollTop,
              left: newScrollLeft,
              behavior: 'smooth'
          });
      }
      
      // Notify parent that we've handled the forced center scroll
      if (centerActiveCell && onScrollToActiveCell) {
          // Wrap in slight delay to ensure scroll starts
          setTimeout(() => onScrollToActiveCell(), 50);
      }

  }, [activeCell, scale, getRowTop, getColLeft, getRowHeight, getColWidth, headerColW, centerActiveCell, onScrollToActiveCell]);

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

  // Determine fill selection logic
  const handleFillHandleMouseDown = (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      if (!selectionRange) return;
      isFillDraggingRef.current = true;
      setFillRange(selectionRange); // Initial visual state
      document.body.style.cursor = 'crosshair';
  };

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
      const target = e.target as HTMLDivElement;
      const { scrollTop, scrollLeft, clientHeight, clientWidth, scrollHeight, scrollWidth } = target;
      
      // Velocity Calculation
      const now = Date.now();
      const dt = now - lastScrollPos.current.time;
      let velocityFactor = 0;

      if (dt > 0) {
          const dy = Math.abs(scrollTop - lastScrollPos.current.top);
          const dx = Math.abs(scrollLeft - lastScrollPos.current.left);
          const velocity = Math.max(dy, dx) / dt; // pixels per ms
          velocityFactor = velocity * 2; 
      }

      setScrollState({ 
          scrollTop, 
          scrollLeft, 
          clientHeight, 
          clientWidth,
          velocityFactor
      });

      lastScrollPos.current = { top: scrollTop, left: scrollLeft, time: now };
      
      // Handle Scrolling State for Ghosting
      setIsScrolling(true);
      if (offloadTimerRef.current) clearTimeout(offloadTimerRef.current);
      setIsIdle(false);
      
      offloadTimerRef.current = setTimeout(() => {
          setIsScrolling(false);
          setIsIdle(true);
          setScrollState(prev => ({ ...prev, velocityFactor: 0 }));
      }, 150);

      // Infinite Scroll Logic
      if (!loadingRef.current) {
          const scrollBottom = scrollTop + clientHeight;
          const scrollRight = scrollLeft + clientWidth;
          
          // Threshold: 600px from edge
          if (scrollHeight - scrollBottom < 600) {
              loadingRef.current = true;
              setIsExpanding(true);
              onExpandGrid('row');
              // Safety timeout release
              setTimeout(() => { if(loadingRef.current) { loadingRef.current = false; setIsExpanding(false); } }, 3000);
          } else if (scrollWidth - scrollRight < 600) {
              loadingRef.current = true;
              setIsExpanding(true);
              onExpandGrid('col');
              setTimeout(() => { if(loadingRef.current) { loadingRef.current = false; setIsExpanding(false); } }, 3000);
          }
      }

  }, [onExpandGrid]);

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

    // Precise spacer calculations using getRowTop/getColLeft to handle variable sizes
    const spacerTop = getRowTop(renderStartRow);
    const spacerLeft = getColLeft(renderStartCol);
    
    // Calculate total height of rendered portion
    let renderedHeight = 0;
    for(let r = renderStartRow; r <= renderEndRow; r++) renderedHeight += getRowHeight(r);
    
    let renderedWidth = 0;
    for(let c = renderStartCol; c <= renderEndCol; c++) renderedWidth += getColWidth(c);

    // Calculate total grid dimensions
    const totalHeight = getRowTop(size.rows);
    const totalWidth = getColLeft(size.cols);

    const spacerBottom = Math.max(0, totalHeight - spacerTop - renderedHeight);
    const spacerRight = Math.max(0, totalWidth - spacerLeft - renderedWidth);

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
  }, [scrollState, size, scale, isIdle, isMobile, getRowTop, getColLeft, getRowHeight, getColWidth]); 

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

  // Use border-slate-200 color (#e2e8f0) for grid lines to match EmptyCell border
  const bgPatternStyle = useMemo(() => ({
    backgroundImage: `linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)`,
    backgroundSize: `${DEFAULT_COL_WIDTH * scale}px ${DEFAULT_ROW_HEIGHT * scale}px`,
    backgroundPosition: '0 0'
  }), [scale]);

  // Global Mouse Handlers for Dragging
  useEffect(() => {
      const handleWindowMouseMove = (e: MouseEvent) => {
          if (isFillDraggingRef.current && selectionBounds && containerRef.current) {
              const rect = containerRef.current.getBoundingClientRect();
              
              // Calculate cell under cursor
              const x = e.clientX - rect.left + containerRef.current.scrollLeft - headerColW;
              const y = e.clientY - rect.top + containerRef.current.scrollTop - HEADER_ROW_HEIGHT * scale;
              
              let currentTop = 0;
              let targetRow = 0;
              while(targetRow < size.rows) {
                  const h = rowHeights[targetRow] ? rowHeights[targetRow] * scale : DEFAULT_ROW_HEIGHT * scale;
                  if (y >= currentTop && y < currentTop + h) break;
                  currentTop += h;
                  targetRow++;
              }
              
              let currentLeft = 0;
              let targetCol = 0;
              while(targetCol < size.cols) {
                  const w = columnWidths[numToChar(targetCol)] ? columnWidths[numToChar(targetCol)] * scale : DEFAULT_COL_WIDTH * scale;
                  if (x >= currentLeft && x < currentLeft + w) break;
                  currentLeft += w;
                  targetCol++;
              }

              // Constrain fill to simple directions
              const { minRow, maxRow, minCol, maxCol } = selectionBounds;
              
              const dDown = targetRow - maxRow;
              const dUp = minRow - targetRow;
              const dRight = targetCol - maxCol;
              const dLeft = minCol - targetCol;
              
              const maxDist = Math.max(dDown, dUp, dRight, dLeft);
              
              let newRangeStart = getCellId(minCol, minRow);
              let newRangeEnd = getCellId(maxCol, maxRow);

              if (maxDist > 0) {
                  if (maxDist === dDown) {
                      newRangeEnd = getCellId(maxCol, targetRow);
                  } else if (maxDist === dUp) {
                      newRangeStart = getCellId(minCol, targetRow);
                  } else if (maxDist === dRight) {
                      newRangeEnd = getCellId(targetCol, maxRow);
                  } else if (maxDist === dLeft) {
                      newRangeStart = getCellId(targetCol, minRow);
                  }
              }
              
              const range = getRange(newRangeStart, newRangeEnd);
              if (range.length > 0) setFillRange(range);
          }
      };

      const handleWindowMouseUp = () => {
          if (isDraggingRef.current) {
              isDraggingRef.current = false;
          }
          if (isFillDraggingRef.current) {
              isFillDraggingRef.current = false;
              document.body.style.cursor = '';
              if (fillRange && selectionRange && onFill) {
                  if (fillRange.length > selectionRange.length) {
                      onFill(selectionRange, fillRange);
                  }
              }
              setFillRange(null);
          }
      };

      window.addEventListener('mousemove', handleWindowMouseMove);
      window.addEventListener('mouseup', handleWindowMouseUp);
      return () => {
          window.removeEventListener('mousemove', handleWindowMouseMove);
          window.removeEventListener('mouseup', handleWindowMouseUp);
      };
  }, [selectionBounds, size, rowHeights, columnWidths, headerColW, scale, fillRange, selectionRange, onFill]);

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
          anchorId = getCellId(maxCol, maxRow);
      } else {
          anchorId = getCellId(minCol, minRow);
      }
      dragSelectionRef.current = { anchorId };
  };

  useEffect(() => {
      const handleTouchMove = (e: TouchEvent) => {
          if (!dragSelectionRef.current) return;
          e.preventDefault(); 
          
          const touch = e.touches[0];
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

  const handleAutoFitColumn = useCallback((col: number) => {
      if(onAutoFit) onAutoFit(col);
  }, [onAutoFit]);

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

  // Keyboard Navigation Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
        
        if (e.key === 'Delete' || e.key === 'Backspace') {
             if (selectionRange && selectionRange.length > 0) {
                 e.preventDefault();
                 selectionRange.forEach(id => {
                     if (onCellChange) onCellChange(id, ''); 
                 });
             } else if (activeCell) {
                 e.preventDefault();
                 if (onCellChange) onCellChange(activeCell, '');
             }
        }
        
        if (e.key === ' ' && activeCell) {
             const cell = cells[activeCell];
             if (cell && cell.isCheckbox) {
                 e.preventDefault(); 
                 const currentVal = String(cell.value).toUpperCase() === 'TRUE';
                 if (onCellChange) onCellChange(activeCell, currentVal ? 'FALSE' : 'TRUE');
             }
        }

        // --- NEW: Arrow Navigation ---
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
             e.preventDefault();
             // Map key to direction
             const direction = e.key === 'ArrowUp' ? 'up' : 
                               e.key === 'ArrowDown' ? 'down' :
                               e.key === 'ArrowLeft' ? 'left' : 'right';
             onNavigate(direction, e.shiftKey);
        }
        
        // Tab / Enter
        if (e.key === 'Tab') {
            e.preventDefault();
            onNavigate(e.shiftKey ? 'left' : 'right', false);
        }
        
        if (e.key === 'Enter') {
             e.preventDefault();
             onNavigate(e.shiftKey ? 'up' : 'down', false);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeCell, selectionRange, cells, onCellChange, onNavigate]);

  const getColW = useCallback((i: number) => (columnWidths[numToChar(i)] || DEFAULT_COL_WIDTH) * scale, [columnWidths, scale]);
  const getRowH = useCallback((i: number) => (rowHeights[i] || DEFAULT_ROW_HEIGHT) * scale, [rowHeights, scale]);
  const headerRowH = HEADER_ROW_HEIGHT * scale;
  const headerFontSize = Math.max(7, 12 * scale);
  const arrowSize = Math.max(4, 8 * scale);
  const arrowOffset = Math.max(2, 4 * scale);
  const velocityThreshold = isMobile ? 0.5 : 2;
  const isScrollingFast = Math.abs(scrollState.velocityFactor) > velocityThreshold;

  const fillBounds = useMemo(() => {
      if (!fillRange || fillRange.length === 0) return null;
      const start = parseCellId(fillRange[0]);
      const end = parseCellId(fillRange[fillRange.length - 1]);
      if (!start || !end) return null;
      return {
          minRow: Math.min(start.row, end.row),
          maxRow: Math.max(start.row, end.row),
          minCol: Math.min(start.col, end.col),
          maxCol: Math.max(start.col, end.col)
      };
  }, [fillRange]);

  return (
    <div 
        ref={containerRef}
        className="flex-1 overflow-auto bg-slate-50 relative w-full h-full no-scrollbar touch-pan-x touch-pan-y outline-none transform-gpu"
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
                            onAutoFit={() => handleAutoFitColumn(col)}
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
                    selectionSet={selectionSet}
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
                    activeFilterId={activeFilterId}
                    onToggleFilter={setActiveFilterId}
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

                    // Position micro-adjustments to align perfectly with grid lines
                    const offset = 1;

                    // Determine animation behavior
                    const isDragging = isDraggingRef.current;

                    return (
                        <motion.div 
                            className="absolute pointer-events-none z-30 border-[2px] border-primary-600 shadow-glow mix-blend-multiply rounded-[2px]"
                            initial={false}
                            animate={{
                                top: top - offset,
                                left: left + headerColW - offset,
                                width: width + offset,
                                height: height + offset
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
                                className="absolute -top-2.5 -left-2.5 w-5 h-5 bg-white border-2 border-primary-600 rounded-full shadow-md z-50 flex items-center justify-center pointer-events-auto md:hidden touch-none"
                                onTouchStart={(e) => onHandleTouchStart(e, 'topLeft')}
                            />
                            <div 
                                className="absolute -bottom-2.5 -right-2.5 w-5 h-5 bg-white border-2 border-primary-600 rounded-full shadow-md z-50 flex items-center justify-center pointer-events-auto md:hidden touch-none"
                                onTouchStart={(e) => onHandleTouchStart(e, 'bottomRight')}
                            />

                            {/* Fill Handle (Desktop) */}
                            <div 
                                className="absolute -bottom-[4px] -right-[4px] bg-primary-600 border border-white cursor-crosshair rounded-[2px] shadow-sm z-50 pointer-events-auto hover:scale-125 transition-transform hidden md:block"
                                style={{ width: Math.max(6, 9 * scale), height: Math.max(6, 9 * scale) }}
                                onMouseDown={handleFillHandleMouseDown}
                            />
                        </motion.div>
                    );
                })()
            )}

            {/* GHOST FILL OVERLAY */}
            {fillBounds && isFillDraggingRef.current && (
                (() => {
                    const { minRow, maxRow, minCol, maxCol } = fillBounds;
                    const top = getRowTop(minRow);
                    const left = getColLeft(minCol);
                    
                    let height = 0;
                    for(let r = minRow; r <= maxRow; r++) height += getRowHeight(r);
                    
                    let width = 0;
                    for(let c = minCol; c <= maxCol; c++) width += getColWidth(c);

                    return (
                        <div 
                            className="absolute pointer-events-none z-20 border-[2px] border-dashed border-slate-400 bg-black/5"
                            style={{
                                top,
                                left: left + headerColW,
                                width,
                                height
                            }}
                        />
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
                            isFilterActive={activeFilterId === id}
                            onToggleFilter={setActiveFilterId}
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
