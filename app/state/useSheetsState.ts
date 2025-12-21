
import React, { useState, useCallback } from 'react';
import { GridSize, Sheet } from '../../types';
import { getInitialSheets } from './sheet.initial';
import { INITIAL_ROWS, INITIAL_COLS } from '../constants/grid.constants';

export const useSheetsState = () => {
  // History State
  const [history, setHistory] = useState<{
    past: Sheet[][];
    present: Sheet[];
    future: Sheet[][];
  }>({
    past: [],
    present: getInitialSheets(),
    future: []
  });

  const [activeSheetId, setActiveSheetId] = useState<string>('sheet1');
  const [gridSize, setGridSize] = useState<GridSize>({ rows: INITIAL_ROWS, cols: INITIAL_COLS });
  const [zoom, setZoom] = useState<number>(1);

  // Smart setSheets that handles history
  const setSheets = useCallback((action: React.SetStateAction<Sheet[]> | Sheet[]) => {
      setHistory(curr => {
          const newSheets = typeof action === 'function' ? (action as (prevState: Sheet[]) => Sheet[])(curr.present) : action;
          
          if (newSheets === curr.present) return curr;

          // Smart History: Only push to 'past' if structural/content data changed.
          // Ignore purely navigational changes (activeCell, selectionRange) to prevent
          // the undo stack from filling up with clicks.
          const contentChanged = newSheets.some((s, i) => {
              const old = curr.present[i];
              if (!old) return true; // Sheet added/removed
              
              // Check for reference equality on heavy objects
              // Handlers must ensure they create new object references when modifying these
              return s.cells !== old.cells || 
                     s.styles !== old.styles || 
                     s.merges !== old.merges ||
                     s.tables !== old.tables ||
                     s.validations !== old.validations ||
                     s.columnWidths !== old.columnWidths || 
                     s.rowHeights !== old.rowHeights;
          });

          if (!contentChanged) {
              // Just update present state (e.g. selection change), preserve history
              return {
                  ...curr,
                  present: newSheets
              };
          }

          // Content changed: Push to history
          return {
              past: [...curr.past, curr.present].slice(-30), // Limit history to 30 steps
              present: newSheets,
              future: [] // Clear redo stack on new change
          };
      });
  }, []);

  const undo = useCallback(() => {
      setHistory(curr => {
          if (curr.past.length === 0) return curr;
          const previous = curr.past[curr.past.length - 1];
          const newPast = curr.past.slice(0, curr.past.length - 1);
          return {
              past: newPast,
              present: previous,
              future: [curr.present, ...curr.future]
          };
      });
  }, []);

  const redo = useCallback(() => {
      setHistory(curr => {
          if (curr.future.length === 0) return curr;
          const next = curr.future[0];
          const newFuture = curr.future.slice(1);
          return {
              past: [...curr.past, curr.present],
              present: next,
              future: newFuture
          };
      });
  }, []);

  return {
    sheets: history.present,
    setSheets,
    activeSheetId,
    setActiveSheetId,
    gridSize,
    setGridSize,
    zoom,
    setZoom,
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0
  };
};
