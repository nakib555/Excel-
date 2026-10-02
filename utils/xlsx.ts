import * as XLSX from 'xlsx';
import { Sheet, CellData } from '../types';
import { parseCellId, getCellId } from './helpers';

/**
 * Exports the application sheets into a native multi-sheet Excel (.xlsx) file.
 * Automatically preserves plain-values and maps live formulas natively so they are editable in MS Excel/Google Sheets.
 */
export const exportToXlsx = (sheets: Sheet[], filename: string = 'workbook.xlsx') => {
    try {
        const wb = XLSX.utils.book_new();

        sheets.forEach(sheet => {
            let maxRow = 0;
            let maxCol = 0;
            let hasData = false;

            Object.keys(sheet.cells).forEach(cellId => {
                const coords = parseCellId(cellId);
                if (coords) {
                    hasData = true;
                    maxRow = Math.max(maxRow, coords.row);
                    maxCol = Math.max(maxCol, coords.col);
                }
            });

            // Initialize sheet 2D array matrix with empty values
            const matrix: any[][] = [];
            for (let r = 0; r <= maxRow; r++) {
                matrix[r] = [];
                for (let c = 0; c <= maxCol; c++) {
                    const cellId = getCellId(c, r);
                    const cell = sheet.cells[cellId];
                    
                    if (cell) {
                        const rawStr = String(cell.raw || '');
                        if (rawStr.startsWith('=')) {
                            // Extract formula without leading '=' for SheetJS native support
                            const formulaExpr = rawStr.substring(1).toUpperCase();
                            matrix[r][c] = { f: formulaExpr, v: cell.value };
                        } else {
                            // Automatically convert to numbers to match natural Excel datatypes
                            const numValue = Number(rawStr);
                            if (rawStr !== '' && !isNaN(numValue)) {
                                matrix[r][c] = numValue;
                            } else if (rawStr === 'true' || rawStr === 'TRUE') {
                                matrix[r][c] = true;
                            } else if (rawStr === 'false' || rawStr === 'FALSE') {
                                matrix[r][c] = false;
                            } else {
                                matrix[r][c] = rawStr;
                            }
                        }
                    } else {
                        matrix[r][c] = '';
                    }
                }
            }

            // Fallback for completely empty sheets
            const ws = hasData && matrix.length > 0 
                ? XLSX.utils.aoa_to_sheet(matrix)
                : XLSX.utils.aoa_to_sheet([['']]);

            XLSX.utils.book_append_sheet(wb, ws, sheet.name);
        });

        XLSX.writeFile(wb, filename);
    } catch (err) {
        console.error("XLSX Export Error:", err);
        alert("Failed to export workbook. Make sure SheetJS is loaded properly.");
    }
};

/**
 * Reads a native Excel workbook and converts all sheets into structured 2D matrices.
 * Native Excel formulas are accurately mapped with leading '=' so our local engine processes and evaluates them.
 */
export const importXlsx = (file: File): Promise<Record<string, string[][]>> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const result: Record<string, string[][]> = {};

                workbook.SheetNames.forEach(sheetName => {
                    const worksheet = workbook.Sheets[sheetName];
                    const ref = worksheet['!ref'] || 'A1:A1';
                    const range = XLSX.utils.decode_range(ref);
                    const rows: string[][] = [];

                    for (let r = 0; r <= range.e.r; r++) {
                        const row: string[] = [];
                        for (let c = 0; c <= range.e.c; c++) {
                            const cellAddress = XLSX.utils.encode_cell({ r, c });
                            const cell = worksheet[cellAddress];
                            if (cell) {
                                if (cell.f) {
                                    // Append formula prefix so our parser handles recalculations
                                    row.push('=' + cell.f);
                                } else if (cell.v !== undefined && cell.v !== null) {
                                    row.push(String(cell.v));
                                } else {
                                    row.push('');
                                }
                            } else {
                                row.push('');
                            }
                        }
                        rows.push(row);
                    }
                    result[sheetName] = rows;
                });

                resolve(result);
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = (err) => reject(err);
        reader.readAsArrayBuffer(file);
    });
};
