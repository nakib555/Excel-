
import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { GridSize, Sheet, Revision } from '../../types';
import { getInitialSheets } from './sheet.initial';
import { INITIAL_ROWS, INITIAL_COLS } from '../constants/grid.constants';

export const useSheetsState = () => {
  // History State (Undo/Redo)
  const [history, setHistory] = useState<{
    past: Sheet[][];
    present: Sheet[];
    future: Sheet[][];
  }>({
    past: [],
    present: getInitialSheets(),
    future: []
  });

  // Revisions (Named Snapshots / Version History)
  const [revisions, setRevisions] = useState<Revision[]>([]);
  
  // Preview Mode State
  const [previewRevisionId, setPreviewRevisionId] = useState<string | null>(null);

  const [activeSheetId, setActiveSheetId] = useState<string>('sheet1');
  const [gridSize, setGridSize] = useState<GridSize>({ rows: INITIAL_ROWS, cols: INITIAL_COLS });
  const [zoom, setZoom] = useState<number>(1);
  
  // AutoSave State
  const [isAutoSave, setIsAutoSave] = useState(false);
  const isFirstRender = useRef(true);
  
  // Ref to track the data of the last successful save (Manual or Auto)
  // Used for diffing to prevent duplicate saves
  const lastSavedDataRef = useRef<string>("");

  // Derived sheets for rendering. In Preview Mode, returns the snapshot data.
  const sheets = useMemo(() => {
      if (previewRevisionId) {
          const rev = revisions.find(r => r.id === previewRevisionId);
          if (rev) return rev.data;
      }
      return history.present;
  }, [history.present, previewRevisionId, revisions]);

  // --- 1. SAVE LOGIC ---
  const saveWorkbook = useCallback((source: 'Manual' | 'Auto' = 'Manual') => {
      // Cannot save if we are currently previewing a history version
      if (previewRevisionId) return false;

      try {
          const currentData = JSON.stringify(history.present);
          
          // DIFF CHECK: Only save if data has changed since last save
          // Or if it's the very first save
          if (lastSavedDataRef.current === "" || currentData !== lastSavedDataRef.current) {
              
              // A. Persist (Simulated Disk)
              localStorage.setItem('excel-workbook-data', currentData);
              lastSavedDataRef.current = currentData;
              
              // B. Create Version History Entry
              const timestamp = Date.now();
              const newRevision: Revision = {
                  id: `rev-${timestamp}-${Math.random().toString(36).substr(2, 9)}`,
                  timestamp,
                  name: source === 'Manual' ? `Manual Save` : `Auto-Save`,
                  data: JSON.parse(currentData),
                  source: source
              };

              setRevisions(prev => [newRevision, ...prev]);
              console.log(`Workbook saved (${source}) at ` + new Date(timestamp).toLocaleTimeString());
              return true;
          }
          return false;
      } catch (e) {
          console.error('Failed to save workbook', e);
          return false;
      }
  }, [history.present, previewRevisionId]);

  // --- 2. AUTO-SAVE MONITORING ---
  useEffect(() => {
      if (isFirstRender.current) {
          isFirstRender.current = false;
          return;
      }

      // If AutoSave is ON and NOT previewing
      if (isAutoSave && !previewRevisionId) {
          // Debounce the auto-save to run after user stops typing/editing for 1 second
          const timer = setTimeout(() => {
              saveWorkbook('Auto');
          }, 1000); 
          
          return () => clearTimeout(timer);
      }
  }, [history.present, isAutoSave, saveWorkbook, previewRevisionId]); 

  // --- 3. STATE MANAGEMENT ---
  
  const setSheets = useCallback((action: React.SetStateAction<Sheet[]> | Sheet[]) => {
      // Block edits during preview mode
      if (previewRevisionId) return;

      setHistory(curr => {
          const newSheets = typeof action === 'function' ? (action as (prevState: Sheet[]) => Sheet[])(curr.present) : action;
          
          if (newSheets === curr.present) return curr;

          // Smart History: Only push to 'past' if structural/content data changed.
          const contentChanged = newSheets.some((s, i) => {
              const old = curr.present[i];
              if (!old) return true; // Sheet added/removed
              
              // Check for reference equality on heavy objects
              return s.cells !== old.cells || 
                     s.styles !== old.styles || 
                     s.merges !== old.merges ||
                     s.tables !== old.tables ||
                     s.validations !== old.validations ||
                     s.columnWidths !== old.columnWidths || 
                     s.rowHeights !== old.rowHeights;
          });

          if (!contentChanged) {
              return {
                  ...curr,
                  present: newSheets
              };
          }

          return {
              past: [...curr.past, curr.present].slice(-30), // Limit history
              present: newSheets,
              future: [] // Clear redo stack
          };
      });
  }, [previewRevisionId]);

  const undo = useCallback(() => {
      if (previewRevisionId) return;
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
  }, [previewRevisionId]);

  const redo = useCallback(() => {
      if (previewRevisionId) return;
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
  }, [previewRevisionId]);

  // --- 4. VERSION CONTROL HANDLERS ---
  
  const restoreRevision = useCallback((revisionId: string) => {
      const revision = revisions.find(r => r.id === revisionId);
      if (revision) {
          const restoredSheets = JSON.parse(JSON.stringify(revision.data)) as Sheet[];
          
          // A. Restore State (Undo stack gets current state so we can undo the restore if needed)
          setHistory(curr => ({
              past: [...curr.past, curr.present],
              present: restoredSheets, 
              future: []
          }));

          // B. Create New Version (Restore Point) immediately
          const timestamp = Date.now();
          const restorePoint: Revision = {
              id: `rev-${timestamp}-${Math.random().toString(36).substr(2, 9)}`,
              timestamp,
              name: `Restored: ${revision.name}`,
              data: restoredSheets,
              source: 'Manual'
          };
          setRevisions(prev => [restorePoint, ...prev]);
          
          // C. Update Diff Reference to prevent immediate duplicate auto-save
          const dataStr = JSON.stringify(restoredSheets);
          lastSavedDataRef.current = dataStr;
          localStorage.setItem('excel-workbook-data', dataStr);

          // D. Exit Preview Mode
          setPreviewRevisionId(null);

          // E. Ensure valid active sheet
          const activeExists = restoredSheets.some(s => s.id === activeSheetId);
          if (!activeExists && restoredSheets.length > 0) {
              setActiveSheetId(restoredSheets[0].id);
          }
      }
  }, [revisions, activeSheetId]);

  const deleteRevision = useCallback((revisionId: string) => {
      setRevisions(prev => prev.filter(r => r.id !== revisionId));
      if (previewRevisionId === revisionId) setPreviewRevisionId(null);
  }, [previewRevisionId]);

  const addRevision = useCallback((name: string) => {
      // Manual named revision snapshot of CURRENT state
      if (previewRevisionId) return;

      const currentData = JSON.stringify(history.present);
      const timestamp = Date.now();
      const newRevision: Revision = {
          id: `rev-${timestamp}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp,
          name: name,
          data: JSON.parse(currentData),
          source: 'Manual'
      };
      setRevisions(prev => [newRevision, ...prev]);
      
      // Update ref so auto-save doesn't dup this immediately
      lastSavedDataRef.current = currentData;
  }, [history.present, previewRevisionId]);

  return {
    sheets,
    setSheets,
    activeSheetId,
    setActiveSheetId,
    gridSize,
    setGridSize,
    zoom,
    setZoom,
    undo,
    redo,
    canUndo: history.past.length > 0 && !previewRevisionId,
    canRedo: history.future.length > 0 && !previewRevisionId,
    
    // Version Control Props
    revisions,
    addRevision,
    restoreRevision,
    deleteRevision,
    previewRevisionId,
    previewRevision: setPreviewRevisionId,
    
    // Save Props
    isAutoSave,
    toggleAutoSave: () => setIsAutoSave(prev => !prev),
    saveWorkbook
  };
};
