import React, { useState, useCallback, useMemo } from 'react';
import Toolbar from './components/Toolbar';
import FormulaBar from './components/FormulaBar';
import Grid from './components/Grid';
import SheetTabs from './components/SheetTabs';
import { CellId, CellData, CellStyle, GridSize, Sheet } from './types';
import { evaluateFormula } from './utils/evaluator';
import { getRange } from './utils/helpers';
import { Layout, Monitor } from 'lucide-react';

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
  const [sheets, setSheets] = useState<Sheet[]>([
    {
      id: 'sheet1',
      name: 'Budget 2024',
      cells: generateInitialData(),
      activeCell: "A1",
      selectionRange: ["A1"]
    }
  ]);
  const [activeSheetId, setActiveSheetId] = useState<string>('sheet1');
  const [gridSize] = useState<GridSize>({ rows: INITIAL_ROWS, cols: INITIAL_COLS });
  
  const activeSheet = useMemo(() => 
    sheets.find(s => s.id === activeSheetId) || sheets[0], 
  [sheets, activeSheetId]);

  const cells = activeSheet.cells;
  const activeCell = activeSheet.activeCell;
  const selectionRange = activeSheet.selectionRange;

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

  const handleExport = () => {
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
  };

  const handleClear = () => {
    if (confirm(`Are you sure you want to clear the entire "${activeSheet.name}"?`)) {
        setSheets(prev => prev.map(s => {
          if (s.id !== activeSheetId) return s;
          return { ...s, cells: {}, activeCell: 'A1', selectionRange: ['A1'] };
        }));
    }
  };

  const handleAddSheet = () => {
    const newId = `sheet${Date.now()}`;
    const num = sheets.length + 1;
    const newSheet: Sheet = {
      id: newId,
      name: `Sheet ${num}`,
      cells: {},
      activeCell: 'A1',
      selectionRange: ['A1']
    };
    setSheets([...sheets, newSheet]);
    setActiveSheetId(newId);
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-50 font-sans text-slate-900 overflow-hidden">
      <Toolbar 
        currentStyle={activeStyle}
        onToggleStyle={handleStyleChange}
        onExport={handleExport}
        onClear={handleClear}
        onResetLayout={() => {}}
      />
      
      <FormulaBar 
        selectedCell={activeCell}
        value={activeCell ? (cells[activeCell]?.raw || '') : ''}
        onChange={(val) => activeCell && handleCellChange(activeCell, val)}
        onSubmit={() => {}}
      />
      
      <div className="flex-1 overflow-hidden relative flex flex-col z-0">
        <Grid 
          size={gridSize}
          cells={cells}
          activeCell={activeCell}
          selectionRange={selectionRange}
          columnWidths={{}}
          rowHeights={{}} 
          onCellClick={handleCellClick}
          onCellDoubleClick={(id) => handleCellClick(id, false)}
          onCellChange={handleCellChange}
        />
      </div>

      <SheetTabs 
        sheets={sheets}
        activeSheetId={activeSheetId}
        onSwitch={setActiveSheetId}
        onAdd={handleAddSheet}
      />
      
      {/* Footer Status Bar - Modernized */}
      <div className="h-7 bg-emerald-700 text-white flex items-center justify-between px-3 text-[11px] select-none shadow-[0_-1px_2px_rgba(0,0,0,0.1)] z-50">
        <div className="flex items-center gap-4">
            <span className="font-semibold opacity-90">Ready</span>
            {selectionRange && selectionRange.length > 1 && (
                <span className="opacity-80 border-l border-white/20 pl-4">
                    {selectionRange.length} cells selected
                </span>
            )}
        </div>
        <div className="flex items-center gap-4 opacity-90">
             <div className="flex items-center gap-1 cursor-pointer hover:bg-white/10 px-1 rounded">
                <Layout size={12} />
                <span className="hidden sm:inline">Normal View</span>
             </div>
             <div className="w-[1px] h-3 bg-white/20"></div>
             <span>100%</span>
             <div className="w-20 h-1 bg-white/20 rounded-full relative ml-1">
                 <div className="absolute left-1/2 -top-1 w-3 h-3 bg-white rounded-full shadow-sm -ml-1.5 cursor-pointer hover:scale-110 transition-transform"></div>
             </div>
        </div>
      </div>
    </div>
  );
};

export default App;