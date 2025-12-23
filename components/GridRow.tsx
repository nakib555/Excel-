
import React, { memo } from 'react';
import { getCellId, parseCellId, cn, formatCellValue } from '../utils';
import { NavigationDirection } from './Cell';
import { CellStyle } from '../types';
import Cell from './Cell'; 

interface GridRowProps {
  rowIdx: number;
  visibleCols: number[];
  height: number;
  spacerLeft: number;
  spacerRight: number;
  getColW: (i: number) => number;
  cells: any;
  styles: Record<string, CellStyle>;
  activeCell: string | null;
  selectionBounds: { minRow: number, maxRow: number, minCol: number, maxCol: number } | null;
  selectionSet: Set<string>;
  scale: number;
  mergedCellsSet: Set<string>; 
  onCellClick: (id: string, isShift: boolean) => void;
  handleMouseDown: (id: string, isShift: boolean) => void;
  handleMouseEnter: (id: string) => void;
  onCellDoubleClick: (id: string) => void;
  onCellChange: (id: string, value: string) => void;
  onNavigate: (direction: NavigationDirection, isShift: boolean) => void;
  startResize: (e: React.MouseEvent, type: 'col' | 'row', index: number, size: number) => void;
  onAutoFitRow?: (rowIdx: number) => void;
  headerColW: number;
  isGhost: boolean;
  isScrollingFast: boolean;
  bgPatternStyle: React.CSSProperties;
  activeFilterId?: string | null;
  onToggleFilter?: (id: string | null) => void;
}

// Lightweight component for Empty/Hidden Cells
const EmptyCell = memo(({ width, height, id, onMouseDown, onMouseEnter, onDoubleClick, isHidden }: any) => (
    <div
      className={cn(
          "border-r border-b border-slate-200 box-border flex-shrink-0 bg-white select-none transition-colors duration-200",
          isHidden && "border-none bg-transparent" // If hidden by merge
      )}
      style={{
          width, 
          height, 
          minWidth: width, 
          minHeight: height,
          visibility: isHidden ? 'hidden' : 'visible'
      }}
      data-cell-id={id}
      onMouseDown={(e) => !isHidden && onMouseDown(id, e.shiftKey)}
      onMouseEnter={() => !isHidden && onMouseEnter(id)}
      onDoubleClick={() => !isHidden && onDoubleClick(id)}
    />
), (prev, next) => prev.width === next.width && prev.height === next.height && prev.isHidden === next.isHidden);

