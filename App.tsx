

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
  checkIntersect,
  adjustFormulaReferences,
  measureTextWidth
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
const AIAssistant = lazy(() => import('./components/AIAssistant'));
const Toolbar = lazy(() => import('./components/Toolbar'));
const FormulaBar = lazy(() => import('./components/FormulaBar'));
const Grid = lazy(() => import('./components/Grid'));
const SheetTabs = lazy(() => import('./components/SheetTabs'));
const StatusBar = lazy(() => import('./components/StatusBar'));
const MobileResizeTool = lazy(() => import('./components/MobileResizeTool'));
const FormatCellsDialog = lazy(() => import('./components/dialogs/FormatCellsDialog'));
const FindReplaceDialog = lazy(() => import('./components/dialogs/FindReplaceDialog'));
const MergeStylesDialog = lazy(() => import('./components/dialogs/MergeStylesDialog'));
const CreateTableDialog = lazy(() => import('./components/dialogs/CreateTableDialog'));

export type NavigationDirection = 'up' | 'down' | 'left' | 'right';

// --- EXCEL ENGINE CONSTANTS ---
const MAX_ROWS = 1048576; 
const MAX_COLS = 16384;   

const INITIAL_ROWS = 200; 
const INITIAL_COLS = 50;

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
                if (!dependentsMap[dep].includes(key)) dependentsMap[dep] = [key];
                else if (!dependentsMap[dep].includes(key)) dependentsMap[dep].push(key);
            });
        }
    });
    
    return { cells, dependentsMap, styles };
};

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
  const [showMergeStyles, setShowMergeStyles] = useState(false);
  const [createTableState, setCreateTableState] = useState<{ isOpen: boolean, preset: any | null, range: string }>({ isOpen: false, preset: null, range: '' });
  const [formatDialogTab, setFormatDialogTab] = useState('Number');
  const [findReplaceState, setFindReplaceState] = useState<{ open: boolean, mode: 'find' | 'replace' | 'goto' }>({ open: false, mode: 'find' });
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
      const hasSpecial = oldCell?.isCheckbox || oldCell?.link || oldCell?.comment || oldCell?.filterButton;

      if (!rawValue && !hasStyle && !hasSpecial) {
         delete nextCells[id];
      } else {
         nextCells[id] = {
           ...(nextCells[id] || { id }),
           raw: rawValue,
           value: rawValue 
         } as CellData;
      }

      if (rawValue.startsWith('=')) {
          const newDeps = extractDependencies(rawValue);
          newDeps.forEach(depId => {
              if (!nextDependents[depId]) nextDependents[depId] = [];
              if (!nextDependents[depId].includes(id)) nextDependents[depId].push(id);
          });
      }

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
      
      const nextCells: Record<string, CellData> = { ...sheet.cells };
      let nextStyles: Record<string, CellStyle> = { ...sheet.styles };
      
      sheet.selectionRange.forEach(id => {
        const existing = nextCells[id];
        const cell: CellData = existing ? { ...existing } : { id, raw: '', value: '' };
        
        const styleId = cell.styleId;
        const currentStyle: CellStyle = styleId && nextStyles[styleId] ? nextStyles[styleId] : {};
        
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
      setSheets(prevSheets => prevSheets.map(sheet => {
          if (sheet.id !== activeSheetId || !sheet.selectionRange) return sheet;
          
          const nextCells: Record<string, CellData> = { ...sheet.cells };
          let nextStyles: Record<string, CellStyle> = { ...sheet.styles };
          
          sheet.selectionRange.forEach(id => {
              const existing = nextCells[id];
              const cell: CellData = existing ? { ...existing } : { id, raw: '', value: '' };
              
              const styleId = cell.styleId;
              const currentStyle: CellStyle = styleId && nextStyles[styleId] ? nextStyles[styleId] : {};
              
              const mergedStyle: CellStyle = { ...currentStyle, ...newStyle };
              
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

  const handleAutoFit = useCallback((colIdx: number) => {
      const colChar = numToChar(colIdx);
      let maxWidth = 0;
      Object.values(activeSheet.cells).forEach((cell: CellData) => {
          const { col } = parseCellId(cell.id)!;
          if (col === colIdx) {
              const style = cell.styleId ? activeSheet.styles[cell.styleId] : {};
              const fontSize = style.fontSize || 13;
              const fontFamily = style.fontFamily || 'Inter';
              const bold = style.bold || false;
              const val = cell.value || '';
              const width = measureTextWidth(val, fontSize, fontFamily, bold);
              if (width > maxWidth) maxWidth = width;
          }
      });
      const padding = 12; 
      const finalWidth = Math.max(30, Math.min(500, maxWidth + padding));
      handleColumnResize(colChar, finalWidth);
  }, [activeSheet, handleColumnResize]);

  const handleFill = useCallback((sourceRange: CellId[], targetRange: CellId[]) => {
      if (!sourceRange.length || !targetRange.length) return;

      setSheets(prevSheets => prevSheets.map(sheet => {
          if (sheet.id !== activeSheetId) return sheet;
          
          const nextCells: Record<string, CellData> = { ...sheet.cells };
          const nextValidations = { ...sheet.validations };

          const sourceStart = parseCellId(sourceRange[0])!;
          const sourceEnd = parseCellId(sourceRange[sourceRange.length - 1])!;
          const targetEnd = parseCellId(targetRange[targetRange.length - 1])!;

          const sourceSet = new Set(sourceRange);
          
          targetRange.forEach(tid => {
              if (sourceSet.has(tid)) return; 
              
              const tCoord = parseCellId(tid)!;
              const height = sourceEnd.row - sourceStart.row + 1;
              const width = sourceEnd.col - sourceStart.col + 1;
              
              let rOffset = (tCoord.row - sourceStart.row) % height;
              let cOffset = (tCoord.col - sourceStart.col) % width;
              
              if (rOffset < 0) rOffset += height;
              if (cOffset < 0) cOffset += width;

              const sourceId = getCellId(sourceStart.col + cOffset, sourceStart.row + rOffset);
              const sourceCell = nextCells[sourceId] as CellData | undefined;

              if (!sourceCell) {
                  delete nextCells[tid];
                  return;
              }

              let newValue = sourceCell.raw;
              if (newValue.startsWith('=')) {
                  const rDelta = tCoord.row - (sourceStart.row + rOffset);
                  const cDelta = tCoord.col - (sourceStart.col + cOffset);
                  newValue = adjustFormulaReferences(newValue, rDelta, cDelta);
              } 
              
              const newCell: CellData = {
                  id: tid,
                  raw: newValue,
                  value: newValue, 
                  styleId: sourceCell.styleId, 
                  isCheckbox: sourceCell.isCheckbox,
                  link: sourceCell.link
              };
              
              nextCells[tid] = newCell;
              
              if (nextValidations[sourceId]) {
                  nextValidations[tid] = nextValidations[sourceId];
              }
          });

          Object.keys(nextCells).forEach(k => {
              if (nextCells[k].raw.startsWith('=')) {
                  nextCells[k].value = evaluateFormula(nextCells[k].raw, nextCells);
              }
          });

          return { ...sheet, cells: nextCells, validations: nextValidations, selectionRange: targetRange };
      }));
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
        (Object.values(copiedCells) as CellData[]).forEach((cell: CellData) => {
             const orig = parseCellId(cell.id)!;
             const targetId = getCellId(targetStart.col + (orig.col - baseCol), targetStart.row + (orig.row - baseRow));
             nextCells[targetId] = { ...cell, id: targetId };
        });
        return { ...s, cells: nextCells };
    }));
  }, [activeCell, activeSheetId]);

  // --- INSERT/DELETE/FORMAT HANDLERS (New) ---
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

  const handleInsertColumn = useCallback(() => {
      if (!activeCell) return;
      const { col: startCol } = parseCellId(activeCell)!;
      setSheets(prev => prev.map(sheet => {
          if (sheet.id !== activeSheetId) return sheet;
          const newCells: Record<string, CellData> = {};
          Object.values(sheet.cells).forEach((cell: CellData) => {
              const { col, row } = parseCellId(cell.id)!;
              if (col >= startCol) {
                  const newId = getCellId(col + 1, row);
                  newCells[newId] = { ...cell, id: newId };
              } else newCells[cell.id] = cell;
          });
          return { ...sheet, cells: newCells };
      }));
  }, [activeCell, activeSheetId]);

  const handleInsertSheet = useCallback(() => {
      handleAddSheet();
  }, [handleAddSheet]);

  const handleInsertCells = useCallback(() => {
      // Simplification: Treat as Insert Row for now, usually triggers a dialog
      handleInsertRow();
  }, [handleInsertRow]);

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

  const handleDeleteColumn = useCallback(() => {
      if (!activeCell) return;
      const { col: startCol } = parseCellId(activeCell)!;
      setSheets(prev => prev.map(sheet => {
          if (sheet.id !== activeSheetId) return sheet;
          const newCells: Record<string, CellData> = {};
          Object.values(sheet.cells).forEach((cell: CellData) => {
              const { col, row } = parseCellId(cell.id)!;
              if (col === startCol) return;
              if (col > startCol) {
                  const newId = getCellId(col - 1, row);
                  newCells[newId] = { ...cell, id: newId };
              } else newCells[cell.id] = cell;
          });
          return { ...sheet, cells: newCells };
      }));
  }, [activeCell, activeSheetId]);

  const handleDeleteSheet = useCallback(() => {
      if (sheets.length <= 1) {
          alert("A workbook must contain at least one visible worksheet.");
          return;
      }
      if (confirm("Permanently delete this sheet?")) {
          setSheets(prev => {
              const newSheets = prev.filter(s => s.id !== activeSheetId);
              setActiveSheetId(newSheets[0].id);
              return newSheets;
          });
      }
  }, [sheets.length, activeSheetId]);

  const handleDeleteCells = useCallback(() => {
      // Simplification: Treat as Delete Row
      handleDeleteRow();
  }, [handleDeleteRow]);

  // Format Handlers
  const handleFormatRowHeight = useCallback(() => {
      if (!activeCell) return;
      const { row } = parseCellId(activeCell)!;
      const current = rowHeights[row] || DEFAULT_ROW_HEIGHT;
      const input = prompt("Row Height:", String(current));
      if (input) {
          const val = parseFloat(input);
          if (!isNaN(val)) handleRowResize(row, val);
      }
  }, [activeCell, rowHeights, handleRowResize]);

  const handleFormatColWidth = useCallback(() => {
      if (!activeCell) return;
      const { col } = parseCellId(activeCell)!;
      const colChar = numToChar(col);
      const current = columnWidths[colChar] || DEFAULT_COL_WIDTH;
      const input = prompt("Column Width:", String(current));
      if (input) {
          const val = parseFloat(input);
          if (!isNaN(val)) handleColumnResize(colChar, val);
      }
  }, [activeCell, columnWidths, handleColumnResize]);

  const handleAutoFitRowHeight = useCallback(() => {
      if (!activeCell) return;
      const { row } = parseCellId(activeCell)!;
      handleRowResize(row, DEFAULT_ROW_HEIGHT); // Reset to default usually
  }, [activeCell, handleRowResize]);

  const handleAutoFitColWidth = useCallback(() => {
      if (!activeCell) return;
      const { col } = parseCellId(activeCell)!;
      handleAutoFit(col);
  }, [activeCell, handleAutoFit]);

  const handleHideRow = useCallback(() => {
      if (!activeCell) return;
      const { row } = parseCellId(activeCell)!;
      handleRowResize(row, 0);
  }, [activeCell, handleRowResize]);

  const handleHideCol = useCallback(() => {
      if (!activeCell) return;
      const { col } = parseCellId(activeCell)!;
      handleColumnResize(numToChar(col), 0);
  }, [activeCell, handleColumnResize]);

  const handleUnhideRow = useCallback(() => {
      if (!activeCell) return;
      // Heuristic: Unhide rows in range or current? Excel usually unhides rows IN selection
      // For MVP, if row height is 0, reset to default
      const { row } = parseCellId(activeCell)!;
      if ((rowHeights[row] || 0) === 0) {
          handleRowResize(row, DEFAULT_ROW_HEIGHT);
      }
  }, [activeCell, rowHeights, handleRowResize]);

  const handleUnhideCol = useCallback(() => {
      if (!activeCell) return;
      const { col } = parseCellId(activeCell)!;
      const colChar = numToChar(col);
      if ((columnWidths[colChar] || 0) === 0) {
          handleColumnResize(colChar, DEFAULT_COL_WIDTH);
      }
  }, [activeCell, columnWidths, handleColumnResize]);

  const handleRenameSheet = useCallback(() => {
      const input = prompt("Rename Sheet:", activeSheet.name);
      if (input) {
          setSheets(prev => prev.map(s => s.id === activeSheetId ? { ...s, name: input } : s));
      }
  }, [activeSheetId, activeSheet.name]);

  const handleMoveCopySheet = useCallback(() => {
      // Simple Duplicate Logic
      setSheets(prev => {
          const current = prev.find(s => s.id === activeSheetId)!;
          const copy = JSON.parse(JSON.stringify(current));
          copy.id = `sheet${Date.now()}`;
          copy.name = `${current.name} (2)`;
          return [...prev, copy];
      });
  }, [activeSheetId]);

  const handleProtectSheet = useCallback(() => {
      alert("Sheet protection enabled. (Visual only in MVP)");
  }, []);

  const handleLockCell = useCallback(() => {
      handleStyleChange('protection', { locked: true });
  }, [handleStyleChange]);

  const handleSort = useCallback((direction: 'asc' | 'desc') => {}, []);
  
  // Implemented AutoSum Logic
  const handleAutoSum = useCallback((funcName: string = 'SUM') => {
      if (!activeCell) return;

      const { row: activeRow, col: activeCol } = parseCellId(activeCell)!;
      
      // Helper to check if a cell is numeric
      const isNumericCell = (r: number, c: number) => {
          const id = getCellId(c, r);
          const cell = cells[id];
          if (!cell || !cell.value) return false;
          return !isNaN(parseFloat(String(cell.value).replace(/[^0-9.-]+/g,"")));
      };

      // Case 1: Single Selection - Auto-guess range from ACTIVE cell position
      if (!selectionRange || selectionRange.length <= 1) {
          let formulaRange = '';
          
          // Look UP first
          let startRow = activeRow - 1;
          while (startRow >= 0 && isNumericCell(startRow, activeCol)) {
              startRow--;
          }
          startRow++; // The first numeric row

          if (startRow < activeRow) {
              const startId = getCellId(activeCol, startRow);
              const endId = getCellId(activeCol, activeRow - 1);
              formulaRange = `${startId}:${endId}`;
          } else {
              // Look LEFT
              let startCol = activeCol - 1;
              while (startCol >= 0 && isNumericCell(activeRow, startCol)) {
                  startCol--;
              }
              startCol++;

              if (startCol < activeCol) {
                  const startId = getCellId(startCol, activeRow);
                  const endId = getCellId(activeCol - 1, activeRow);
                  formulaRange = `${startId}:${endId}`;
              }
          }
          
          const formula = formulaRange ? `=${funcName}(${formulaRange})` : `=${funcName}()`;
          handleCellChange(activeCell, formula);
      } 
      // Case 2: Range Selected - Sum each column below the selection
      else {
          const coords = selectionRange.map(id => parseCellId(id)!);
          const minRow = Math.min(...coords.map(c => c.row));
          const maxRow = Math.max(...coords.map(c => c.row));
          const minCol = Math.min(...coords.map(c => c.col));
          const maxCol = Math.max(...coords.map(c => c.col));

          // For each column in selection, put a sum at maxRow + 1
          const updates: Record<string, string> = {};
          
          for (let c = minCol; c <= maxCol; c++) {
              const startId = getCellId(c, minRow);
              const endId = getCellId(c, maxRow);
              const targetId = getCellId(c, maxRow + 1);
              updates[targetId] = `=${funcName}(${startId}:${endId})`;
          }

          setSheets(prevSheets => prevSheets.map(sheet => {
              if (sheet.id !== activeSheetId) return sheet;
              const nextCells = { ...sheet.cells };
              const nextDependents = { ...sheet.dependentsMap };

              Object.entries(updates).forEach(([id, formula]) => {
                  const oldCell = nextCells[id];
                  if (oldCell?.raw.startsWith('=')) {
                      const oldDeps = extractDependencies(oldCell.raw);
                      oldDeps.forEach(depId => {
                          if (nextDependents[depId]) {
                              nextDependents[depId] = nextDependents[depId].filter(d => d !== id);
                          }
                      });
                  }

                  nextCells[id] = { ...(nextCells[id] || { id }), raw: formula, value: formula }; 

                  const newDeps = extractDependencies(formula);
                  newDeps.forEach(depId => {
                      if (!nextDependents[depId]) nextDependents[depId] = [];
                      if (!nextDependents[depId].includes(id)) nextDependents[depId].push(id);
                  });
              });
              
              // Simple immediate eval for the new cells
              Object.keys(updates).forEach(id => {
                  if (nextCells[id].raw.startsWith('=')) {
                      nextCells[id].value = evaluateFormula(nextCells[id].raw, nextCells);
                  }
              });

              return { ...sheet, cells: nextCells, dependentsMap: nextDependents };
          }));
      }
  }, [activeCell, selectionRange, cells, activeSheetId, handleCellChange]);

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
          const cell: CellData = nextCells[start] || { id: start, raw: '', value: '' };
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

  const handleInsertTable = useCallback(() => {
    // Basic Table - just format as default Table Style Light 1 for now if triggered from Insert tab
    // Ideally this would open the same dialog as Format as Table
    handleFormatAsTable({
        name: 'TableStyleMedium2',
        headerBg: '#3b82f6',
        headerColor: '#ffffff',
        rowOddBg: '#eff6ff',
        rowEvenBg: '#ffffff',
        category: 'Medium'
    });
  }, []);

  const handleInsertCheckbox = useCallback(() => {
      setSheets(prev => prev.map(sheet => {
        if (sheet.id !== activeSheetId || !sheet.selectionRange) return sheet;
        const nextCells = { ...sheet.cells };
        sheet.selectionRange.forEach(id => {
           const existingVal = nextCells[id]?.value || '';
           const isChecked = ['TRUE', '1', 'YES', 'ON'].includes(String(existingVal).toUpperCase());
           
           const prevCell = nextCells[id];
           nextCells[id] = {
               ...(prevCell || { id, raw: '', value: '' }),
               isCheckbox: true,
               raw: isChecked ? 'TRUE' : 'FALSE',
               value: isChecked ? 'TRUE' : 'FALSE'
           } as CellData;
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
            const nextCells: Record<string, CellData> = { ...sheet.cells };
            let nextStyles: Record<string, CellStyle> = { ...sheet.styles };
            
            sheet.selectionRange.forEach(id => {
               const cell: CellData = nextCells[id] || { id, raw: '', value: '' };
               const currentStyle = cell.styleId ? (nextStyles[cell.styleId] || {}) : {};
               const newStyle = { ...currentStyle, color: '#2563eb', underline: true };
               const res = getStyleId(nextStyles, newStyle);
               nextStyles = res.registry;

               nextCells[id] = {
                   ...cell,
                   styleId: res.id,
                   link: url,
                   value: cell.value || url 
               };
            });
            return { ...sheet, cells: nextCells, styles: nextStyles };
        }));
    }
  }, [activeCell, activeSheetId]);

  const handleInsertComment = useCallback(() => {
    if (!activeCell) return;
    const existing = cells[activeCell]?.comment || "";
    const text = prompt("Edit Comment:", existing);
    if (text !== null) {
        setSheets(prev => prev.map(sheet => {
            if (sheet.id !== activeSheetId) return sheet;
            const nextCells: Record<string, CellData> = { ...sheet.cells };
            const cell: CellData = nextCells[activeCell] || { id: activeCell, raw: '', value: '' };
            if (text.trim() === "") {
                const { comment, ...rest } = cell;
                nextCells[activeCell] = rest;
            } else {
                nextCells[activeCell] = { ...cell, comment: text };
            }
            return { ...sheet, cells: nextCells };
        }));
    }
  }, [activeCell, activeSheetId, cells]);

  const handleDeleteComment = useCallback(() => {
        if (!activeCell) return;
        setSheets(prev => prev.map(sheet => {
            if (sheet.id !== activeSheetId) return sheet;
            const nextCells: Record<string, CellData> = { ...sheet.cells };
            const cell = nextCells[activeCell];
            if (cell && cell.comment) {
                const { comment, ...rest } = cell;
                nextCells[activeCell] = rest;
            }
            return { ...sheet, cells: nextCells };
        }));
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

  // Enhanced Find Logic for Preview
  const handleSearchAll = useCallback((query: string, matchCase: boolean) => {
    const results: { id: string, content: string }[] = [];
    if (!query) return results;
    
    const lowerQuery = matchCase ? query : query.toLowerCase();
    const maxResults = 50; 
    let count = 0;

    const ids = Object.keys(cells);
    ids.sort((a, b) => {
        const pa = parseCellId(a)!;
        const pb = parseCellId(b)!;
        if (pa.row !== pb.row) return pa.row - pb.row;
        return pa.col - pb.col;
    });

    for (const id of ids) {
        if (count >= maxResults) break;
        const cell = cells[id];
        const val = String(cell.value);
        const check = matchCase ? val : val.toLowerCase();
        
        if (check.includes(lowerQuery)) {
            results.push({ id, content: val });
            count++;
        }
    }
    return results;
  }, [cells]);

  const handleGetCellData = useCallback((id: string) => {
      const cell = cells[id];
      return cell ? { value: cell.value, raw: cell.raw } : null;
  }, [cells]);

  const handleHighlightCell = useCallback((id: string) => {
      handleCellClick(id, false);
  }, [handleCellClick]);

  const handleFind = useCallback((query: string, matchCase: boolean, matchEntire: boolean) => {
      const lowerQuery = matchCase ? query : query.toLowerCase();
      let foundId = null;
      
      const startIdx = activeCell ? (parseCellId(activeCell)?.row || 0) * 1000 + (parseCellId(activeCell)?.col || 0) : 0;
      
      const allKeys = Object.keys(cells).sort((a,b) => {
          const pa = parseCellId(a)!;
          const pb = parseCellId(b)!;
          return (pa.row * 1000 + pa.col) - (pb.row * 1000 + pb.col);
      });

      for (const id of allKeys) {
          const cell = cells[id];
          if (!cell) continue;
          const val = matchCase ? cell.value : cell.value.toLowerCase();
          
          const match = matchEntire ? val === lowerQuery : val.includes(lowerQuery);
          
          if (match) {
              const currentIdx = (parseCellId(id)?.row || 0) * 1000 + (parseCellId(id)?.col || 0);
              if (currentIdx > startIdx) {
                  foundId = id;
                  break;
              }
              if (!foundId) foundId = id; 
          }
      }

      if (foundId) handleCellClick(foundId, false);
      else alert(`Couldn't find '${query}'`);
  }, [cells, activeCell, handleCellClick]);

  const handleReplace = useCallback((query: string, replaceWith: string, matchCase: boolean, matchEntire: boolean, replaceAll: boolean) => {
      const lowerQuery = matchCase ? query : query.toLowerCase();
      let count = 0;

      setSheets(prev => prev.map(sheet => {
          if (sheet.id !== activeSheetId) return sheet;
          const nextCells = { ...sheet.cells };
          let changed = false;

          Object.keys(nextCells).forEach(id => {
              const cell = nextCells[id];
              const val = matchCase ? cell.raw : cell.raw.toLowerCase();
              let match = false;
              let newValue = cell.raw;

              if (matchEntire && val === lowerQuery) {
                  match = true;
                  newValue = replaceWith;
              } else if (!matchEntire && val.includes(lowerQuery)) {
                  match = true;
                  const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), matchCase ? 'g' : 'gi');
                  newValue = cell.raw.replace(regex, replaceWith);
              }

              if (match) {
                  if (replaceAll || (!replaceAll && count === 0)) {
                      nextCells[id] = { ...cell, raw: newValue, value: newValue }; 
                      changed = true;
                      count++;
                  }
              }
          });

          return changed ? { ...sheet, cells: nextCells } : sheet;
      }));

      if (count > 0) {
          if (!replaceAll) {
              handleFind(query, matchCase, matchEntire);
          } else {
              alert(`All done. We made ${count} replacements.`);
          }
      } else {
          alert(`Couldn't find '${query}'`);
      }
  }, [activeSheetId, handleFind]);

  const handleSelectSpecial = useCallback((type: 'formulas' | 'comments' | 'constants' | 'validation' | 'conditional' | 'blanks') => {
      const found: string[] = [];
      const isSheetScope = !selectionRange || selectionRange.length <= 1;
      const keysToSearch = isSheetScope ? Object.keys(cells) : selectionRange;

      keysToSearch.forEach(id => {
          const cell = cells[id];
          if (!cell && type !== 'blanks') return;

          switch(type) {
              case 'formulas':
                  if (cell?.raw.startsWith('=')) found.push(id);
                  break;
              case 'constants':
                  if (cell?.raw && !cell.raw.startsWith('=')) found.push(id);
                  break;
              case 'comments':
                  if (cell?.comment) found.push(id);
                  break;
              case 'validation':
                  if (validations[id]) found.push(id);
                  break;
              case 'blanks':
                  if (!cell || !cell.raw) found.push(id);
                  break;
          }
      });

      if (found.length > 0) {
          setSheets(prev => prev.map(s => s.id === activeSheetId ? { ...s, selectionRange: found, activeCell: found[0] } : s));
      } else {
          alert('No cells found.');
      }
  }, [cells, validations, selectionRange, activeSheetId]);

  const handleOpenFormatDialog = useCallback((tab: string = 'Number') => {
      // Ensure we receive a string, as events might be passed
      const targetTab = typeof tab === 'string' ? tab : 'Number';
      setFormatDialogTab(targetTab);
      setShowFormatCells(true);
  }, []);

  const handleMergeStyles = useCallback(() => {
      setShowMergeStyles(true);
  }, []);

  const handleFormatAsTable = useCallback((stylePreset: any) => {
      if (!selectionRange) return;
      // Convert selection range to string representation for dialog (e.g. A1:C5)
      const start = selectionRange[0];
      const end = selectionRange[selectionRange.length - 1];
      const rangeStr = selectionRange.length > 1 ? `${start}:${end}` : start;
      
      setCreateTableState({ isOpen: true, preset: stylePreset, range: rangeStr });
  }, [selectionRange]);

  const handleCreateTableConfirm = useCallback((rangeStr: string, hasHeaders: boolean) => {
      if (!createTableState.preset) return;
      const preset = createTableState.preset;

      // Parse range string back to coordinates
      const parts = rangeStr.split(':');
      const startId = parts[0];
      const endId = parts[1] || startId;
      
      const s = parseCellId(startId);
      const e = parseCellId(endId);
      
      if (!s || !e) return; // Invalid range

      const minCol = Math.min(s.col, e.col);
      const maxCol = Math.max(s.col, e.col);
      const minRow = Math.min(s.row, e.row);
      const maxRow = Math.max(s.row, e.row);

      const rangeCells: string[] = [];
      for (let r = minRow; r <= maxRow; r++) {
          for (let c = minCol; c <= maxCol; c++) {
              rangeCells.push(getCellId(c, r));
          }
      }

      setSheets(prev => prev.map(sheet => {
          if (sheet.id !== activeSheetId) return sheet;
          
          const nextCells: Record<string, CellData> = { ...sheet.cells };
          let nextStyles: Record<string, CellStyle> = { ...sheet.styles };

          rangeCells.forEach(id => {
              const { row } = parseCellId(id)!;
              
              // If has headers, the FIRST row of selection is the header
              const isHeader = hasHeaders && row === minRow;
              
              // Calculate relative row index for banding (0-based relative to table body)
              // If hasHeaders, body starts at minRow + 1. If not, body starts at minRow.
              const bodyRowIndex = hasHeaders ? row - (minRow + 1) : row - minRow;
              
              // If it's a header row, apply header style
              // If it's a body row (index >= 0), apply banding
              
              const cell = nextCells[id] || { id, raw: '', value: '' };
              const currentStyle = cell.styleId ? (nextStyles[cell.styleId] || {}) : {};
              
              let newStyle = { ...currentStyle };
              let filterButton = false;

              if (isHeader) {
                  newStyle.bg = preset.headerBg;
                  newStyle.color = preset.headerColor;
                  newStyle.bold = true;
                  if (preset.border) {
                      newStyle.borders = { 
                          ...(newStyle.borders || {}),
                          bottom: { style: 'thin', color: preset.border }
                      };
                  }
                  filterButton = true;
              } else if (bodyRowIndex >= 0) {
                  // Body Logic
                  const isEven = bodyRowIndex % 2 === 0; // 0, 2, 4... relative to body start
                  // Note: Excel standard banding usually starts with FIRST row of DATA being formatted if specific style,
                  // or alternating. Often "Banded Rows" means Odd/Even difference.
                  // Let's assume standard odd/even banding from the style preset.
                  // Usually first data row is "odd" visually (1st), second is "even" (2nd).
                  // So index 0 is Odd, index 1 is Even.
                  
                  const isOddRow = bodyRowIndex % 2 === 0; // 0th index = 1st row = Odd
                  
                  newStyle.bg = isOddRow ? preset.rowOddBg : preset.rowEvenBg;
                  
                  // Text color logic
                  if (!preset.rowEvenBg && !preset.rowOddBg) {
                      // Transparent body, keep existing
                  } else {
                      newStyle.color = '#000000'; // Default black for data
                  }
                  
                  // Clean up filter button if overwriting existing header
                  filterButton = false;
              }

              const res = getStyleId(nextStyles, newStyle);
              nextStyles = res.registry;
              
              nextCells[id] = { 
                  ...cell, 
                  styleId: res.id,
                  filterButton: filterButton ? true : undefined // Set or clear filter button
              };
          });

          return { ...sheet, cells: nextCells, styles: nextStyles };
      }));
  }, [activeSheetId, createTableState.preset]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
        
        if (e.ctrlKey || e.metaKey) {
            if (e.key === 'f') {
                e.preventDefault();
                setFindReplaceState({ open: true, mode: 'find' });
            } else if (e.key === 'h') {
                e.preventDefault();
                setFindReplaceState({ open: true, mode: 'replace' });
            } else if (e.key === 'g') {
                e.preventDefault();
                setFindReplaceState({ open: true, mode: 'goto' });
            }
        }

        if (e.key === 'Delete' || e.key === 'Backspace') {
             if (selectionRange && selectionRange.length > 0) {
                 e.preventDefault();
                 selectionRange.forEach(id => {
                     handleCellChange(id, ''); 
                 });
             } else if (activeCell) {
                 e.preventDefault();
                 handleCellChange(activeCell, '');
             }
        }
        
        if (e.key === ' ' && activeCell) {
             const cell = cells[activeCell];
             if (cell && cell.isCheckbox) {
                 e.preventDefault(); 
                 const currentVal = String(cell.value).toUpperCase() === 'TRUE';
                 handleCellChange(activeCell, currentVal ? 'FALSE' : 'TRUE');
             }
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeCell, selectionRange, cells, handleCellChange]);

  return (
    <div className="flex flex-col h-[100dvh] w-screen bg-slate-50 overflow-hidden font-sans text-slate-900 relative">
      <div className="flex-shrink-0 z-[60]">
        <Suspense fallback={<ToolbarSkeleton />}>
          <Toolbar 
            currentStyle={activeStyle}
            onToggleStyle={handleStyleChange}
            onApplyStyle={handleApplyFullStyle}
            onExport={handleExport}
            onClear={handleClear}
            onResetLayout={handleResetLayout}
            onCopy={handleCopy}
            onCut={handleCut}
            onPaste={handlePaste}
            onAutoSum={handleAutoSum}
            // Cells Group Handlers
            onInsertRow={handleInsertRow}
            onInsertColumn={handleInsertColumn}
            onInsertSheet={handleInsertSheet}
            onInsertCells={handleInsertCells}
            onDeleteRow={handleDeleteRow}
            onDeleteColumn={handleDeleteColumn}
            onDeleteSheet={handleDeleteSheet}
            onDeleteCells={handleDeleteCells}
            // Format Menu Handlers
            onFormatRowHeight={handleFormatRowHeight}
            onFormatColWidth={handleFormatColWidth}
            onAutoFitRowHeight={handleAutoFitRowHeight}
            onAutoFitColWidth={handleAutoFitColWidth}
            onHideRow={handleHideRow}
            onHideCol={handleHideCol}
            onUnhideRow={handleUnhideRow}
            onUnhideCol={handleUnhideCol}
            onRenameSheet={handleRenameSheet}
            onMoveCopySheet={handleMoveCopySheet}
            onProtectSheet={handleProtectSheet}
            onLockCell={handleLockCell}
            onOpenFormatDialog={handleOpenFormatDialog}
            
            onSort={handleSort}
            onMergeCenter={handleMergeCenter}
            onDataValidation={handleDataValidation}
            onToggleAI={() => setShowAI(true)}
            onInsertTable={handleInsertTable}
            onInsertCheckbox={handleInsertCheckbox}
            onInsertLink={handleInsertLink}
            onInsertComment={handleInsertComment}
            onDeleteComment={handleDeleteComment}
            onFindReplace={(mode) => setFindReplaceState({ open: true, mode })}
            onSelectSpecial={handleSelectSpecial}
            onMergeStyles={handleMergeStyles}
            onFormatAsTable={handleFormatAsTable}
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
              onFill={handleFill}
              onAutoFit={handleAutoFit}
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
            initialTab={formatDialogTab}
        />
      </Suspense>

      <Suspense fallback={null}>
        <FindReplaceDialog 
            isOpen={findReplaceState.open}
            initialMode={findReplaceState.mode}
            onClose={() => setFindReplaceState(prev => ({ ...prev, open: false }))}
            onFind={handleFind}
            onReplace={handleReplace}
            onGoTo={handleNameBoxSubmit}
            onSearchAll={handleSearchAll}
            onGetCellData={handleGetCellData}
            onHighlight={handleHighlightCell}
        />
      </Suspense>

      <Suspense fallback={null}>
        <MergeStylesDialog 
            isOpen={showMergeStyles}
            onClose={() => setShowMergeStyles(false)}
        />
      </Suspense>

      <Suspense fallback={null}>
        <CreateTableDialog 
            isOpen={createTableState.isOpen}
            initialRange={createTableState.range}
            onClose={() => setCreateTableState(prev => ({ ...prev, isOpen: false }))}
            onConfirm={handleCreateTableConfirm}
        />
      </Suspense>
    </div>
  );
};

export default App;
