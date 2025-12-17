

export type CellId = string; // e.g., "A1", "B2"

export interface CellStyle {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  align?: 'left' | 'center' | 'right';
  color?: string;
  bg?: string;
  fontSize?: number;
  wrapText?: boolean;
  format?: 'general' | 'currency' | 'percent' | 'comma' | 'number';
  decimalPlaces?: number;
  textRotation?: number; // 0 to 180 (or -90 to 90). Excel usually uses -90 to 90.
  verticalText?: boolean;
}

export interface CellData {
  id: CellId;
  raw: string;      // The user input (e.g., "=SUM(A1:A5)" or "100")
  value: string;    // The computed display value (e.g., "500")
  styleId?: string; // Memory Optimization: Reference to a style in the Sheet's style registry
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
