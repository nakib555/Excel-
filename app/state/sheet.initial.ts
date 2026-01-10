
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
      { id: "A1", val: "Item", style: { bold: true, bg: '#f1f5f9', color: '#475569', align: 'center', verticalAlign: 'middle' } },
      { id: "B1", val: "Cost", style: { bold: true, bg: '#f1f5f9', color: '#475569', format: 'currency', align: 'center' } },
      { id: "C1", val: "Qty", style: { bold: true, bg: '#f1f5f9', color: '#475569', align: 'center' } },
      { id: "D1", val: "Total", style: { bold: true, bg: '#f1f5f9', color: '#475569', format: 'currency', align: 'center' } },
      { id: "E1", val: "Trend", style: { bold: true, bg: '#f1f5f9', color: '#475569', align: 'center' } },
      { id: "F1", val: "Performance", style: { bold: true, bg: '#f1f5f9', color: '#475569', align: 'center' } },
      { id: "G1", val: "Rating", style: { bold: true, bg: '#f1f5f9', color: '#475569', align: 'center' } },
      
      { id: "A2", val: "MacBook Pro" }, 
      { id: "B2", val: "2400", style: { format: 'currency', decimalPlaces: 0 } }, 
      { id: "C2", val: "2", style: { align: 'center' } }, 
      { id: "D2", val: "=B2*C2", style: { format: 'currency', decimalPlaces: 0 } },
      { id: "E2", val: "10,20,15,40,30,60", visualization: { type: 'sparkline', subtype: 'line', color: '#2563eb' } },
      { id: "F2", val: "85", visualization: { type: 'dataBar', color: '#3b82f6', max: 100 } },
      { id: "G2", val: "5", visualization: { type: 'rating' } },
      
      { id: "A3", val: "Monitor" }, 
      { id: "B3", val: "500", style: { format: 'currency', decimalPlaces: 0 } }, 
      { id: "C3", val: "4", style: { align: 'center' } }, 
      { id: "D3", val: "=B3*C3", style: { format: 'currency', decimalPlaces: 0 } },
      { id: "E3", val: "50,40,60,20,10", visualization: { type: 'sparkline', subtype: 'column', color: '#f59e0b' } },
      { id: "F3", val: "45", visualization: { type: 'dataBar', color: '#f59e0b', max: 100 } },
      { id: "G3", val: "3", visualization: { type: 'rating' } },
      
      { id: "A4", val: "Keyboard" }, 
      { id: "B4", val: "150", style: { format: 'currency', decimalPlaces: 0 } }, 
      { id: "C4", val: "5", style: { align: 'center' } }, 
      { id: "D4", val: "=B4*C4", style: { format: 'currency', decimalPlaces: 0 } },
      { id: "E4", val: "10,12,15,14,18,20", visualization: { type: 'sparkline', subtype: 'line', color: '#10b981' } },
      { id: "F4", val: "92", visualization: { type: 'dataBar', color: '#10b981', max: 100 } },
      { id: "G4", val: "4", visualization: { type: 'rating' } },
      
      { id: "C5", val: "Grand Total", style: { bold: true, align: 'right' } }, 
      { id: "D5", val: "=SUM(D2:D4)", style: { bold: true, color: '#059669', bg: '#ecfdf5', format: 'currency', decimalPlaces: 0 } },
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
      name: 'Budget 2024',
      cells,
      styles,
      merges: [],
      tables: {},
      validations: {},
      dependentsMap,
      activeCell: "A1",
      selectionAnchor: "A1",
      selectionRange: ["A1"],
      columnWidths: { "E": 140, "F": 120, "G": 100 },
      rowHeights: {}
    }];
};
