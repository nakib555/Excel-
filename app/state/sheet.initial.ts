
import { CellId, CellData, CellStyle, Sheet } from '../../types';
import { evaluateFormula, extractDependencies, getStyleId } from '../../utils';

interface InitialData {
    id: string;
    val: string;
    style?: CellStyle;
    filterButton?: boolean;
    visualization?: CellData['visualization'];
}

export const generateSparseData = (): { cells: Record<CellId, CellData>, dependentsMap: Record<CellId, CellId[]>, styles: Record<string, CellStyle> } => {
    const cells: Record<CellId, CellData> = {};
    const dependentsMap: Record<CellId, CellId[]> = {};
    let styles: Record<string, CellStyle> = {};
    
    // The "UsedRange" data
    const dataset: InitialData[] = [
      { id: "A1", val: "Product Analysis", style: { bold: true, fontSize: 16, color: '#1e293b' } },
      
      { id: "A3", val: "Item", style: { bold: true, bg: '#f8fafc', color: '#64748b', align: 'left', borderBottom: '2px solid #e2e8f0' } as any },
      { id: "B3", val: "Q1 Sales", style: { bold: true, bg: '#f8fafc', color: '#64748b', align: 'right', borderBottom: '2px solid #e2e8f0' } as any },
      { id: "C3", val: "Q2 Sales", style: { bold: true, bg: '#f8fafc', color: '#64748b', align: 'right', borderBottom: '2px solid #e2e8f0' } as any },
      { id: "D3", val: "Growth", style: { bold: true, bg: '#f8fafc', color: '#64748b', align: 'right', borderBottom: '2px solid #e2e8f0' } as any },
      { id: "E3", val: "Trend (6 Mo)", style: { bold: true, bg: '#f8fafc', color: '#64748b', align: 'center', borderBottom: '2px solid #e2e8f0' } as any },
      { id: "F3", val: "Inventory", style: { bold: true, bg: '#f8fafc', color: '#64748b', align: 'left', borderBottom: '2px solid #e2e8f0' } as any },
      { id: "G3", val: "Rating", style: { bold: true, bg: '#f8fafc', color: '#64748b', align: 'center', borderBottom: '2px solid #e2e8f0' } as any },
      
      // Row 4
      { id: "A4", val: "Quantum Laptop" }, 
      { id: "B4", val: "24500", style: { format: 'currency', decimalPlaces: 0 } }, 
      { id: "C4", val: "28900", style: { format: 'currency', decimalPlaces: 0 } }, 
      { id: "D4", val: "=(C4-B4)/B4", style: { format: 'percent', bold: true, color: '#10b981' } },
      { id: "E4", val: "12,15,13,18,22,25", visualization: { type: 'sparkline', subtype: 'line', color: '#2563eb' } },
      { id: "F4", val: "85", visualization: { type: 'dataBar', color: '#3b82f6', max: 100 } },
      { id: "G4", val: "4.5", visualization: { type: 'rating' } },
      
      // Row 5
      { id: "A5", val: "Ergo Mouse" }, 
      { id: "B5", val: "4200", style: { format: 'currency', decimalPlaces: 0 } }, 
      { id: "C5", val: "3800", style: { format: 'currency', decimalPlaces: 0 } }, 
      { id: "D5", val: "=(C5-B5)/B5", style: { format: 'percent', bold: true, color: '#ef4444' } },
      { id: "E5", val: "45,42,40,38,35,30", visualization: { type: 'sparkline', subtype: 'line', color: '#ef4444' } },
      { id: "F5", val: "32", visualization: { type: 'dataBar', color: '#f59e0b', max: 100 } },
      { id: "G5", val: "3.2", visualization: { type: 'rating' } },
      
      // Row 6
      { id: "A6", val: "4K Monitor" }, 
      { id: "B6", val: "15600", style: { format: 'currency', decimalPlaces: 0 } }, 
      { id: "C6", val: "18200", style: { format: 'currency', decimalPlaces: 0 } }, 
      { id: "D6", val: "=(C6-B6)/B6", style: { format: 'percent', bold: true, color: '#10b981' } },
      { id: "E6", val: "10,12,15,14,28,32", visualization: { type: 'sparkline', subtype: 'column', color: '#8b5cf6' } },
      { id: "F6", val: "64", visualization: { type: 'dataBar', color: '#8b5cf6', max: 100 } },
      { id: "G6", val: "4.8", visualization: { type: 'rating' } },

      // Row 7
      { id: "A7", val: "Mech Keyboard" }, 
      { id: "B7", val: "8900", style: { format: 'currency', decimalPlaces: 0 } }, 
      { id: "C7", val: "9100", style: { format: 'currency', decimalPlaces: 0 } }, 
      { id: "D7", val: "=(C7-B7)/B7", style: { format: 'percent', bold: true, color: '#10b981' } },
      { id: "E7", val: "20,22,21,24,23,25", visualization: { type: 'sparkline', subtype: 'line', color: '#10b981' } },
      { id: "F7", val: "92", visualization: { type: 'dataBar', color: '#10b981', max: 100 } },
      { id: "G7", val: "4.0", visualization: { type: 'rating' } },
      
      // Row 8
      { id: "A8", val: "Noise Cancel HP" }, 
      { id: "B8", val: "6500", style: { format: 'currency', decimalPlaces: 0 } }, 
      { id: "C8", val: "5900", style: { format: 'currency', decimalPlaces: 0 } }, 
      { id: "D8", val: "=(C8-B8)/B8", style: { format: 'percent', bold: true, color: '#ef4444' } },
      { id: "E8", val: "5,-2,3,-4,2,-1", visualization: { type: 'sparkline', subtype: 'winloss', color: '#6366f1' } },
      { id: "F8", val: "15", visualization: { type: 'dataBar', color: '#ef4444', max: 100 } },
      { id: "G8", val: "2.5", visualization: { type: 'rating' } },
      
      { id: "C9", val: "Total Sales", style: { bold: true, align: 'right' } }, 
      { id: "D9", val: "=SUM(C4:C8)", style: { bold: true, color: '#0f172a', bg: '#f1f5f9', format: 'currency', decimalPlaces: 0, borderTop: '2px solid #0f172a', borderBottom: '4px double #0f172a' } as any },
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
        styleId,
        filterButton: s.filterButton,
        visualization: s.visualization
      };
    });
    
    // Initial calculation pass
    Object.keys(cells).forEach(key => {
        const cell = cells[key];
        if (cell.raw.startsWith('=')) {
            // Pass key as currentId
            cell.value = evaluateFormula(cell.raw, cells, key);
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

export const getInitialSheets = (): Sheet[] => {
    const { cells, dependentsMap, styles } = generateSparseData();
    return [{
      id: 'sheet1',
      name: 'Dashboard',
      cells,
      styles,
      merges: [],
      tables: {},
      validations: {},
      dependentsMap,
      activeCell: "A4",
      selectionAnchor: "A4",
      selectionRange: ["A4"],
      columnWidths: { "A": 140, "E": 140, "F": 120, "G": 100 },
      rowHeights: { 3: 32 }
    }];
};
