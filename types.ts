
export type CellId = string; // e.g., "A1", "B2"

export interface CellStyle {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  align?: 'left' | 'center' | 'right';
  color?: string;
  bg?: string;
  fontSize?: number;
}

export interface CellData {
  id: CellId;
  raw: string;      // The user input (e.g., "=SUM(A1:A5)" or "100")
  value: string;    // The computed display value (e.g., "500")
  style: CellStyle;
  image?: string;   // Base64 data URI for cell image
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
  activeCell: CellId | null;
  selectionRange: CellId[] | null;
}

export type GridSize = {
  rows: number;
  cols: number;
};
