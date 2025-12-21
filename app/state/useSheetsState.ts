
import { useState } from 'react';
import { GridSize, Sheet } from '../../types';
import { getInitialSheets } from './sheet.initial';
import { INITIAL_ROWS, INITIAL_COLS } from '../constants/grid.constants';

export const useSheetsState = () => {
  const [sheets, setSheets] = useState<Sheet[]>(getInitialSheets);
  const [activeSheetId, setActiveSheetId] = useState<string>('sheet1');
  const [gridSize, setGridSize] = useState<GridSize>({ rows: INITIAL_ROWS, cols: INITIAL_COLS });
  const [zoom, setZoom] = useState<number>(1);

  return {
    sheets,
    setSheets,
    activeSheetId,
    setActiveSheetId,
    gridSize,
    setGridSize,
    zoom,
    setZoom
  };
};
