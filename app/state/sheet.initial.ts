
import { CellId, CellData, CellStyle, Sheet } from '../../types';
import { evaluateFormula, extractDependencies, getStyleId, updateCellInHF } from '../../utils';

interface InitialData {
    id: string;
    val: string;
    style?: CellStyle;
    filterButton?: boolean;
}

export const generateSparseData = (sheetName: string): { cells: Record<CellId, CellData>, dependentsMap: Record<CellId, CellId[]>, styles: Record<string, CellStyle> } => {
    const cells: Record<CellId, CellData> = {};
    const dependentsMap: Record<CellId, CellId[]> = {};
    let styles: Record<string, CellStyle> = {};
    
    // The "UsedRange" data
    const dataset: InitialData[] = [
      { id: "A1", val: "Item", style: { bold: true, bg: '#f1f5f9', color: '#475569', align: 'center', verticalAlign: 'middle' } },
      { id: "B1", val: "Cost", style: { bold: true, bg: '#f1f5f9', color: '#475569', format: 'currency', align: 'center' } },
      { id: "C1", val: "Qty", style: { bold: true, bg: '#f1f5f9', color: '#475569', align: 'center' } },
      { id: "D1", val: "Total", style: { bold: true, bg: '#f1f5f9', color: '#475569', format: 'currency', align: 'center' } },
      
      { id: "A2", val: "MacBook Pro" }, 
      { id: "B2", val: "2400", style: { format: 'currency', decimalPlaces: 0 } }, 
      { id: "C2", val: "2", style: { align: 'center' } }, 
      { id: "D2", val: "=B2*C2", style: { format: 'currency', decimalPlaces: 0 } },
      
      { id: "A3", val: "Monitor" }, 
      { id: "B3", val: "500", style: { format: 'currency', decimalPlaces: 0 } }, 
      { id: "C3", val: "4", style: { align: 'center' } }, 
      { id: "D3", val: "=B3*C3", style: { format: 'currency', decimalPlaces: 0 } },
      
      { id: "A4", val: "Keyboard" }, 
      { id: "B4", val: "150", style: { format: 'currency', decimalPlaces: 0 } }, 
      { id: "C4", val: "5", style: { align: 'center' } }, 
      { id: "D4", val: "=B4*C4", style: { format: 'currency', decimalPlaces: 0 } },
      
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
        filterButton: s.filterButton
      };
    });
    
    // Initial calculation pass
    Object.keys(cells).forEach(key => {
        const cell = cells[key];
        if (cell.raw.startsWith('=')) {
            // Pass key as currentId and sheetName
            cell.value = evaluateFormula(cell.raw, cells, key, sheetName);
            const deps = extractDependencies(cell.raw);
            deps.forEach(dep => {
                if (!dependentsMap[dep]) dependentsMap[dep] = [];
                if (!dependentsMap[dep].includes(key)) dependentsMap[dep] = [key];
                else if (!dependentsMap[dep].includes(key)) dependentsMap[dep].push(key);
            });
        } else {
            // Also register non-formula values to HF
            updateCellInHF(key, cell.raw, sheetName);
        }
    });
    
    return { cells, dependentsMap, styles };
};

export const getInitialSheets = (): Sheet[] => {
    const name = 'Budget 2024';
    const { cells, dependentsMap, styles } = generateSparseData(name);
    return [{
      id: 'sheet1',
      name: name,
      cells,
      styles,
      merges: [],
      tables: {},
      validations: {},
      dependentsMap,
      activeCell: "A1",
      selectionAnchor: "A1",
      selectionRange: ["A1"],
      columnWidths: {},
      rowHeights: {}
    }];
};
