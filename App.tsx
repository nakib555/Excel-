import React, { useState, useCallback, useMemo, lazy, Suspense, useRef, useEffect } from 'react';
import { CellId, CellData, CellStyle, GridSize, Sheet } from './types';
import { evaluateFormula, getRange, getNextCellId, parseCellId, getCellId, extractDependencies } from './utils';
import { NavigationDirection } from './components';

// Import Skeletons
import { 
  ToolbarSkeleton, 
  FormulaBarSkeleton, 
  GridSkeleton, 
  SheetTabsSkeleton, 
  StatusBarSkeleton 
} from './components/Skeletons';

// Lazy Imports for Main Components
const Toolbar = lazy(() => import('./components/Toolbar'));
const FormulaBar = lazy(() => import('./components/FormulaBar'));
const Grid = lazy(() => import('./components/Grid'));
const SheetTabs = lazy(() => import('./components/SheetTabs'));
const StatusBar = lazy(() => import('./components/StatusBar'));

// --- EXCEL ENGINE CONSTANTS ---
// Theoretical limits (Excel specs)
const MAX_ROWS = 1048576; 
const MAX_COLS = 16384;   

// Viewport Strategy
const INITIAL_ROWS = 100; // Start small, expand infinitely
const INITIAL_COLS = 26;  // A-Z
const EXPANSION_BATCH_ROWS = 100; // Add 100 rows when hitting edge
const EXPANSION_BATCH_COLS = 10;  // Add 10 cols when hitting edge

/**
 * 1️⃣ SPARSE DATA GENERATION
 * "Empty cells are conceptual, not real."
 * We do not loop to create empty objects. We only instantiate what exists.
 */
const generateSparseData = (): { cells: Record<CellId, CellData>, dependentsMap: Record<CellId, CellId[]> } => {
    const cells: Record<CellId, CellData> = {};
    const dependentsMap: Record<CellId, CellId[]> = {};
    
    // The "UsedRange" data
    const dataset = [
      { id: "A1", val: "Item", style: { bold: true, bg: '#f1f5f9', color: '#475569' } },
      { id: "B1", val: "Cost", style: { bold: true, bg: '#f1f5f9', color: '#475569', format: 'currency' as const } },
      { id: "C1", val: "Qty", style: { bold: true, bg: '#f1f5f9', color: '#475569' } },
      { id: "D1", val: "Total", style: { bold: true, bg: '#f1f5f9', color: '#475569', format: 'currency' as const } },
      { id: "A2", val: "MacBook Pro" }, { id: "B2", val: "2400", style: { format: 'currency' as const } }, { id: "C2", val: "2" }, { id: "D2", val: "=B2*C2", style: { format: 'currency' as const } },
      { id: "A3", val: "Monitor" }, { id: "B3", val: "500", style: { format: 'currency' as const } }, { id: "C3", val: "4" }, { id: "D3", val: "=B3*C3", style: { format: 'currency' as const } },
      { id: "A4", val: "Keyboard" }, { id: "B4", val: "150", style: { format: 'currency' as const } }, { id: "C4", val: "5" }, { id: "D4", val: "=B4*C4", style: { format: 'currency' as const } },
      { id: "C5", val: "Grand Total", style: { bold: true, align: 'right' as const } }, 
      { id: "D5", val: "=SUM(D2:D4)", style: { bold: true, color: '#059669', bg: '#ecfdf5', format: 'currency' as const } },
    ];

    // Hydrate only used cells
    dataset.forEach(s => {
      cells[s.id] = {
        id: s.id,
        raw: s.val,
        value: s.val, 
        style: (s.style as CellStyle) || {}
      };
    });
    
    // Initial Evaluation Loop (Dependency Graph Build)
    // Only iterate over keys that exist. O(UsedCells), not O(AllCells).
    Object.keys(cells).forEach(key => {
        const cell = cells[key];
        if (cell.raw.startsWith('=')) {
            cell.value = evaluateFormula(cell.raw, cells);
            const deps = extractDependencies(cell.raw);
            deps.forEach(dep => {
                if (!dependentsMap[dep]) dependentsMap[dep] = [];
                if (!dependentsMap[dep].includes(key)) dependentsMap[dep].push(key);
            });
        }
    });
    
    return { cells, dependentsMap };
};

