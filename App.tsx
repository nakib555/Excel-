import React, { useState, useCallback, useMemo, Suspense } from 'react';
import { CellId, CellData, CellStyle, GridSize, Sheet } from './types';
import { evaluateFormula, getRange, getNextCellId } from './utils';
import { NavigationDirection } from './components';
import { AppSkeleton } from './components/Skeletons';

// Lazy Load Components
const Toolbar = React.lazy(() => import('./components/Toolbar'));
const FormulaBar = React.lazy(() => import('./components/FormulaBar'));
const Grid = React.lazy(() => import('./components/Grid'));
const SheetTabs = React.lazy(() => import('./components/SheetTabs'));
const StatusBar = React.lazy(() => import('./components/StatusBar'));

// Initial Configuration
const INITIAL_ROWS = 50;
const INITIAL_COLS = 26; // A-Z

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
  const [gridSize] = useState<GridSize>({ rows: INITIAL_ROWS, cols: INITIAL_COLS });
  const [zoom, setZoom] = useState<number>(1);
  
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

  const handleCellChange = useCallback((id: CellId, rawValue: string) => {
    setSheets(prevSheets => prevSheets.map(sheet => {
      if (sheet.id !== activeSheetId) return sheet;

      const nextCells = { ...sheet.cells };
      nextCells[id] = {
        ...nextCells[id] || { id, style: {} },
        raw: rawValue,
        value: rawValue
      };

      const keys = Object.keys(nextCells);
      keys.forEach(key => {
         nextCells[key].value = evaluateFormula(nextCells[key].raw, nextCells);
      });
      // Double pass for dependencies (simple implementation)
      keys.forEach(key => {
         nextCells[key].value = evaluateFormula(nextCells[key].raw, nextCells);
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

  // Stable wrapper for double click to prevent implicit function creation in render
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

  const handleNavigate = useCallback((direction: NavigationDirection) => {
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
        handleCellClick(nextId, false);
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

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-50 font-sans text-slate-900 overflow-hidden">
      <Suspense fallback={<AppSkeleton />}>
        <Toolbar 
          currentStyle={activeStyle}
          onToggleStyle={handleStyleChange}
          onExport={handleExport}
          onClear={handleClear}
          onResetLayout={handleResetLayout}
        />
        
        <FormulaBar 
          selectedCell={activeCell}
          value={activeCell ? (cells[activeCell]?.raw || '') : ''}
          onChange={handleFormulaChange}
          onSubmit={handleFormulaSubmit}
        />
        
        <div className="flex-1 overflow-hidden relative flex flex-col z-0">
          <Grid 
            size={gridSize}
            cells={cells}
            activeCell={activeCell}
            selectionRange={selectionRange}
            columnWidths={columnWidths}
            rowHeights={rowHeights} 
            scale={zoom}
            onCellClick={handleCellClick}
            onCellDoubleClick={handleCellDoubleClick}
            onCellChange={handleCellChange}
            onNavigate={handleNavigate}
            onColumnResize={handleColumnResize}
            onRowResize={handleRowResize}
          />
        </div>

        <SheetTabs 
          sheets={sheets}
          activeSheetId={activeSheetId}
          onSwitch={setActiveSheetId}
          onAdd={handleAddSheet}
        />
        
        <StatusBar 
          selectionCount={selectionRange?.length || 0}
          zoom={zoom}
          onZoomChange={setZoom}
        />
      </Suspense>
    </div>
  );
};

export default App;
