

import React, { useState, useCallback, useMemo, lazy, Suspense, useRef, useEffect } from 'react';

// --- 1. Imports from sibling files ---
import { CellId, CellData, CellStyle, GridSize, Sheet } from './types'; 

// --- 2. Imports from utils folder ---
import { 
  evaluateFormula, 
  getRange, 
  getNextCellId, 
  parseCellId, 
  getCellId, 
  extractDependencies, 
  getStyleId, 
  numToChar, 
  checkIntersect 
} from './utils';

// Import Skeletons
import { 
  ToolbarSkeleton, 
  FormulaBarSkeleton, 
  GridSkeleton, 
  SheetTabsSkeleton, 
  StatusBarSkeleton 
} from './components/Skeletons';

// --- 3. Component Imports ---
// Lazy Load heavy UI components
const AIAssistant = lazy(() => import('./components/AIAssistant'));
const Toolbar = lazy(() => import('./components/Toolbar'));
const FormulaBar = lazy(() => import('./components/FormulaBar'));
const Grid = lazy(() => import('./components/Grid'));
const SheetTabs = lazy(() => import('./components/SheetTabs'));
const StatusBar = lazy(() => import('./components/StatusBar'));
const MobileResizeTool = lazy(() => import('./components/MobileResizeTool'));
const FormatCellsDialog = lazy(() => import('./components/dialogs/FormatCellsDialog'));

export type NavigationDirection = 'up' | 'down' | 'left' | 'right';

// --- EXCEL ENGINE CONSTANTS ---
const MAX_ROWS = 1048576; 
const MAX_COLS = 16384;   

const INITIAL_ROWS = 150; 
const INITIAL_COLS = 30;

const EXPANSION_BATCH_ROWS = 300; 
const EXPANSION_BATCH_COLS = 100; 

const DEFAULT_COL_WIDTH = 100;
const DEFAULT_ROW_HEIGHT = 28;

// --- DATA GENERATOR ---
const generateSparseData = (): { cells: Record<CellId, CellData>, dependentsMap: Record<CellId, CellId[]>, styles: Record<string, CellStyle> } => {
    const cells: Record<CellId, CellData> = {};
    const dependentsMap: Record<CellId, CellId[]> = {};
    let styles: Record<string, CellStyle> = {};
    
    // The "UsedRange" data
    const dataset = [
      { id: "A1", val: "Item", style: { bold: true, bg: '#f1f5f9', color: '#475569', align: 'center' as const, verticalAlign: 'middle' as const } },
      { id: "B1", val: "Cost", style: { bold: true, bg: '#f1f5f9', color: '#475569', format: 'currency' as const, align: 'center' as const } },
      { id: "C1", val: "Qty", style: { bold: true, bg: '#f1f5f9', color: '#475569', align: 'center' as const } },
      { id: "D1", val: "Total", style: { bold: true, bg: '#f1f5f9', color: '#475569', format: 'currency' as const, align: 'center' as const } },
      
      { id: "A2", val: "MacBook Pro" }, 
      { id: "B2", val: "2400", style: { format: 'currency' as const, decimalPlaces: 0 } }, 
      { id: "C2", val: "2", style: { align: 'center' as const } }, 
      { id: "D2", val: "=B2*C2", style: { format: 'currency' as const, decimalPlaces: 0 } },
      
      { id: "A3", val: "Monitor" }, 
      { id: "B3", val: "500", style: { format: 'currency' as const, decimalPlaces: 0 } }, 
      { id: "C3", val: "4", style: { align: 'center' as const } }, 
      { id: "D3", val: "=B3*C3", style: { format: 'currency' as const, decimalPlaces: 0 } },
      
      { id: "A4", val: "Keyboard" }, 
      { id: "B4", val: "150", style: { format: 'currency' as const, decimalPlaces: 0 } }, 
      { id: "C4", val: "5", style: { align: 'center' as const } }, 
      { id: "D4", val: "=B4*C4", style: { format: 'currency' as const, decimalPlaces: 0 } },
      
      { id: "C5", val: "Grand Total", style: { bold: true, align: 'right' as const } }, 
      { id: "D5", val: "=SUM(D2:D4)", style: { bold: true, color: '#059669', bg: '#ecfdf5', format: 'currency' as const, decimalPlaces: 0 } },
    ];

    dataset.forEach(s => {
      let styleId: string | undefined = undefined;
      if (s.style) {
          const res = getStyleId(styles, s.style);
          styles = res.registry;
          styleId = res.id;
      }

      cells[s.id] = {
        id: s.id,
        raw: s.val,
        value: s.val, 
        styleId
      };
    });
    
    // Initial calculation pass
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
    
    return { cells, dependentsMap, styles };
};