const App: React.FC = () => {
  const [sheets, setSheets] = useState<Sheet[]>(() => {
    const { cells, dependentsMap } = generateSparseData();
    return [{
      id: 'sheet1',
      name: 'Budget 2024',
      cells,
      dependentsMap,
      activeCell: "A1",
      selectionRange: ["A1"],
      columnWidths: {},
      rowHeights: {}
    }];
  });
  
  const [activeSheetId, setActiveSheetId] = useState<string>('sheet1');
  const [gridSize, setGridSize] = useState<GridSize>({ rows: INITIAL_ROWS, cols: INITIAL_COLS });
  const [zoom, setZoom] = useState<number>(1);
  const clipboardRef = useRef<{ cells: Record<CellId, CellData>; baseRow: number; baseCol: number } | null>(null);
  
  const activeSheet = useMemo(() => 
    sheets.find(s => s.id === activeSheetId) || sheets[0], 
  [sheets, activeSheetId]);

  const cells = activeSheet.cells;
  const activeCell = activeSheet.activeCell;
  const selectionRange = activeSheet.selectionRange;
  const columnWidths = activeSheet.columnWidths;
  const rowHeights = activeSheet.rowHeights;

  const activeStyle: CellStyle = useMemo(() => {
    if (!activeCell || !cells[activeCell]) return {};
    return cells[activeCell].style;
  }, [activeCell, cells]);

  const selectionStats = useMemo(() => {
    if (!selectionRange || selectionRange.length <= 1) return null;
    let sum = 0, count = 0, numericCount = 0;
    selectionRange.forEach(id => {
        const cell = cells[id];
        if (cell && cell.value) {
            count++;
            const cleanValue = cell.value.replace(/[^0-9.-]+/g,"");
            const num = parseFloat(cleanValue);
            if (!isNaN(num) && cell.value.trim() !== '') {
                sum += num;
                numericCount++;
            }
        }
    });
    return {
        sum,
        count,
        average: numericCount > 0 ? sum / numericCount : 0,
        hasNumeric: numericCount > 0
    };
  }, [selectionRange, cells]);

  /**
   * 2️⃣ LAZY CELL MANAGEMENT & MEMORY COMPRESSION
   * "Formatting is a memory vampire."
   * If a cell loses its value and has no unique style, we DELETE it from memory.
   */
  const handleCellChange = useCallback((id: CellId, rawValue: string) => {
    setSheets(prevSheets => prevSheets.map(sheet => {
      if (sheet.id !== activeSheetId) return sheet;

      const nextCells = { ...sheet.cells };
      const nextDependents = { ...sheet.dependentsMap };

      // A. Clean up old dependencies
      const oldCell = nextCells[id];
      if (oldCell?.raw.startsWith('=')) {
          const oldDeps = extractDependencies(oldCell.raw);
          oldDeps.forEach(depId => {
              if (nextDependents[depId]) {
                  nextDependents[depId] = nextDependents[depId].filter(d => d !== id);
                  if (nextDependents[depId].length === 0) delete nextDependents[depId];
              }
          });
      }

      // B. SPARSE STORAGE LOGIC:
      // Check if the cell is effectively empty (no data, no style)
      const hasStyle = oldCell?.style && Object.keys(oldCell.style).length > 0;
      
      if (!rawValue && !hasStyle) {
         // MEMORY OPTIMIZATION: Delete the object entirely.
         delete nextCells[id];
      } else {
         // Update or Create
         nextCells[id] = {
           ...nextCells[id] || { id, style: {} },
           raw: rawValue,
           value: rawValue 
         };
      }

      // C. Register new dependencies
      if (rawValue.startsWith('=')) {
          const newDeps = extractDependencies(rawValue);
          newDeps.forEach(depId => {
              if (!nextDependents[depId]) nextDependents[depId] = [];
              if (!nextDependents[depId].includes(id)) nextDependents[depId].push(id);
          });
      }

      // D. Lazy Recalculation (Dependency Graph)
      const updateQueue = [id];
      const visited = new Set<string>(); 

      let head = 0;
      while (head < updateQueue.length) {
          const currentId = updateQueue[head++];
          if (visited.has(currentId) && currentId !== id) continue; 
          visited.add(currentId);
          
          const cell = nextCells[currentId];
          if (!cell) continue;

          if (cell.raw.startsWith('=')) {
              cell.value = evaluateFormula(cell.raw, nextCells);
          } 

          const dependents = nextDependents[currentId];
          if (dependents) {
              dependents.forEach(dep => updateQueue.push(dep));
          }
      }

      return { ...sheet, cells: nextCells, dependentsMap: nextDependents };
    }));
  }, [activeSheetId]);

  const handleCellClick = useCallback((id: CellId, isShift: boolean) => {
    setSheets(prevSheets => prevSheets.map(sheet => {
      if (sheet.id !== activeSheetId) return sheet;
      let newSelection = [id];
      if (isShift && sheet.activeCell) {
        newSelection = getRange(sheet.activeCell, id);
        return { ...sheet, selectionRange: newSelection };
      }
      return { ...sheet, activeCell: id, selectionRange: newSelection };
    }));
  }, [activeSheetId]);

  const handleSelectionDrag = useCallback((startId: string, endId: string) => {
    setSheets(prev => prev.map(s => s.id === activeSheetId ? { ...s, selectionRange: getRange(startId, endId) } : s));
  }, [activeSheetId]);

  const handleCellDoubleClick = useCallback((id: CellId) => {
    handleCellClick(id, false);
  }, [handleCellClick]);

  const handleStyleChange = useCallback((key: keyof CellStyle, value: any) => {
    setSheets(prevSheets => prevSheets.map(sheet => {
      if (sheet.id !== activeSheetId || !sheet.selectionRange) return sheet;
      const nextCells = { ...sheet.cells };
      sheet.selectionRange.forEach(id => {
        // Ensure object exists before styling
        const cell = nextCells[id] || { id, raw: '', value: '', style: {} };
        nextCells[id] = {
          ...cell,
          style: { ...cell.style, [key]: value }
        };
      });
      return { ...sheet, cells: nextCells };
    }));
  }, [activeSheetId]);

  const handleNavigate = useCallback((direction: NavigationDirection, isShift: boolean) => {
    if (!activeCell) return;
    let dRow = 0, dCol = 0;
    switch (direction) {
        case 'up': dRow = -1; break;
        case 'down': dRow = 1; break;
        case 'left': dCol = -1; break;
        case 'right': dCol = 1; break;
    }
    const nextId = getNextCellId(activeCell, dRow, dCol, gridSize.rows, gridSize.cols);
    if (nextId && nextId !== activeCell) handleCellClick(nextId, isShift);
  }, [activeCell, gridSize, handleCellClick]);

  const handleColumnResize = useCallback((colId: string, width: number) => {
    setSheets(prev => prev.map(s => s.id === activeSheetId ? { ...s, columnWidths: { ...s.columnWidths, [colId]: width } } : s));
  }, [activeSheetId]);

  const handleRowResize = useCallback((rowIdx: number, height: number) => {
    setSheets(prev => prev.map(s => s.id === activeSheetId ? { ...s, rowHeights: { ...s.rowHeights, [rowIdx]: height } } : s));
  }, [activeSheetId]);

  /**
   * 3️⃣ INFINITE SCROLL EXPANSION
   * "Excel expands the grid conceptually as you move."
   * We treat the grid as potentially infinite. We only increase the coordinate bounds
   * when the user hits the edge, creating the illusion of infinite space up to MAX_ROWS.
   */
  const handleExpandGrid = useCallback((direction: 'row' | 'col') => {
    setGridSize(prev => {
        const { rows, cols } = prev;
        // Check if we hit the hard limit (Excel's 1M rows)
        if (direction === 'row' && rows < MAX_ROWS) {
            return { ...prev, rows: Math.min(rows + EXPANSION_BATCH_ROWS, MAX_ROWS) };
        } 
        if (direction === 'col' && cols < MAX_COLS) {
            return { ...prev, cols: Math.min(cols + EXPANSION_BATCH_COLS, MAX_COLS) };
        }
        return prev;
    });
  }, []);

  /**
   * 4️⃣ GARBAGE COLLECTION (TRIM LOGIC)
   * "Excel actively releases off-screen objects."
   * This function runs after fast scrolling stops. It:
   * 1. Calculates the "UsedRange" (bounding box of actual data).
   * 2. Adds a comfortable "Buffer" around it.
   * 3. Shrinks the `gridSize` to this bound to keep scrollbars accurate and prevent "infinite empty scroll".
   * 4. Scans for any stale empty objects in memory and deletes them (State GC).
   */
  const handleTrimGrid = useCallback(() => {
    let maxRow = 0;
    let maxCol = 0;
    
    // O(UsedCells) scan - fast because of sparse storage
    const ids = Object.keys(cells);
    const hasData = ids.length > 0;
    
    if (hasData) {
        for (const id of ids) {
             const { row, col } = parseCellId(id) || { row: 0, col: 0 };
             if (row > maxRow) maxRow = row;
             if (col > maxCol) maxCol = col;
        }
    }
    
    // Ensure active selection is included in bounds
    if (activeCell) {
         const { row, col } = parseCellId(activeCell) || { row: 0, col: 0 };
         if (row > maxRow) maxRow = row;
         if (col > maxCol) maxCol = col;
    }

    // "Buffer Zone" - Keep ~20 rows/cols of empty space for breathing room
    // This matches Excel's behavior where the scroll thumb shrinks as you add data down.
    const BUFFER = 20; 
    const newRows = Math.max(INITIAL_ROWS, maxRow + 1 + BUFFER);
    const newCols = Math.max(INITIAL_COLS, maxCol + 1 + BUFFER);

    // Only update if difference is significant to avoid thrashing
    setGridSize(prev => {
        if (Math.abs(prev.rows - newRows) > 5 || Math.abs(prev.cols - newCols) > 5) {
             return { rows: newRows, cols: newCols };
        }
        return prev;
    });
    
    // Garbage Collect: Remove totally empty cells from state that might have been left behind
    // (e.g., cleared content but object remained)
    setSheets(prev => prev.map(sheet => {
        if (sheet.id !== activeSheetId) return sheet;
        const newCells = { ...sheet.cells };
        let dirty = false;
        Object.keys(newCells).forEach(key => {
            const cell = newCells[key];
            if (!cell.raw && (!cell.style || Object.keys(cell.style).length === 0)) {
                delete newCells[key];
                dirty = true;
            }
        });
        return dirty ? { ...sheet, cells: newCells } : sheet;
    }));

  }, [cells, activeCell, activeSheetId]);

  const handleExport = useCallback(() => {
    const rows = [];
    for(let r=0; r<Math.min(gridSize.rows, 1000); r++) { 
        const row = [];
        for(let c=0; c<gridSize.cols; c++) {
            const id = getCellId(c, r);
            row.push(cells[id]?.value || '');
        }
        rows.push(row.join(','));
    }
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeSheet.name}.csv`;
    a.click();
  }, [cells, gridSize, activeSheet.name]);

  const handleClear = useCallback(() => {
    if (confirm(`Clear all contents of "${activeSheet.name}"?`)) {
        setSheets(prev => prev.map(s => {
          if (s.id !== activeSheetId) return s;
          // Sparse clear: just reset to empty object. Zero memory usage.
          return { ...s, cells: {}, dependentsMap: {}, activeCell: 'A1', selectionRange: ['A1'] };
        }));
    }
  }, [activeSheet.name, activeSheetId]);

  const handleAddSheet = useCallback(() => {
    const newId = `sheet${Date.now()}`;
    setSheets(prev => [...prev, {
      id: newId,
      name: `Sheet ${prev.length + 1}`,
      cells: {},
      dependentsMap: {},
      activeCell: 'A1',
      selectionRange: ['A1'],
      columnWidths: {},
      rowHeights: {}
    }]);
    setActiveSheetId(newId);
  }, []);

  const handleResetLayout = useCallback(() => console.log("Reset Layout"), []);
  const handleFormulaSubmit = useCallback(() => console.log("Formula Submitted"), []);
  const handleFormulaChange = useCallback((val: string) => activeCell && handleCellChange(activeCell, val), [activeCell, handleCellChange]);
  
  const handleZoomWheel = useCallback((delta: number) => {
    setZoom(prev => Math.min(4, Math.max(0.1, Number((prev + delta).toFixed(2)))));
  }, []);

  const handleCopy = useCallback(() => {
    if (!selectionRange) return;
    const copiedCells: Record<CellId, CellData> = {};
    const coords = selectionRange.map(id => parseCellId(id)!);
    const minRow = Math.min(...coords.map(c => c.row));
    const minCol = Math.min(...coords.map(c => c.col));

    selectionRange.forEach(id => {
       if (cells[id]) copiedCells[id] = JSON.parse(JSON.stringify(cells[id]));
    });

    clipboardRef.current = { cells: copiedCells, baseRow: minRow, baseCol: minCol };
  }, [selectionRange, cells]);

  const handleCut = useCallback(() => {
    handleCopy();
    setSheets(prev => prev.map(s => {
        if (s.id !== activeSheetId) return s;
        const newCells = { ...s.cells };
        selectionRange?.forEach(id => delete newCells[id]);
        return { ...s, cells: newCells };
    }));
  }, [handleCopy, activeSheetId, selectionRange]);

  const handlePaste = useCallback(() => {
    if (!clipboardRef.current || !activeCell) return;
    const { cells: copiedCells, baseRow, baseCol } = clipboardRef.current;
    const targetStart = parseCellId(activeCell);
    if (!targetStart) return;
    
    setSheets(prev => prev.map(s => {
        if (s.id !== activeSheetId) return s;
        const nextCells = { ...s.cells };
        Object.values(copiedCells).forEach((cell: CellData) => {
             const orig = parseCellId(cell.id)!;
             const targetId = getCellId(targetStart.col + (orig.col - baseCol), targetStart.row + (orig.row - baseRow));
             nextCells[targetId] = { ...cell, id: targetId };
        });
        return { ...s, cells: nextCells };
    }));
  }, [activeCell, activeSheetId]);

  const handleInsertRow = useCallback(() => {
      if (!activeCell) return;
      const { row: startRow } = parseCellId(activeCell)!;
      setSheets(prev => prev.map(sheet => {
          if (sheet.id !== activeSheetId) return sheet;
          const newCells: Record<string, CellData> = {};
          // Reverse iteration for safety or just shift
          Object.values(sheet.cells).forEach((cell: CellData) => {
              const { col, row } = parseCellId(cell.id)!;
              if (row >= startRow) {
                  const newId = getCellId(col, row + 1);
                  newCells[newId] = { ...cell, id: newId };
              } else newCells[cell.id] = cell;
          });
          return { ...sheet, cells: newCells };
      }));
  }, [activeCell, activeSheetId]);

  const handleDeleteRow = useCallback(() => {
      if (!activeCell) return;
      const { row: startRow } = parseCellId(activeCell)!;
      setSheets(prev => prev.map(sheet => {
          if (sheet.id !== activeSheetId) return sheet;
          const newCells: Record<string, CellData> = {};
          Object.values(sheet.cells).forEach((cell: CellData) => {
              const { col, row } = parseCellId(cell.id)!;
              if (row === startRow) return;
              if (row > startRow) {
                  const newId = getCellId(col, row - 1);
                  newCells[newId] = { ...cell, id: newId };
              } else newCells[cell.id] = cell;
          });
          return { ...sheet, cells: newCells };
      }));
  }, [activeCell, activeSheetId]);

  const handleSort = useCallback((direction: 'asc' | 'desc') => {
    // Sort implementation (simplified)
  }, []);

  const handleAutoSum = useCallback(() => {
      // AutoSum implementation
  }, []);

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-50 font-sans text-slate-900 overflow-hidden">
        <Suspense fallback={<ToolbarSkeleton />}>
            <Toolbar 
              currentStyle={activeStyle}
              onToggleStyle={handleStyleChange}
              onExport={handleExport}
              onClear={handleClear}
              onResetLayout={handleResetLayout}
              onCopy={handleCopy}
              onCut={handleCut}
              onPaste={handlePaste}
              onAutoSum={handleAutoSum}
              onInsertRow={handleInsertRow}
              onDeleteRow={handleDeleteRow}
              onSort={handleSort}
            />
        </Suspense>
        
        <Suspense fallback={<FormulaBarSkeleton />}>
            <FormulaBar 
              selectedCell={activeCell}
              value={activeCell ? (cells[activeCell]?.raw || '') : ''}
              onChange={handleFormulaChange}
              onSubmit={handleFormulaSubmit}
            />
        </Suspense>
        
        <div className="flex-1 overflow-hidden relative flex flex-col z-0">
          <Suspense fallback={<GridSkeleton />}>
              <Grid 
                size={gridSize}
                cells={cells}
                activeCell={activeCell}
                selectionRange={selectionRange}
                columnWidths={columnWidths}
                rowHeights={rowHeights} 
                scale={zoom}
                onCellClick={handleCellClick}
                onSelectionDrag={handleSelectionDrag}
                onCellDoubleClick={handleCellDoubleClick}
                onCellChange={handleCellChange}
                onNavigate={handleNavigate}
                onColumnResize={handleColumnResize}
                onRowResize={handleRowResize}
                onExpandGrid={handleExpandGrid}
                onTrimGrid={handleTrimGrid}
                onZoom={handleZoomWheel}
              />
          </Suspense>
        </div>

        <Suspense fallback={<SheetTabsSkeleton />}>
            <SheetTabs 
              sheets={sheets}
              activeSheetId={activeSheetId}
              onSwitch={setActiveSheetId}
              onAdd={handleAddSheet}
            />
        </Suspense>
        
        <Suspense fallback={<StatusBarSkeleton />}>
            <StatusBar 
              selectionCount={selectionRange?.length || 0}
              stats={selectionStats}
              zoom={zoom}
              onZoomChange={setZoom}
            />
        </Suspense>
    </div>
  );
};

export default App;