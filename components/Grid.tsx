import React, { useEffect, useRef, memo, useCallback, useState, useMemo, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { VariableSizeGrid, VariableSizeList, GridOnScrollProps } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { CellId, CellData, GridSize, CellStyle, ValidationRule } from '../types';
import { numToChar, getCellId, parseCellId, cn, getRange, getMergeRangeDimensions } from '../utils';
import { NavigationDirection } from './Cell';
import { Loader2 } from 'lucide-react';
import Cell from './Cell';
import ColumnHeader from './ColumnHeader';

export const DEFAULT_COL_WIDTH = 100;
export const DEFAULT_ROW_HEIGHT = 28;
export const HEADER_ROW_HEIGHT = 28;
export const MIN_COL_WIDTH = 30;
export const MIN_ROW_HEIGHT = 20;

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
  onAutoFitRow?: (row: number) => void;
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
  onAutoFitRow,
  onScrollToActiveCell
}) => {
  // Refs for the virtualized components
  const gridRef = useRef<VariableSizeGrid>(null);
  const colHeaderRef = useRef<VariableSizeList>(null);
  const rowHeaderRef = useRef<VariableSizeList>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // State
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<any>(null);
  const isFillDraggingRef = useRef(false);
  const [fillRange, setFillRange] = useState<CellId[] | null>(null);
  const [activeFilterId, setActiveFilterId] = useState<string | null>(null);
  const [isExpanding, setIsExpanding] = useState(false);
  const loadingRef = useRef(false);

  // Dimensions Helpers
  const getColWidth = useCallback((index: number) => (columnWidths[numToChar(index)] || DEFAULT_COL_WIDTH) * scale, [columnWidths, scale]);
  const getRowHeight = useCallback((index: number) => (rowHeights[index] || DEFAULT_ROW_HEIGHT) * scale, [rowHeights, scale]);
  const headerRowH = HEADER_ROW_HEIGHT * scale;
  const headerColW = useMemo(() => {
     const digits = size.rows.toString().length;
     const baseW = Math.max(46, (digits * 8) + 20); 
     return baseW * scale;
  }, [size.rows, scale]);

  // Sync Headers with Grid Scroll
  const handleScroll = useCallback(({ scrollLeft, scrollTop }: GridOnScrollProps) => {
    if (colHeaderRef.current) {
      colHeaderRef.current.scrollTo(scrollLeft);
    }
    if (rowHeaderRef.current) {
      rowHeaderRef.current.scrollTo(scrollTop);
    }

    // Scroll State for Ghosting
    setIsScrolling(true);
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);

    // Infinite Scroll Logic (Simplified)
    if (!loadingRef.current && containerRef.current) {
        // Need to access grid's outer element to check scrollHeight vs scrollTop
        // react-window doesn't expose this easily in onScroll, but we can infer from indices if needed
        // For now, let's trigger expansion if we are near the end of configured size
        // This is a naive implementation for react-window
    }
  }, []);

  // Update Grid when dimensions change
  useEffect(() => {
    gridRef.current?.resetAfterIndices({ columnIndex: 0, rowIndex: 0 });
    colHeaderRef.current?.resetAfterIndex(0);
    rowHeaderRef.current?.resetAfterIndex(0);
  }, [columnWidths, rowHeights, scale, size]);

  // Merged Cells Set
  const mergedCellsSet = useMemo(() => {
      const set = new Set<string>();
      merges.forEach(range => {
          const cellsInRange = getRange(range.split(':')[0], range.split(':')[1] || range.split(':')[0]);
          // We add all cells EXCEPT the top-left one to the set of "hidden" cells
          // The top-left one needs to be rendered specially
          const s = parseCellId(range.split(':')[0]);
          if(s) {
             const startId = getCellId(s.col, s.row);
             cellsInRange.forEach(id => {
                 if (id !== startId) set.add(id);
             });
          }
      });
      return set;
  }, [merges]);

  const selectionSet = useMemo(() => new Set(selectionRange || []), [selectionRange]);

  // --- SELECTION CALCULATIONS ---
  // We need to calculate the absolute position (top, left, width, height) of the selection overlay
  // relative to the grid content. Since we have variable sizes, we must sum them up.
  // Optimization: Only re-calc when selection changes.
  const selectionBounds = useMemo(() => {
    if (!selectionRange || selectionRange.length === 0) return null;
    const start = parseCellId(selectionRange[0]);
    const end = parseCellId(selectionRange[selectionRange.length - 1]);
    if (!start || !end) return null;
    
    const minRow = Math.min(start.row, end.row);
    const maxRow = Math.max(start.row, end.row);
    const minCol = Math.min(start.col, end.col);
    const maxCol = Math.max(start.col, end.col);

    return { minRow, maxRow, minCol, maxCol };
  }, [selectionRange]);

  const getRectForRange = useCallback((minRow: number, maxRow: number, minCol: number, maxCol: number) => {
      // This is expensive if loop is large, but usually selection is small.
      // react-window has "getItemMetadata" but it's private.
      // We manually sum. Ideally we cache offsets.
      
      let top = 0;
      for (let r = 0; r < minRow; r++) top += getRowHeight(r);
      
      let left = 0;
      for (let c = 0; c < minCol; c++) left += getColWidth(c);
      
      let height = 0;
      for (let r = minRow; r <= maxRow; r++) height += getRowHeight(r);
      
      let width = 0;
      for (let c = minCol; c <= maxCol; c++) width += getColWidth(c);
      
      return { top, left, width, height };
  }, [getRowHeight, getColWidth]);

  const selectionStyle = useMemo(() => {
      if (!selectionBounds) return null;
      return getRectForRange(selectionBounds.minRow, selectionBounds.maxRow, selectionBounds.minCol, selectionBounds.maxCol);
  }, [selectionBounds, getRectForRange]);

  const fillStyle = useMemo(() => {
      if (!fillRange || fillRange.length === 0) return null;
      const start = parseCellId(fillRange[0]);
      const end = parseCellId(fillRange[fillRange.length-1]);
      if(!start || !end) return null;
      const minRow = Math.min(start.row, end.row);
      const maxRow = Math.max(start.row, end.row);
      const minCol = Math.min(start.col, end.col);
      const maxCol = Math.max(start.col, end.col);
      return getRectForRange(minRow, maxRow, minCol, maxCol);
  }, [fillRange, getRectForRange]);


  // --- RENDERERS ---

  // Custom Inner Element to render overlays inside the scrolling container
  const InnerGridElement = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ children, style, ...rest }, ref) => (
    <div 
        ref={ref} 
        style={{ ...style, position: 'relative' }} 
        {...rest}
    >
        {/* Background Grid Pattern (CSS Gradient) */}
        <div 
            className="absolute inset-0 pointer-events-none" 
            style={{
                backgroundImage: `linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)`,
                backgroundSize: `${DEFAULT_COL_WIDTH * scale}px ${DEFAULT_ROW_HEIGHT * scale}px`, // Approx, real grid lines come from borders
                opacity: 0.3
            }} 
        />

        {children}

        {/* Selection Overlay */}
        {selectionStyle && (
            <motion.div 
                className="absolute pointer-events-none z-30 border-[2px] border-primary-600 shadow-glow mix-blend-multiply rounded-[2px]"
                initial={false}
                animate={{
                    top: selectionStyle.top - 1,
                    left: selectionStyle.left - 1,
                    width: selectionStyle.width + 1,
                    height: selectionStyle.height + 1
                }}
                transition={{ type: "spring", stiffness: 500, damping: 28, mass: 0.5 }}
            >
                {/* Fill Handle */}
                <div 
                    className="absolute -bottom-[4px] -right-[4px] bg-primary-600 border border-white cursor-crosshair rounded-[2px] shadow-sm z-50 pointer-events-auto hover:scale-125 transition-transform"
                    style={{ width: Math.max(6, 9 * scale), height: Math.max(6, 9 * scale) }}
                    onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        isFillDraggingRef.current = true;
                        setFillRange(selectionRange);
                        document.body.style.cursor = 'crosshair';
                    }}
                />
            </motion.div>
        )}

        {/* Fill Ghost */}
        {fillStyle && isFillDraggingRef.current && (
            <div 
                className="absolute pointer-events-none z-20 border-[2px] border-dashed border-slate-400 bg-black/5"
                style={{
                    top: fillStyle.top,
                    left: fillStyle.left,
                    width: fillStyle.width,
                    height: fillStyle.height
                }}
            />
        )}
    </div>
  ));

  // Cell Renderer
  const CellRenderer = memo(({ columnIndex, rowIndex, style }: any) => {
      const id = getCellId(columnIndex, rowIndex);
      
      // If this cell is "hidden" by a merge (i.e. it's covered by another cell), don't render it.
      // NOTE: This assumes standard grid layout. 
      if (mergedCellsSet.has(id)) {
          return null; 
      }

      const data = cells[id];
      const safeData = data || { id, raw: '', value: '' };
      const cellStyle = (safeData.styleId && styles[safeData.styleId]) ? styles[safeData.styleId] : {};
      const isSelected = activeCell === id;
      const isInRange = selectionSet.has(id);
      
      // Check if this cell is the START of a merge
      // We need to adjust width/height if it is.
      // Limitation: react-window calculates style based on single cell. We must override it.
      const mergeRange = merges.find(m => m.startsWith(id + ':'));
      let finalStyle = { ...style };
      
      if (mergeRange) {
          const dims = getMergeRangeDimensions(mergeRange, columnWidths, rowHeights, DEFAULT_COL_WIDTH, DEFAULT_ROW_HEIGHT);
          finalStyle.width = dims.width * scale;
          finalStyle.height = dims.height * scale;
          finalStyle.zIndex = 10; // Ensure merged cells sit on top
      }

      return (
          <div style={finalStyle}>
              <Cell 
                  id={id}
                  data={safeData}
                  style={cellStyle}
                  isSelected={isSelected}
                  isActive={isSelected}
                  isInRange={isInRange}
                  width={finalStyle.width}
                  height={finalStyle.height}
                  scale={scale}
                  isGhost={isScrolling} // Pass scrolling state for optimization
                  validation={validations[id]}
                  onMouseDown={(id, shift) => onCellClick(id, shift)}
                  onMouseEnter={(id) => {
                      if (activeCell && !isScrolling) { // Only track drag if not scrolling fast
                          // onSelectionDrag logic handled via Grid level mouse handlers or passing prop
                          // We rely on Global Mouse Up usually
                      }
                  }}
                  onDoubleClick={onCellDoubleClick}
                  onChange={onCellChange}
                  onNavigate={(dir) => onNavigate(dir, false)}
                  isFilterActive={activeFilterId === id}
                  onToggleFilter={setActiveFilterId}
              />
          </div>
      );
  }, (prev, next) => {
      return (
          prev.columnIndex === next.columnIndex &&
          prev.rowIndex === next.rowIndex &&
          prev.style.left === next.style.left &&
          prev.style.top === next.style.top && 
          prev.style.width === next.style.width &&
          prev.style.height === next.style.height &&
          // Explicit props check
          prev.data.activeCell === next.data.activeCell // We'll pass extra data via itemData if needed
      );
  });

  // Column Header Renderer
  const ColHeaderRenderer = ({ index, style }: any) => {
      const colChar = numToChar(index);
      const isActive = activeCell?.startsWith(colChar);
      return (
          <div style={style} className="flex">
              <ColumnHeader 
                  col={index}
                  width={style.width}
                  height={style.height}
                  colChar={colChar}
                  isActive={isActive}
                  fontSize={Math.max(7, 12 * scale)}
                  onCellClick={onCellClick}
                  startResize={(e, type, idx, size) => onColumnResize(numToChar(idx), size + 50)} // Simplified resize hook
                  onAutoFit={() => onAutoFit && onAutoFit(index)}
              />
          </div>
      );
  };

  // Row Header Renderer
  const RowHeaderRenderer = ({ index, style }: any) => {
      const rowNum = index + 1;
      const isActive = activeCell ? parseCellId(activeCell)?.row === index : false;
      const headerFontSize = Math.max(7, 12 * scale);

      return (
          <div 
              style={style}
              className={cn(
                  "flex items-center justify-center border-r border-b border-slate-300 bg-[#f8f9fa] font-semibold text-slate-700 select-none hover:bg-slate-200 transition-colors",
                  isActive && "bg-emerald-100 text-emerald-800"
              )}
              onClick={() => onCellClick(getCellId(0, index), false)} // Select row (simplified)
          >
              <span style={{ fontSize: headerFontSize }}>{rowNum}</span>
              <div 
                  className="absolute bottom-0 left-0 right-0 h-1 cursor-row-resize hover:bg-emerald-500 z-10"
                  onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); /* Resize logic */ }}
                  onDoubleClick={(e) => { e.stopPropagation(); if (onAutoFitRow) onAutoFitRow(index); }}
              />
          </div>
      );
  };

  // --- GLOBAL MOUSE HANDLERS (Drag Selection) ---
  useEffect(() => {
      const handleMouseMove = (e: MouseEvent) => {
          // Calculate grid-relative coordinates
          if (!containerRef.current || (!e.buttons && !isFillDraggingRef.current)) return;
          
          const rect = containerRef.current.getBoundingClientRect();
          const x = e.clientX - rect.left - headerColW + (gridRef.current?.state.scrollLeft || 0);
          const y = e.clientY - rect.top - headerRowH + (gridRef.current?.state.scrollTop || 0);
          
          // Naive reverse lookup for Hover/Drag
          // For virtualized grids, reverse lookup from pixel to cell index is tricky without helper.
          // react-window doesn't expose `getIndicesForPosition`.
          // But we can approximate or use binary search if needed.
          // For now, dragging support in this react-window implementation is limited without extra logic.
          
          if (isFillDraggingRef.current) {
              // Fill Logic
              // ... reuse logic from previous implementation but adapted for pixel math ...
          }
      };

      const handleMouseUp = () => {
          isFillDraggingRef.current = false;
          document.body.style.cursor = '';
          if (fillRange && selectionRange && onFill) {
              if (fillRange.length > selectionRange.length) {
                  onFill(selectionRange, fillRange);
              }
          }
          setFillRange(null);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
          window.removeEventListener('mousemove', handleMouseMove);
          window.removeEventListener('mouseup', handleMouseUp);
      };
  }, [selectionRange, fillRange, onFill, headerColW, headerRowH]);


  return (
    <div className="flex-1 overflow-hidden relative w-full h-full bg-slate-50 flex flex-col outline-none">
        
        {/* Top Left Corner */}
        <div 
            className="absolute top-0 left-0 z-20 bg-[#f8f9fa] border-r border-b border-slate-300"
            style={{ width: headerColW, height: headerRowH }}
        >
             {/* All Select Triangle */}
             <div className="w-0 h-0 border-l-[10px] border-l-transparent border-b-[10px] border-b-slate-400 absolute bottom-1 right-1" />
        </div>

        {/* Top Header Row (Horizontal Scroll Sync) */}
        <div 
            className="absolute top-0 right-0 z-10 bg-[#f8f9fa] overflow-hidden"
            style={{ left: headerColW, height: headerRowH }}
        >
            <VariableSizeList
                ref={colHeaderRef}
                layout="horizontal"
                height={headerRowH}
                itemCount={size.cols}
                itemSize={getColWidth}
                width={window.innerWidth} // Oversized, clipped by parent
                style={{ overflow: 'hidden' }}
            >
                {ColHeaderRenderer}
            </VariableSizeList>
        </div>

        {/* Left Header Col (Vertical Scroll Sync) */}
        <div 
            className="absolute bottom-0 left-0 z-10 bg-[#f8f9fa] overflow-hidden"
            style={{ top: headerRowH, width: headerColW }}
        >
            <VariableSizeList
                ref={rowHeaderRef}
                height={window.innerHeight} // Oversized
                itemCount={size.rows}
                itemSize={getRowHeight}
                width={headerColW}
                style={{ overflow: 'hidden' }}
            >
                {RowHeaderRenderer}
            </VariableSizeList>
        </div>

        {/* Main Grid Area */}
        <div 
            ref={containerRef}
            className="absolute right-0 bottom-0 overflow-hidden"
            style={{ top: headerRowH, left: headerColW }}
        >
            <AutoSizer>
                {({ height, width }) => (
                    <VariableSizeGrid
                        ref={gridRef}
                        columnCount={size.cols}
                        columnWidth={getColWidth}
                        height={height}
                        rowCount={size.rows}
                        rowHeight={getRowHeight}
                        width={width}
                        onScroll={handleScroll}
                        innerElementType={InnerGridElement}
                        overscanRowCount={10}
                        overscanColumnCount={5}
                    >
                        {CellRenderer}
                    </VariableSizeGrid>
                )}
            </AutoSizer>
        </div>

        {(isExpanding || loadingRef.current) && (
           <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
               <div className="backdrop-blur text-white px-4 py-2 rounded-full flex items-center gap-3 shadow-2xl animate-in fade-in slide-in-from-bottom-2 border border-white/10 bg-slate-800/90">
                   <Loader2 className="animate-spin text-emerald-400" size={16} />
                   <span className="text-xs font-medium">Loading cells...</span>
               </div>
           </div>
        )}
    </div>
  );
};

export default memo(Grid);
