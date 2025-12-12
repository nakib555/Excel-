
import React, { useState, useCallback, useMemo, lazy, Suspense, useRef, useEffect } from 'react';
import { CellId, CellData, CellStyle, GridSize, Sheet } from './types';
import { evaluateFormula, getRange, getNextCellId, parseCellId, getCellId } from './utils';
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

// Configuration
// User Requirement: "for cell genaration =>50 or 30"
const INITIAL_ROWS = 50; 
const INITIAL_COLS = 30; 
const MAX_ROWS = 1048576; 
const MAX_COLS = 16384;   
const EXPANSION_BATCH_ROWS = 30; // Smaller batches for smoother updates
const EXPANSION_BATCH_COLS = 20;

// Initial sample data generation helper
const generateInitialData = (): Record<CellId, CellData> => {
    const initData: Record<CellId, CellData> = {};
    const sample = [
      { id: "A1", val: "Item", style: { bold: true, bg: '#f1f5f9', color: '#475569' } },
      { id: "B1", val: "Cost", style: { bold: true, bg: '#f1f5f9', color: '#475569' } },
      { id: "C1", val: "Qty", style: { bold: true, bg: '#f1f5f9', color: '#475569' } },
      { id: "D1", val: "Total", style: { bold: true, bg: '#f1f5f9', color: '#475569' } },
      { id: "A2", val: "MacBook Pro" }, { id: "B2", val: "2400" }, { id: "C2", val: "2" }, { id: "D2", val: "=B2*C2" },
      { id: "A3", val: "Monitor" }, { id: "B3", val: "500" }, { id: "C3", val: "4" }, { id: "D3", val: "=B3*C3" },
      { id: "A4", val: "Keyboard" }, { id: "B4", val: "150" }, { id: "C4", val: "5" }, { id: "D4", val: "=B4*C4" },
      { id: "C5", val: "Grand Total", style: { bold: true, align: 'right' } }, 
      { id: "D5", val: "=SUM(D2:D4)", style: { bold: true, color: '#059669', bg: '#ecfdf5' } },
    ];

    sample.forEach(s => {
      initData[s.id] = {
        id: s.id,
        raw: s.val,
        value: s.val, // Will be re-evaluated
        style: (s.style as CellStyle) || {}
      };
    });
    
    // Initial evaluation
    const evaluated = { ...initData };
    Object.keys(evaluated).forEach(key => {
        evaluated[key].value = evaluateFormula(evaluated[key].raw, evaluated);
    });
    
    return evaluated;
};