const GridRow = memo(({ 
    rowIdx, 
    visibleCols, 
    height, 
    spacerLeft, 
    spacerRight, 
    getColW, 
    cells, 
    styles,
    activeCell, 
    selectionBounds, 
    selectionSet,
    scale, 
    mergedCellsSet,
    onCellClick, 
    handleMouseDown, 
    handleMouseEnter, 
    onCellDoubleClick, 
    onCellChange, 
    onNavigate, 
    startResize,
    onAutoFitRow,
    headerColW,
    isGhost,
    bgPatternStyle,
    activeFilterId,
    onToggleFilter
}: GridRowProps) => {
    const isActiveRow = activeCell && parseInt(activeCell.replace(/[A-Z]+/, '')) === rowIdx + 1;
    const headerFontSize = Math.max(7, 12 * scale);
    
    // Check if any cell in this row *could* be selected based on bounds to optimize rendering
    // BUT for disjoint selection (formulas), bounds might be huge or irrelevant if we pass arbitrary set.
    // However, checking Set existence for every cell is fast.
    
    return (
        <div 
            className="flex" 
            style={{ 
                width: 'max-content', 
                height,
                contain: 'layout style'
            }}
        >
            {/* Row Header */}
            <div 
                className={cn(
                    "sticky left-0 z-10 flex items-center justify-center border-r border-b border-slate-300 bg-[#f8f9fa] font-semibold text-slate-700 select-none flex-shrink-0 hover:bg-slate-200 transition-colors duration-200 overflow-hidden", 
                    isActiveRow && "bg-emerald-100 text-emerald-800"
                )}
                style={{ width: headerColW, height, fontSize: `${headerFontSize}px` }}
                onClick={() => onCellClick(getCellId(0, rowIdx), false)}
            >
                {Math.floor(rowIdx + 1)}
                <div 
                    className="absolute bottom-0 left-0 right-0 h-1 cursor-row-resize hover:bg-emerald-500 z-10"
                    onMouseDown={(e) => startResize(e, 'row', rowIdx, height)} 
                    onDoubleClick={(e) => {
                        e.stopPropagation();
                        if (onAutoFitRow) onAutoFitRow(rowIdx);
                    }}
                />
            </div>

            {/* Spacer Left */}
            <div style={{ width: spacerLeft, height: '100%', flexShrink: 0, ...bgPatternStyle }} />
            
            {/* Cells Loop */}
            {visibleCols.map((col: number) => {
                const id = getCellId(col, rowIdx);
                
                // Merge Check
                if (mergedCellsSet.has(id)) {
                    // Render hidden placeholder to maintain flex layout
                    return <EmptyCell key={id} width={getColW(col)} height={height} isHidden={true} id={id} />;
                }

                const data = cells[id];
                const isSelected = activeCell === id;
                const isInRange = selectionSet.has(id);

                const width = getColW(col);

                if (data || isSelected || isInRange) {
                    const safeData = data || { id, raw: '', value: '' };
                    const cellStyle = (safeData.styleId && styles[safeData.styleId]) ? styles[safeData.styleId] : {};

                    return (
                        <Cell 
                            key={id}
                            id={id} 
                            data={safeData}
                            style={cellStyle}
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
                            isFilterActive={activeFilterId === id}
                            onToggleFilter={onToggleFilter}
                        />
                    );
                }

                return (
                    <EmptyCell 
                        key={id}
                        width={width}
                        height={height}
                        id={id}
                        onMouseDown={handleMouseDown}
                        onMouseEnter={handleMouseEnter}
                        onDoubleClick={onCellDoubleClick}
                        bgPatternStyle={bgPatternStyle}
                    />
                );
            })}

            {/* Spacer Right */}
            <div style={{ width: spacerRight, height: '100%', flexShrink: 0, ...bgPatternStyle }} />
        </div>
    );
}, (prev, next) => {
    if (prev.scale !== next.scale) return false;
    if (prev.height !== next.height) return false;
    if (prev.isGhost !== next.isGhost) return false;
    if (prev.visibleCols !== next.visibleCols) return false;
    if (prev.headerColW !== next.headerColW) return false;
    if (prev.spacerLeft !== next.spacerLeft) return false;
    if (prev.spacerRight !== next.spacerRight) return false;
    if (prev.cells !== next.cells) return false;
    if (prev.styles !== next.styles) return false;
    if (prev.mergedCellsSet !== next.mergedCellsSet) return false;
    
    if (prev.getColW !== next.getColW) return false;
    
    const isRowInvolvedActive = (id: string | null, rowIdx: number) => {
        if (!id) return false;
        const p = parseCellId(id);
        return p ? p.row === rowIdx : false;
    };
    
    const prevActive = isRowInvolvedActive(prev.activeCell, prev.rowIdx);
    const nextActive = isRowInvolvedActive(next.activeCell, next.rowIdx);
    
    if (prevActive !== nextActive) return false;
    if (prevActive && nextActive && prev.activeCell !== next.activeCell) return false;

    // Selection Logic Optimization
    // Use bounds to quickly check if row was/is involved in selection change
    // Even if using selectionSet, if the bounds haven't changed, the set likely hasn't changed significantly enough to affect *this specific row* if it was outside bounds before.
    // However, if we go from disjoint to disjoint, bounds might be same but internal cells differ.
    // But since selectionSet is a new Set every time, we can't deep compare.
    // We rely on selectionBounds change OR if bounds cover this row.
    // If bounds cover this row, we MUST re-render because internal set might have changed.
    
    const b1 = prev.selectionBounds;
    const b2 = next.selectionBounds;
    
    if (b1 === b2) {
        // Bounds identical. Check filter.
    } else if (!b1 || !b2) {
        return false;
    } else {
        const row = prev.rowIdx;
        const wasIn = row >= b1.minRow && row <= b1.maxRow;
        const isIn = row >= b2.minRow && row <= b2.maxRow;
        
        // If row is inside EITHER the old or new selection bounds, it must re-render to check selectionSet.has(id)
        if (wasIn || isIn) return false;
    }

    // Check filter ID changes for this row only (if current or next filter active id is in this row)
    if (prev.activeFilterId !== next.activeFilterId) {
        return false; 
    }

    return true; 
});

export default GridRow;
