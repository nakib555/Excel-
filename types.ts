

export type CellId = string; // e.g., "A1", "B2"

export interface CellBorder {
  style: 'thin' | 'medium' | 'thick' | 'dashed' | 'dotted' | 'double' | 'none';
  color: string;
}

export interface CellStyle {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  align?: 'left' | 'center' | 'right' | 'justify' | 'fill' | 'centerAcross' | 'distributed';
  verticalAlign?: 'top' | 'middle' | 'bottom' | 'justify' | 'distributed';
  indent?: number; // Indentation level (0, 1, 2...)
  color?: string;
  bg?: string;
  fontFamily?: string;
  fontSize?: number;
  wrapText?: boolean;
  shrinkToFit?: boolean; // Scales text down to fit cell width
  mergeCells?: boolean;
  textDirection?: 'context' | 'ltr' | 'rtl';
  format?: 'general' | 'number' | 'currency' | 'accounting' | 'shortDate' | 'longDate' | 'time' | 'percent' | 'fraction' | 'scientific' | 'text' | 'comma' | 'custom';
  formatString?: string; // For custom formats
  currencySymbol?: string; // 'USD', 'EUR', 'GBP', 'CNY', etc.
  decimalPlaces?: number;
  textRotation?: number; // 0 to 180 (or -90 to 90). Excel usually uses -90 to 90.
  verticalText?: boolean;
  borders?: {
    top?: CellBorder;
    bottom?: CellBorder;
    left?: CellBorder;
    right?: CellBorder;
    diagonalDown?: CellBorder;
    diagonalUp?: CellBorder;
  };
  protection?: {
    locked?: boolean;
    hidden?: boolean;
  };
}

export interface CellData {
  id: CellId;
  raw: string;      // The user input (e.g., "=SUM(A1:A5)" or "100")
  value: string;    // The computed display value (e.g., "500")
  styleId?: string; // Memory Optimization: Reference to a style in the Sheet's style registry
  isCheckbox?: boolean; // If true, renders as a checkbox
  link?: string;    // URL if the cell is a hyperlink
  comment?: string; // Comment text
}

export interface ValidationRule {
  type: 'list';
  options: string[];
}

export interface SheetState {
  cells: Record<CellId, CellData>;
  selectedCell: CellId | null;
  selectionRange: CellId[] | null; // Array of CellIds in current selection
  activeCell: CellId | null;       // The cell currently being edited or primary focus
  columnWidths: Record<string, number>;
  rowHeights: Record<number, number>;
}

export interface Sheet {
  id: string;
  name: string;
  cells: Record<CellId, CellData>;
  styles: Record<string, CellStyle>; // Registry of unique styles (Flyweight pattern)
  merges: string[]; // Array of range strings e.g. ["A1:B2"]
  validations: Record<CellId, ValidationRule>;
  dependentsMap: Record<CellId, CellId[]>; // Dependency Graph: Cell -> [Dependents]
  activeCell: CellId | null;
  selectionRange: CellId[] | null;
  columnWidths: Record<string, number>;
  rowHeights: Record<number, number>;
}

export type GridSize = {
  rows: number;
  cols: number;
};