const App: React.FC = () => {
  // Use lazy initialization for sheets to avoid re-generating data on every render
  const [sheets, setSheets] = useState<Sheet[]>(() => [
    {
      id: 'sheet1',
      name: 'Budget 2024',
      cells: generateInitialData(),
      activeCell: "A1",
      selectionRange: ["A1"],
      columnWidths: {},
      rowHeights: {}
    }
  ]);
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
    
    let sum = 0;
    let count = 0;
    let numericCount = 0;
    
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

  const handleCellChange = useCallback((id: CellId, rawValue: string) => {
    setSheets(prevSheets => prevSheets.map(sheet => {
      if (sheet.id !== activeSheetId) return sheet;

      const nextCells = { ...sheet.cells };
      
      // Optimization: If value is empty and no style, remove the key (sparse population)
      if (!rawValue && (!nextCells[id]?.style || Object.keys(nextCells[id].style).length === 0)) {
         delete nextCells[id];
      } else {
         nextCells[id] = {
           ...nextCells[id] || { id, style: {} },
           raw: rawValue,
           value: rawValue
         };
      }

      const keys = Object.keys(nextCells);
      keys.forEach(key => {
         if (nextCells[key].raw.startsWith('=') || key === id) {
            nextCells[key].value = evaluateFormula(nextCells[key].raw, nextCells);
         }
      });
      // Second pass
      keys.forEach(key => {
         if (nextCells[key].raw.startsWith('=')) {
            nextCells[key].value = evaluateFormula(nextCells[key].raw, nextCells);
         }
      });

      return { ...sheet, cells: nextCells };
    }));
  }, [activeSheetId]);

  const handleCellClick = useCallback((id: CellId, isShift: boolean) => {
    setSheets(prevSheets => prevSheets.map(sheet => {
      if (sheet.id !== activeSheetId) return sheet;

      let newSelection = [id];
      if (isShift && sheet.activeCell) {
        newSelection = getRange(sheet.activeCell, id);
        return { ...sheet, selectionRange: newSelection };
      } else {
        return { ...sheet, activeCell: id, selectionRange: newSelection };
      }
    }));
  }, [activeSheetId]);

  const handleSelectionDrag = useCallback((startId: string, endId: string) => {
    setSheets(prevSheets => prevSheets.map(sheet => {
        if (sheet.id !== activeSheetId) return sheet;
        return {
            ...sheet,
            selectionRange: getRange(startId, endId)
        };
    }));
  }, [activeSheetId]);

  const handleCellDoubleClick = useCallback((id: CellId) => {
    handleCellClick(id, false);
  }, [handleCellClick]);

  const handleStyleChange = useCallback((key: keyof CellStyle, value: any) => {
    setSheets(prevSheets => prevSheets.map(sheet => {
      if (sheet.id !== activeSheetId || !sheet.selectionRange) return sheet;

      const nextCells = { ...sheet.cells };
      sheet.selectionRange.forEach(id => {
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
    let dRow = 0;
    let dCol = 0;
    switch (direction) {
        case 'up': dRow = -1; break;
        case 'down': dRow = 1; break;
        case 'left': dCol = -1; break;
        case 'right': dCol = 1; break;
        default: return;
    }
    const nextId = getNextCellId(activeCell, dRow, dCol, gridSize.rows, gridSize.cols);
    if (nextId && nextId !== activeCell) {
        handleCellClick(nextId, isShift);
    }
  }, [activeCell, gridSize, handleCellClick]);

  const handleColumnResize = useCallback((colId: string, width: number) => {
    setSheets(prev => prev.map(s => {
      if (s.id !== activeSheetId) return s;
      return { 
        ...s, 
        columnWidths: { ...s.columnWidths, [colId]: width } 
      };
    }));
  }, [activeSheetId]);

  const handleRowResize = useCallback((rowIdx: number, height: number) => {
    setSheets(prev => prev.map(s => {
      if (s.id !== activeSheetId) return s;
      return { 
        ...s, 
        rowHeights: { ...s.rowHeights, [rowIdx]: height } 
      };
    }));
  }, [activeSheetId]);

  const handleExpandGrid = useCallback((direction: 'row' | 'col') => {
    setGridSize(prev => {
        if (direction === 'row') {
            if (prev.rows >= MAX_ROWS) return prev;
            return { ...prev, rows: Math.min(prev.rows + EXPANSION_BATCH_ROWS, MAX_ROWS) };
        } else {
            if (prev.cols >= MAX_COLS) return prev;
            return { ...prev, cols: Math.min(prev.cols + EXPANSION_BATCH_COLS, MAX_COLS) };
        }
    });
  }, []);

  // User Requirement: "trim cell beyond data side"
  const handleTrimGrid = useCallback(() => {
    // Find max extent of data
    let maxRow = 0;
    let maxCol = 0;
    
    const ids = Object.keys(cells);
    if (ids.length === 0) {
         setGridSize({ rows: INITIAL_ROWS, cols: INITIAL_COLS });
         return;
    }

    for (const id of ids) {
         const { row, col } = parseCellId(id) || { row: 0, col: 0 };
         if (row > maxRow) maxRow = row;
         if (col > maxCol) maxCol = col;
    }
    
    // Check active cell too to avoid cutting off user focus
    if (activeCell) {
         const { row, col } = parseCellId(activeCell) || { row: 0, col: 0 };
         if (row > maxRow) maxRow = row;
         if (col > maxCol) maxCol = col;
    }

    // Add buffer of 20 as requested for outside view
    const BUFFER = 20; 
    const newRows = Math.max(INITIAL_ROWS, maxRow + 1 + BUFFER);
    const newCols = Math.max(INITIAL_COLS, maxCol + 1 + BUFFER);

    setGridSize(prev => {
        // Only trim if significantly larger to avoid layout thrashing during active use
        if (prev.rows > newRows + 10 || prev.cols > newCols + 10) {
             return { rows: newRows, cols: newCols };
        }
        return prev;
    });
  }, [cells, activeCell]);

  const handleExport = useCallback(() => {
    const rows = [];
    for(let r=0; r<Math.min(gridSize.rows, 50); r++) { 
        const row = [];
        for(let c=0; c<gridSize.cols; c++) {
            let s = '';
            let num = c;
            while (num > -1) {
                const t = (num) % 26;
                s = String.fromCharCode(t + 65) + s;
                num = (num - t) / 26 - 1;
            }
            const id = `${s}${r+1}`;
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
    if (confirm(`Are you sure you want to clear the entire "${activeSheet.name}"?`)) {
        setSheets(prev => prev.map(s => {
          if (s.id !== activeSheetId) return s;
          return { ...s, cells: {}, activeCell: 'A1', selectionRange: ['A1'], columnWidths: {}, rowHeights: {} };
        }));
    }
  }, [activeSheet.name, activeSheetId]);

  const handleAddSheet = useCallback(() => {
    const newId = `sheet${Date.now()}`;
    const num = sheets.length + 1;
    const newSheet: Sheet = {
      id: newId,
      name: `Sheet ${num}`,
      cells: {},
      activeCell: 'A1',
      selectionRange: ['A1'],
      columnWidths: {},
      rowHeights: {}
    };
    setSheets(prev => [...prev, newSheet]);
    setActiveSheetId(newId);
  }, [sheets.length]);

  const handleResetLayout = useCallback(() => {
    console.log("Reset Layout");
  }, []);

  const handleFormulaSubmit = useCallback(() => {
    console.log("Formula Submitted");
  }, []);

  const handleFormulaChange = useCallback((val: string) => {
    if (activeCell) handleCellChange(activeCell, val);
  }, [activeCell, handleCellChange]);

  const handleZoomWheel = useCallback((delta: number) => {
    setZoom(prev => {
        const next = prev + delta;
        return Math.min(4, Math.max(0.1, Number(next.toFixed(2))));
    });
  }, []);

  const handleSetZoom = useCallback((val: number) => {
      setZoom(val);
  }, []);

  // --- TOOLS IMPLEMENTATION ---

  const handleCopy = useCallback(() => {
    if (!selectionRange) return;
    const copiedCells: Record<CellId, CellData> = {};
    const coords = selectionRange.map(id => parseCellId(id)!);
    const minRow = Math.min(...coords.map(c => c.row));
    const minCol = Math.min(...coords.map(c => c.col));

    selectionRange.forEach(id => {
       if (cells[id]) {
           copiedCells[id] = JSON.parse(JSON.stringify(cells[id]));
       }
    });

    clipboardRef.current = {
        cells: copiedCells,
        baseRow: minRow,
        baseCol: minCol
    };
  }, [selectionRange, cells]);

  const handleCut = useCallback(() => {
    handleCopy();
    setSheets(prev => prev.map(s => {
        if (s.id !== activeSheetId) return s;
        const newCells = { ...s.cells };
        selectionRange?.forEach(id => {
            delete newCells[id];
        });
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
        const newCells = { ...s.cells };
        
        Object.values(copiedCells).forEach(cell => {
             const orig = parseCellId(cell.id)!;
             const rOffset = orig.row - baseRow;
             const cOffset = orig.col - baseCol;
             
             const targetRow = targetStart.row + rOffset;
             const targetCol = targetStart.col + cOffset;
             const targetId = getCellId(targetCol, targetRow);
             
             newCells[targetId] = {
                 ...cell,
                 id: targetId,
             };
        });
        return { ...s, cells: newCells };
    }));
  }, [activeCell, activeSheetId]);

  const handleInsertRow = useCallback(() => {
      if (!activeCell) return;
      const { row: startRow } = parseCellId(activeCell)!;
      setSheets(prev => prev.map(sheet => {
          if (sheet.id !== activeSheetId) return sheet;
          const newCells: Record<string, CellData> = {};
          Object.values(sheet.cells).forEach(cell => {
              const { col, row } = parseCellId(cell.id)!;
              if (row >= startRow) {
                  const newId = getCellId(col, row + 1);
                  newCells[newId] = { ...cell, id: newId };
              } else {
                  newCells[cell.id] = cell;
              }
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
          Object.values(sheet.cells).forEach(cell => {
              const { col, row } = parseCellId(cell.id)!;
              if (row === startRow) return; // Drop
              if (row > startRow) {
                  const newId = getCellId(col, row - 1);
                  newCells[newId] = { ...cell, id: newId };
              } else {
                  newCells[cell.id] = cell;
              }
          });
          return { ...sheet, cells: newCells };
      }));
  }, [activeCell, activeSheetId]);

  const handleAutoSum = useCallback(() => {
      if (!activeCell) return;
      const { col, row } = parseCellId(activeCell)!;
      // Look up
      let startRow = row - 1;
      while (startRow >= 0) {
          const id = getCellId(col, startRow);
          const cell = cells[id];
          if (!cell || (!parseFloat(cell.value) && cell.value !== '0')) break;
          startRow--;
      }
      startRow++; 
      
      if (startRow < row) {
          const startId = getCellId(col, startRow);
          const endId = getCellId(col, row - 1);
          const formula = `=SUM(${startId}:${endId})`;
          handleCellChange(activeCell, formula);
      }
  }, [activeCell, cells, handleCellChange]);

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
              onZoomChange={handleSetZoom}
            />
        </Suspense>
    </div>
  );
};

export default App;
