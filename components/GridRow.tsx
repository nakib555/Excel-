
import React, { memo } from 'react';
import { getCellId, parseCellId, cn, formatCellValue } from '../utils';
import { NavigationDirection } from './Cell';
import { CellStyle } from '../types';
import Cell from './Cell'; // Static import

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
  isScrollingFast: boolean;
  bgPatternStyle: React.CSSProperties;
}

// Lightweight component for Empty Cells (No React overhead for hooks/state)
const EmptyCell = memo(({ width, height, id, onMouseDown, onMouseEnter, onDoubleClick, bgPatternStyle }: any) => (
    <div
      className="border-r border-b border-slate-200 box-border flex-shrink-0 bg-white select-none"
      style={{
          width, 
          height, 
          minWidth: width, 
          minHeight: height,
      }}
      onMouseDown={(e) => onMouseDown(id, e.shiftKey)}
      onMouseEnter={() => onMouseEnter(id)}
      onDoubleClick={() => onDoubleClick(id)}
    />
), (prev, next) => prev.width === next.width && prev.height === next.height);

// High-Performance Cell for Fast Scrolling (Pure rendering, no interactive overhead)
// Now accepts onMouseDown for UX catch-ability
const FastCell = memo(({ width, height, data, style, onMouseDown }: any) => {
    const displayValue = formatCellValue(data.value, style);
    
    // Rotation logic for FastCell
    const rotation = style.textRotation || 0;
    const isVertical = style.verticalText;
    const hasRotation = rotation !== 0;
    const cssRotation = rotation ? -rotation : 0;
    const textAlign = style.align || 'left';

    return (
        <div
            className={cn(
                "border-r border-b border-slate-200 box-border flex-shrink-0 select-none px-[4px] flex items-center",
                (hasRotation || isVertical) ? "overflow-visible z-[5]" : "overflow-hidden"
            )}
            style={{
                width, 
                height,
                minWidth: width,
                minHeight: height,
                backgroundColor: style.bg || '#fff',
                color: style.color || '#0f172a',
                fontWeight: style.bold ? '600' : '400',
                fontStyle: style.italic ? 'italic' : 'normal',
                textDecoration: style.underline ? 'underline' : 'none',
                textAlign,
                fontSize: `${(style.fontSize || 13)}px`,
            }}
            onMouseDown={(e) => onMouseDown && onMouseDown(data.id, e.shiftKey)}
        >
             <span 
                className={cn("w-full block origin-left", !style.wrapText && !hasRotation && !isVertical && "truncate")}
                style={{
                    ...(isVertical ? { writingMode: 'vertical-rl', textOrientation: 'upright', width: '100%', display: 'flex', alignItems: textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start' } : {}),
                    ...(hasRotation ? { 
                        transform: `rotate(${cssRotation}deg)`, 
                        width: 'max-content',
                        transformOrigin: textAlign === 'center' ? 'center' : textAlign === 'right' ? 'center right' : 'center left',
                        display: 'inline-block'
                    } : {})
                }}
             >
                {displayValue}
             </span>
        </div>
    );
}, (prev, next) => prev.data === next.data && prev.style === next.style && prev.width === next.width && prev.height === next.height);

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
    isScrollingFast,
    bgPatternStyle
}: GridRowProps) => {
    const isActiveRow = activeCell && parseInt(activeCell.replace(/[A-Z]+/, '')) === rowIdx + 1;
    const headerFontSize = Math.max(7, 12 * scale);
    
    // Quick row-level check to avoid column loops if row not involved in selection
    const isRowSelected = selectionBounds 
        ? (rowIdx >= selectionBounds.minRow && rowIdx <= selectionBounds.maxRow)
        : false;

    return (
        <div 
            className="flex" 
            style={{ 
                width: 'max-content', 
                height,
                contain: 'layout style' // Performance: Isolate layout reflows
            }}
        >
            {/* Row Header */}
            <div 
                className={cn(
                    "sticky left-0 z-10 flex items-center justify-center border-r border-b border-slate-300 bg-[#f8f9fa] font-semibold text-slate-700 select-none flex-shrink-0 hover:bg-slate-200 transition-colors overflow-hidden", 
                    isActiveRow && "bg-emerald-100 text-emerald-800"
                )}
                style={{ width: headerColW, height, fontSize: `${headerFontSize}px` }}
                onClick={() => onCellClick(getCellId(0, rowIdx), false)}
            >
                {Math.floor(rowIdx + 1)}
                <div 
                    className="absolute bottom-0 left-0 right-0 h-1 cursor-row-resize hover:bg-emerald-500 z-10"
                    onMouseDown={(e) => startResize(e, 'row', rowIdx, height)} 
                />
            </div>

            {/* Spacer Left */}
            <div style={{ width: spacerLeft, height: '100%', flexShrink: 0, ...bgPatternStyle }} />
            
            {/* Cells Loop */}
            {visibleCols.map((col: number) => {
                const id = getCellId(col, rowIdx);
                const data = cells[id]; // Direct undefined check is faster than 'in' operator
                
                // PERFORMANCE CRITICAL: 
                // Determine if we need the Heavy Cell Component or the Lightweight Div
                const isSelected = activeCell === id;
                const isInRange = isRowSelected && selectionBounds 
                    ? (col >= selectionBounds.minCol && col <= selectionBounds.maxCol)
                    : false;

                const width = getColW(col);

                // If cell has data, style, is active, or selected -> Render full component
                if (data || isSelected || isInRange) {
                    const safeData = data || { id, raw: '', value: '' };
                    const cellStyle = (safeData.styleId && styles[safeData.styleId]) ? styles[safeData.styleId] : {};
                    
                    // MEMORY OPTIMIZATION:
                    // If scrolling fast and this cell is NOT active/selected, render a FastCell
                    if (isScrollingFast && !isSelected && !isInRange) {
                        return (
                             <FastCell 
                                key={id}
                                width={width}
                                height={height}
                                data={safeData}
                                style={cellStyle}
                                onMouseDown={handleMouseDown}
                             />
                        );
                    }

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
                        />
                    );
                }

                // Otherwise, render lightweight primitive
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
    // 1. High-level layout checks (Fastest)
    if (prev.scale !== next.scale) return false;
    if (prev.height !== next.height) return false;
    if (prev.isGhost !== next.isGhost) return false;
    if (prev.isScrollingFast !== next.isScrollingFast) return false; // Important check for fast scrolling
    if (prev.visibleCols !== next.visibleCols) return false;
    if (prev.headerColW !== next.headerColW) return false;
    if (prev.spacerLeft !== next.spacerLeft) return false;
    if (prev.spacerRight !== next.spacerRight) return false;
    if (prev.cells !== next.cells) return false; // Reference check on sparse object
    if (prev.styles !== next.styles) return false;
    
    // 2. Active Cell Check
    const isRowInvolvedActive = (id: string | null, rowIdx: number) => {
        if (!id) return false;
        const p = parseCellId(id);
        return p ? p.row === rowIdx : false;
    };
    
    const prevActive = isRowInvolvedActive(prev.activeCell, prev.rowIdx);
    const nextActive = isRowInvolvedActive(next.activeCell, next.rowIdx);
    
    if (prevActive !== nextActive) return false;
    if (prevActive && nextActive && prev.activeCell !== next.activeCell) return false;

    // 3. Selection Check
    const b1 = prev.selectionBounds;
    const b2 = next.selectionBounds;
    
    if (b1 === b2) return true;
    if (!b1 || !b2) return false;
    
    if (b1.minRow !== b2.minRow || b1.maxRow !== b2.maxRow || b1.minCol !== b2.minCol || b1.maxCol !== b2.maxCol) {
        const row = prev.rowIdx;
        const wasIn = row >= b1.minRow && row <= b1.maxRow;
        const isIn = row >= b2.minRow && row <= b2.maxRow;
        if (wasIn || isIn) return false;
    }

    return true; 
});

export default GridRow;
