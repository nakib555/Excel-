import React, { memo, Suspense, lazy } from 'react';
import { getCellId, parseCellId, cn } from '../utils';
import { NavigationDirection } from './Cell';

// Lazy load Cell to support granular loading during rapid expansion/scrolling
const Cell = lazy(() => import('./Cell'));

interface GridRowProps {
  rowIdx: number;
  visibleCols: number[];
  height: number;
  spacerLeft: number;
  spacerRight: number;
  getColW: (i: number) => number;
  cells: any;
  activeCell: string | null;
  selectionRange: string[] | null;
  scale: number;
  onCellClick: (id: string, isShift: boolean) => void;
  handleMouseDown: (id: string, isShift: boolean) => void;
  handleMouseEnter: (id: string) => void;
  onCellDoubleClick: (id: string) => void;
  onCellChange: (id: string, value: string) => void;
  onNavigate: (direction: NavigationDirection, isShift: boolean) => void;
  startResize: (e: React.MouseEvent, type: 'col' | 'row', index: number, size: number) => void;
  headerColW: number;
  isGhost: boolean;
  bgPatternStyle: any;
}

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
}: GridRowProps) => {
    const isActiveRow = activeCell && parseInt(activeCell.replace(/[A-Z]+/, '')) === rowIdx + 1;
    // Calculate dynamic font size based on zoom, capped for readability
    const headerFontSize = Math.max(7, 12 * scale);
    
    return (
        <div className="flex" style={{ width: 'max-content', height }}>
            {/* Row Header */}
            <div 
                className={cn(
                    "sticky left-0 z-10 flex items-center justify-center border-r border-b border-slate-300 bg-[#f8f9fa] font-semibold text-slate-700 select-none flex-shrink-0 hover:bg-slate-200 transition-colors overflow-hidden", 
                    isActiveRow && "bg-emerald-100 text-emerald-800"
                )}
                style={{ width: headerColW, height, fontSize: `${headerFontSize}px` }}
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
                const width = getColW(col);
                
                return (
                    <Suspense 
                        key={id} 
                        fallback={
                            <div 
                                className="relative box-border border-r border-b border-slate-200 bg-white skeleton-shine"
                                style={{ width, height, minWidth: width, minHeight: height }}
                            />
                        }
                    >
                        <Cell 
                            id={id} 
                            data={data}
                            isSelected={isSelected}
                            isActive={isSelected} 
                            isInRange={isInRange}
                            width={width}
                            height={height}
                            scale={scale}
                            isGhost={isGhost}
                            onMouseDown={handleMouseDown}
                            onMouseEnter={handleMouseEnter}
                            onDoubleClick={onCellDoubleClick}
                            onChange={onCellChange}
                            onNavigate={(dir) => onNavigate(dir, false)}
                        />
                    </Suspense>
                );
            })}

            {/* Spacer Right with Pattern */}
            <div style={{ width: spacerRight, height: '100%', flexShrink: 0, ...bgPatternStyle }} />
        </div>
    );
}, (prev, next) => {
    // 1. High-level layout checks (Fastest)
    if (prev.scale !== next.scale) return false;
    if (prev.height !== next.height) return false;
    if (prev.isGhost !== next.isGhost) return false;
    if (prev.visibleCols !== next.visibleCols) return false;
    if (prev.headerColW !== next.headerColW) return false;
    if (prev.spacerLeft !== next.spacerLeft) return false;
    if (prev.spacerRight !== next.spacerRight) return false;

    // 2. Data Check (Medium)
    if (prev.cells !== next.cells) return false;

    // 3. Selection / Interaction Check (Crucial for scroll/selection perf)
    if (prev.activeCell !== next.activeCell || prev.selectionRange !== next.selectionRange) {
        
        // Helper to check if a row index is involved in a cell ID or range
        const isRowInvolved = (id: string | null) => {
            if (!id) return false;
            const p = parseCellId(id);
            return p ? p.row === prev.rowIdx : false;
        };

        const isRangeInvolved = (range: string[] | null) => {
            if (!range) return false;
            return range.some(id => parseCellId(id)?.row === prev.rowIdx);
        };

        const prevActiveInRow = isRowInvolved(prev.activeCell);
        const nextActiveInRow = isRowInvolved(next.activeCell);
        
        if (prevActiveInRow !== nextActiveInRow) return false;
        if (prevActiveInRow && nextActiveInRow && prev.activeCell !== next.activeCell) return false;

        const prevRangeInRow = isRangeInvolved(prev.selectionRange);
        const nextRangeInRow = isRangeInvolved(next.selectionRange);

        if (prevRangeInRow !== nextRangeInRow) return false;
        if ((prevRangeInRow || nextRangeInRow) && prev.selectionRange !== next.selectionRange) return false;

        return true;
    }

    return true; 
});

export default GridRow;