// Safe API Key retrieval helper
const getApiKey = () => {
  try {
    if (typeof process !== 'undefined' && process.env) {
      return process.env.API_KEY || '';
    }
  } catch (e) {
    return '';
  }
  return '';
};

const App: React.FC = () => {
  const [sheets, setSheets] = useState<Sheet[]>(() => {
    const { cells, dependentsMap, styles } = generateSparseData();
    return [{
      id: 'sheet1',
      name: 'Budget 2024',
      cells,
      styles,
      merges: [],
      validations: {},
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
  const [showMobileResize, setShowMobileResize] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [showFormatCells, setShowFormatCells] = useState(false);
  const clipboardRef = useRef<{ cells: Record<CellId, CellData>; baseRow: number; baseCol: number } | null>(null);
  
  const apiKey = getApiKey();

  const activeSheet = useMemo(() => 
    sheets.find(s => s.id === activeSheetId) || sheets[0], 
  [sheets, activeSheetId]);

  const cells = activeSheet.cells;
  const styles = activeSheet.styles;
  const merges = activeSheet.merges;
  const validations = activeSheet.validations;
  const activeCell = activeSheet.activeCell;
  const selectionRange = activeSheet.selectionRange;
  const columnWidths = activeSheet.columnWidths;
  const rowHeights = activeSheet.rowHeights;

  const activeStyle: CellStyle = useMemo(() => {
    if (!activeCell || !cells[activeCell]) return {};
    return cells[activeCell].styleId ? (styles[cells[activeCell].styleId!] || {}) : {};
  }, [activeCell, cells, styles]);

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

  const handleCellChange = useCallback((id: CellId, rawValue: string) => {
    setSheets(prevSheets => prevSheets.map(sheet => {
      if (sheet.id !== activeSheetId) return sheet;

      const nextCells = { ...sheet.cells };
      const nextDependents = { ...sheet.dependentsMap };

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

      const hasStyle = !!oldCell?.styleId;
      // Also keep if it has special properties
      const hasSpecial = oldCell?.isCheckbox || oldCell?.link || oldCell?.comment;

      if (!rawValue && !hasStyle && !hasSpecial) {
         delete nextCells[id];
      } else {
         nextCells[id] = {
           ...nextCells[id] || { id },
           raw: rawValue,
           value: rawValue 
         };
      }

      if (rawValue.startsWith('=')) {
          const newDeps = extractDependencies(rawValue);
          newDeps.forEach(depId => {
              if (!nextDependents[depId]) nextDependents[depId] = [];
              if (!nextDependents[depId].includes(id)) nextDependents[depId].push(id);
          });
      }

      // Simple dependency update queue
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
      let nextStyles = { ...sheet.styles };
      
      sheet.selectionRange.forEach(id => {
        const cell = nextCells[id] || { id, raw: '', value: '' };
        const currentStyle = cell.styleId ? (nextStyles[cell.styleId] || {}) : {};
        const newStyle = { ...currentStyle, [key]: value };
        const res = getStyleId(nextStyles, newStyle);
        nextStyles = res.registry;
        const newStyleId = res.id;
        
        nextCells[id] = {
          ...cell,
          styleId: newStyleId
        };
      });
      
      return { ...sheet, cells: nextCells, styles: nextStyles };
    }));
  }, [activeSheetId]);

  const handleApplyFullStyle = useCallback((newStyle: CellStyle) => {
      // Merge new properties into selection
      setSheets(prevSheets => prevSheets.map(sheet => {
          if (sheet.id !== activeSheetId || !sheet.selectionRange) return sheet;
          
          const nextCells = { ...sheet.cells };
          let nextStyles = { ...sheet.styles };
          
          sheet.selectionRange.forEach(id => {
              const cell = nextCells[id] || { id, raw: '', value: '' };
              const currentStyle = cell.styleId ? (nextStyles[cell.styleId] || {}) : {};
              // Merge full style
              const mergedStyle = { ...currentStyle, ...newStyle };
              
              const res = getStyleId(nextStyles, mergedStyle);
              nextStyles = res.registry;
              nextCells[id] = { ...cell, styleId: res.id };
          });
          return { ...sheet, cells: nextCells, styles: nextStyles };
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

  const handleNameBoxSubmit = useCallback((input: string) => {
    const coords = parseCellId(input);
    if (!coords) return;
    const { row, col } = coords;
    if (row >= MAX_ROWS || col >= MAX_COLS) {
        alert(`Cell reference out of bounds.`);
        return;
    }
    setGridSize(prev => ({
        rows: Math.max(prev.rows, row + 50), 
        cols: Math.max(prev.cols, col + 20)
    }));
    const id = getCellId(col, row);
    handleCellClick(id, false);
  }, [handleCellClick]);

  const handleColumnResize = useCallback((colId: string, width: number) => {
    setSheets(prev => prev.map(s => s.id === activeSheetId ? { ...s, columnWidths: { ...s.columnWidths, [colId]: width } } : s));
  }, [activeSheetId]);

  const handleRowResize = useCallback((rowIdx: number, height: number) => {
    setSheets(prev => prev.map(s => s.id === activeSheetId ? { ...s, rowHeights: { ...s.rowHeights, [rowIdx]: height } } : s));
  }, [activeSheetId]);

  const resizeActiveRow = useCallback((delta: number) => {
     if (!activeCell) return;
     const { row } = parseCellId(activeCell)!;
     const currentH = rowHeights[row] || DEFAULT_ROW_HEIGHT;
     handleRowResize(row, Math.max(20, currentH + delta));
  }, [activeCell, rowHeights, handleRowResize]);

  const resizeActiveCol = useCallback((delta: number) => {
     if (!activeCell) return;
     const { col } = parseCellId(activeCell)!;
     const colChar = numToChar(col);
     const currentW = columnWidths[colChar] || DEFAULT_COL_WIDTH;
     handleColumnResize(colChar, Math.max(30, currentW + delta));
  }, [activeCell, columnWidths, handleColumnResize]);

  const handleResetActiveResize = useCallback(() => {
     if (!activeCell) return;
     const { col, row } = parseCellId(activeCell)!;
     const colChar = numToChar(col);
     setSheets(prev => prev.map(s => {
         if (s.id !== activeSheetId) return s;
         const newColWidths = { ...s.columnWidths };
         const newRowHeights = { ...s.rowHeights };
         delete newColWidths[colChar];
         delete newRowHeights[row];
         return { ...s, columnWidths: newColWidths, rowHeights: newRowHeights };
     }));
  }, [activeCell, activeSheetId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.altKey && activeCell) {
            if (e.key === 'ArrowRight') {
                e.preventDefault();
                resizeActiveCol(5);
            } else if (e.key === 'ArrowLeft') {
                 e.preventDefault();
                 resizeActiveCol(-5);
            } else if (e.key === 'ArrowDown') {
                 e.preventDefault();
                 resizeActiveRow(5);
            } else if (e.key === 'ArrowUp') {
                 e.preventDefault();
                 resizeActiveRow(-5);
            }
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeCell, resizeActiveCol, resizeActiveRow]);

  const handleExpandGrid = useCallback((direction: 'row' | 'col') => {
    setGridSize(prev => {
        const { rows, cols } = prev;
        if (direction === 'row' && rows < MAX_ROWS) {
            return { ...prev, rows: Math.min(rows + EXPANSION_BATCH_ROWS, MAX_ROWS) };
        } 
        if (direction === 'col' && cols < MAX_COLS) {
            return { ...prev, cols: Math.min(cols + EXPANSION_BATCH_COLS, MAX_COLS) };
        }
        return prev;
    });
  }, []);

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
          return { ...s, cells: {}, dependentsMap: {}, activeCell: 'A1', selectionRange: ['A1'], styles: {}, merges: [], validations: {} };
        }));
    }
  }, [activeSheet.name, activeSheetId]);

  const handleAddSheet = useCallback(() => {
    const newId = `sheet${Date.now()}`;
    setSheets(prev => [...prev, {
      id: newId,
      name: `Sheet ${prev.length + 1}`,
      cells: {},
      styles: {},
      merges: [],
      validations: {},
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

  const handleSort = useCallback((direction: 'asc' | 'desc') => {}, []);

  const handleAutoSum = useCallback(() => {}, []);

  // --- MERGE & CENTER FEATURE ---
  const handleMergeCenter = useCallback(() => {
      setSheets(prev => prev.map(sheet => {
          if (sheet.id !== activeSheetId || !sheet.selectionRange || sheet.selectionRange.length < 2) return sheet;
          
          const selection = sheet.selectionRange;
          const start = selection[0];
          const end = selection[selection.length - 1];
          const rangeStr = `${start}:${end}`;
          
          if (sheet.merges.includes(rangeStr)) {
              return { ...sheet, merges: sheet.merges.filter(m => m !== rangeStr) };
          }

          const newMerges = sheet.merges.filter(m => !checkIntersect(m, rangeStr));
          newMerges.push(rangeStr);

          const nextCells = { ...sheet.cells };
          let nextStyles = { ...sheet.styles };
          const cell = nextCells[start] || { id: start, raw: '', value: '' };
          const currentStyle = cell.styleId ? (nextStyles[cell.styleId] || {}) : {};
          
          const newStyle = { ...currentStyle, align: 'center', verticalAlign: 'middle' };
          
          const res = getStyleId(nextStyles, newStyle as CellStyle);
          nextStyles = res.registry;
          nextCells[start] = { ...cell, styleId: res.id };

          return { ...sheet, merges: newMerges, cells: nextCells, styles: nextStyles };
      }));
  }, [activeSheetId]);

  const handleDataValidation = useCallback(() => {
      if (!activeCell) return;
      const input = prompt("Enter allowed values separated by comma (e.g. Yes,No,Maybe):");
      if (input !== null) {
          const options = input.split(',').map(s => s.trim()).filter(s => s.length > 0);
          setSheets(prev => prev.map(sheet => {
              if (sheet.id !== activeSheetId || !sheet.selectionRange) return sheet;
              const nextValidations = { ...sheet.validations };
              sheet.selectionRange.forEach(id => {
                  if (options.length > 0) {
                      nextValidations[id] = { type: 'list', options };
                  } else {
                      delete nextValidations[id];
                  }
              });
              return { ...sheet, validations: nextValidations };
          }));
      }
  }, [activeCell, activeSheetId]);

  // --- NEW INSERT FEATURES ---
  const handleInsertTable = useCallback(() => {
    setSheets(prev => prev.map(sheet => {
        if (sheet.id !== activeSheetId || !sheet.selectionRange) return sheet;
        const range = sheet.selectionRange;
        // Calculate bounds
        const coords = range.map(id => parseCellId(id)!);
        const minRow = Math.min(...coords.map(c => c.row));
        
        const nextCells = { ...sheet.cells };
        let nextStyles = { ...sheet.styles };

        range.forEach(id => {
            const { row } = parseCellId(id)!;
            const isHeader = row === minRow;
            const isBand = (row - minRow) % 2 === 0;

            const cell = nextCells[id] || { id, raw: '', value: '' };
            const currentStyle = cell.styleId ? (nextStyles[cell.styleId] || {}) : {};
            
            let newStyle = { ...currentStyle };
            
            if (isHeader) {
                newStyle = { ...newStyle, bold: true, bg: '#1e293b', color: '#ffffff' };
            } else if (!isBand) { // Alternating row
                 // Check if it already has a bg, if not apply light gray
                 if (!newStyle.bg || newStyle.bg === '#ffffff') {
                     newStyle.bg = '#f1f5f9';
                 }
            }

            const res = getStyleId(nextStyles, newStyle);
            nextStyles = res.registry;
            nextCells[id] = { ...cell, styleId: res.id };
        });
        return { ...sheet, cells: nextCells, styles: nextStyles };
    }));
  }, [activeSheetId]);

  const handleInsertCheckbox = useCallback(() => {
      setSheets(prev => prev.map(sheet => {
        if (sheet.id !== activeSheetId || !sheet.selectionRange) return sheet;
        const nextCells = { ...sheet.cells };
        sheet.selectionRange.forEach(id => {
           nextCells[id] = {
               ...nextCells[id] || { id, raw: '', value: '' },
               isCheckbox: true,
               raw: 'FALSE',
               value: 'FALSE'
           };
        });
        return { ...sheet, cells: nextCells };
      }));
  }, [activeSheetId]);

  const handleInsertLink = useCallback(() => {
    if (!activeCell) return;
    const url = prompt("Enter URL:", "https://");
    if (url) {
        setSheets(prev => prev.map(sheet => {
            if (sheet.id !== activeSheetId || !sheet.selectionRange) return sheet;
            const nextCells = { ...sheet.cells };
            let nextStyles = { ...sheet.styles };
            
            sheet.selectionRange.forEach(id => {
               const cell = nextCells[id] || { id, raw: '', value: '' };
               
               // Apply link style
               const currentStyle = cell.styleId ? (nextStyles[cell.styleId] || {}) : {};
               const newStyle = { ...currentStyle, color: '#2563eb', underline: true };
               const res = getStyleId(nextStyles, newStyle);
               nextStyles = res.registry;

               nextCells[id] = {
                   ...cell,
                   styleId: res.id,
                   link: url,
                   value: cell.value || url // Use URL as text if empty
               };
            });
            return { ...sheet, cells: nextCells, styles: nextStyles };
        }));
    }
  }, [activeCell, activeSheetId]);

  const handleInsertComment = useCallback(() => {
    if (!activeCell) return;
    const text = prompt("Enter comment:");
    if (text) {
        setSheets(prev => prev.map(sheet => {
            if (sheet.id !== activeSheetId) return sheet;
            const nextCells = { ...sheet.cells };
            const cell = nextCells[activeCell] || { id: activeCell, raw: '', value: '' };
            nextCells[activeCell] = { ...cell, comment: text };
            return { ...sheet, cells: nextCells };
        }));
    }
  }, [activeCell, activeSheetId]);

  const handleAIApply = useCallback((result: { type: 'data' | 'formula', data?: string[][], formula?: string }) => {
    if (!activeCell) return;
    const start = parseCellId(activeCell);
    if (!start) return;

    if (result.type === 'formula' && result.formula) {
        handleCellChange(activeCell, result.formula);
    } else if (result.type === 'data' && result.data) {
        setSheets(prev => prev.map(sheet => {
            if (sheet.id !== activeSheetId) return sheet;
            const nextCells = { ...sheet.cells };
            
            result.data!.forEach((row, rIdx) => {
                row.forEach((val, cIdx) => {
                    const cellId = getCellId(start.col + cIdx, start.row + rIdx);
                    nextCells[cellId] = {
                        id: cellId,
                        raw: String(val),
                        value: String(val)
                    };
                });
            });
            return { ...sheet, cells: nextCells };
        }));
    }
    setShowAI(false);
  }, [activeCell, activeSheetId, handleCellChange]);

  return (
    <div className="flex flex-col h-[100dvh] w-screen bg-slate-50 overflow-hidden font-sans text-slate-900 relative">
      <div className="flex-shrink-0 z-[60]">
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
            onMergeCenter={handleMergeCenter}
            onDataValidation={handleDataValidation}
            onToggleAI={() => setShowAI(true)}
            onOpenFormatDialog={() => setShowFormatCells(true)}
            // New Handlers
            onInsertTable={handleInsertTable}
            onInsertCheckbox={handleInsertCheckbox}
            onInsertLink={handleInsertLink}
            onInsertComment={handleInsertComment}
          />
        </Suspense>
      </div>
      
      <div className="flex-shrink-0 z-50">
        <Suspense fallback={<FormulaBarSkeleton />}>
          <FormulaBar 
            value={activeCell && cells[activeCell] ? cells[activeCell].raw : ''}
            onChange={handleFormulaChange}
            onSubmit={handleFormulaSubmit}
            selectedCell={activeCell}
            onNameBoxSubmit={handleNameBoxSubmit}
          />
        </Suspense>
      </div>

      <main className="flex-1 overflow-hidden relative z-0">
        <Suspense fallback={<GridSkeleton />}>
            <Grid
              size={gridSize}
              cells={cells}
              styles={styles}
              merges={merges}
              validations={validations}
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
              onZoom={handleZoomWheel}
            />
        </Suspense>
      </main>

      <div className="flex-shrink-0 z-40">
        <Suspense fallback={<SheetTabsSkeleton />}>
          <SheetTabs 
            sheets={sheets}
            activeSheetId={activeSheetId}
            onSwitch={setActiveSheetId}
            onAdd={handleAddSheet}
          />
        </Suspense>
      </div>

      <div className="flex-shrink-0 z-40">
        <Suspense fallback={<StatusBarSkeleton />}>
          <StatusBar 
            selectionCount={selectionRange ? selectionRange.length : 0}
            stats={selectionStats}
            zoom={zoom}
            onZoomChange={setZoom}
            onToggleMobileResize={() => setShowMobileResize(!showMobileResize)}
          />
        </Suspense>
      </div>

      <Suspense fallback={null}>
         <MobileResizeTool 
            isOpen={showMobileResize}
            onClose={() => setShowMobileResize(false)}
            activeCell={activeCell}
            onResizeRow={resizeActiveRow}
            onResizeCol={resizeActiveCol}
            onReset={handleResetActiveResize}
         />
      </Suspense>

      <Suspense fallback={null}>
        <AIAssistant 
            isOpen={showAI}
            onClose={() => setShowAI(false)}
            onApply={handleAIApply}
            apiKey={apiKey}
        />
      </Suspense>

      <Suspense fallback={null}>
        <FormatCellsDialog 
            isOpen={showFormatCells}
            onClose={() => setShowFormatCells(false)}
            initialStyle={activeStyle}
            onApply={handleApplyFullStyle}
        />
      </Suspense>
    </div>
  );
};

export default App;