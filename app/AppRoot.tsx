
import React, { lazy, Suspense, useCallback, useState, useEffect } from 'react';
import { MAX_ROWS, MAX_COLS } from './constants/grid.constants';
import { getApiKey } from './utils/apiKey';
import { parseCellId } from '../utils';
import { CellData } from '../types';
import { Eye } from 'lucide-react';

// Hooks
import { useSheetsState } from './state/useSheetsState';
import { useActiveSheet } from './hooks/useActiveSheet';
import { useSelectionStats } from './hooks/useSelectionStats';
import { useDialogState } from './dialogs/dialog.state';
import { useCellHandlers } from './handlers/cell.handlers';
import { useStyleHandlers } from './handlers/style.handlers';
import { useTableHandlers } from './handlers/table.handlers';
import { useClipboardHandlers } from './handlers/clipboard.handlers';
import { useNavigationHandlers } from './handlers/navigation.handlers';
import { useResizeHandlers } from './handlers/resize.handlers';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

// Component Imports
import { 
  ToolbarSkeleton, FormulaBarSkeleton, GridSkeleton, SheetTabsSkeleton, StatusBarSkeleton 
} from '../components/Skeletons';

const AIAssistant = lazy(() => import('../components/AIAssistant'));
const Toolbar = lazy(() => import('../components/Toolbar'));
const FormulaBar = lazy(() => import('../components/FormulaBar'));
const Grid = lazy(() => import('../components/Grid'));
const SheetTabs = lazy(() => import('../components/SheetTabs'));
const StatusBar = lazy(() => import('../components/StatusBar'));
const MobileResizeTool = lazy(() => import('../components/MobileResizeTool'));
const FormatCellsDialog = lazy(() => import('../components/dialogs/FormatCellsDialog'));
const FindReplaceDialog = lazy(() => import('../components/dialogs/FindReplaceDialog'));
const MergeStylesDialog = lazy(() => import('../components/dialogs/MergeStylesDialog'));
const CreateTableDialog = lazy(() => import('../components/dialogs/CreateTableDialog'));
const DataValidationDialog = lazy(() => import('../components/dialogs/DataValidationDialog'));
const CommentDialog = lazy(() => import('../components/dialogs/CommentDialog'));
const HistorySidebar = lazy(() => import('../components/HistorySidebar'));

export const AppRoot: React.FC = () => {
  // 1. Core State
  const { 
    sheets, setSheets, activeSheetId, setActiveSheetId, 
    gridSize, setGridSize, zoom, setZoom,
    undo, redo, canUndo, canRedo,
    revisions, addRevision, restoreRevision, deleteRevision,
    isAutoSave, toggleAutoSave, saveWorkbook,
    previewRevisionId, previewRevision
  } = useSheetsState();
  
  const apiKey = getApiKey();

  // 2. Active Sheet Data
  const { 
    activeSheet, cells, styles, merges, tables, validations, activeCell, selectionRange, columnWidths, rowHeights, activeStyle, activeTable 
  } = useActiveSheet(sheets, activeSheetId);

  // 3. UI/Dialog State
  const dialogs = useDialogState();

  // 4. Handlers
  const cellHandlers = useCellHandlers({ setSheets, activeSheetId, validations, activeCell, selectionRange, cells, setActiveSheetId });
  const styleHandlers = useStyleHandlers({ setSheets, activeSheetId });
  const tableHandlers = useTableHandlers({ setSheets, activeSheetId, setCreateTableState: dialogs.setCreateTableState, selectionRange, createTableState: dialogs.createTableState });
  const clipboardHandlers = useClipboardHandlers({ setSheets, activeSheetId, activeCell, selectionRange, cells });
  const navigationHandlers = useNavigationHandlers({ activeCell, gridSize, handleCellClick: cellHandlers.handleCellClick, setGridSize });
  const resizeHandlers = useResizeHandlers({ setSheets, activeSheetId, activeSheet, activeCell });

  // 5. Derived Stats
  const selectionStats = useSelectionStats(selectionRange, cells);

  // 6. Keyboard Shortcuts
  useKeyboardShortcuts({
      selectionRange,
      activeCell,
      cells,
      onCellChange: cellHandlers.handleCellChange,
      onNavigate: navigationHandlers.handleNavigate
  });

  // Global Undo/Redo Shortcuts (Ctrl+Z, Ctrl+Y)
  useEffect(() => {
      const handleGlobalKeyDown = (e: KeyboardEvent) => {
          if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
              e.preventDefault();
              if (e.shiftKey) {
                  if (canRedo) redo();
              } else {
                  if (canUndo) undo();
              }
          }
          if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
              e.preventDefault();
              if (canRedo) redo();
          }
      };
      window.addEventListener('keydown', handleGlobalKeyDown);
      return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [undo, redo, canUndo, canRedo]);

  // 7. Aux Handlers
  const handleExpandGrid = useCallback((d: 'row' | 'col') => setGridSize(p => ({ ...p, rows: d==='row'?Math.min(p.rows+300,MAX_ROWS):p.rows, cols: d==='col'?Math.min(p.cols+100,MAX_COLS):p.cols })), [setGridSize]);
  const handleZoomWheel = useCallback((d: number) => setZoom(p => Math.max(0.1, Math.min(4, p+d))), [setZoom]);
  const handleFormulaChange = useCallback((v: string) => activeCell && cellHandlers.handleCellChange(activeCell, v), [activeCell, cellHandlers]);
  const handleAIApply = useCallback((r: any) => { dialogs.setShowAI(false); /* simplified */ }, [dialogs]);
  const handleDataValidation = useCallback(() => {
      if (!activeCell) return;
      const currentRule = validations[activeCell];
      dialogs.setDataValidationState({ isOpen: true, rule: currentRule || null, cellId: activeCell });
  }, [activeCell, validations, dialogs]);

  // Force Center State for Search/Goto
  const [forceCenter, setForceCenter] = useState(false);

  // Comment Handlers
  const handleOpenCommentDialog = useCallback(() => {
      if (!activeCell) return;
      const currentComment = cells[activeCell]?.comment || '';
      dialogs.setCommentDialogState({ isOpen: true, cellId: activeCell, initialText: currentComment });
  }, [activeCell, cells, dialogs]);

  const handleSaveComment = useCallback((text: string) => {
      if (dialogs.commentDialogState.cellId) {
          cellHandlers.handleSaveComment(dialogs.commentDialogState.cellId, text);
      }
  }, [dialogs.commentDialogState.cellId, cellHandlers]);

  // Search Handlers
  const handleSearchAll = useCallback((query: string, matchCase: boolean) => {
      if (!query) return [];
      const lowerQuery = query.toLowerCase();
      return (Object.values(cells) as CellData[])
          .filter(cell => {
              if (cell.value === undefined || cell.value === null) return false;
              const val = String(cell.value);
              return matchCase ? val.includes(query) : val.toLowerCase().includes(lowerQuery);
          })
          .map(cell => ({ id: cell.id, content: String(cell.value) }));
  }, [cells]);

  const handleFind = useCallback((query: string, matchCase: boolean, matchEntire: boolean) => {
      if (!query) return;
      const lowerQuery = query.toLowerCase();
      
      const matches = (Object.values(cells) as CellData[]).filter(cell => {
          if (cell.value === undefined || cell.value === null) return false;
          const val = String(cell.value);
          if (matchEntire) {
              return matchCase ? val === query : val.toLowerCase() === lowerQuery;
          }
          return matchCase ? val.includes(query) : val.toLowerCase().includes(lowerQuery);
      });

      if (matches.length === 0) {
          alert("No matches found.");
          return;
      }

      // Sort matches by position (Row then Col)
      matches.sort((a, b) => {
          const pa = parseCellId(a.id);
          const pb = parseCellId(b.id);
          if (!pa || !pb) return 0;
          if (pa.row !== pb.row) return pa.row - pb.row;
          return pa.col - pb.col;
      });

      let nextIndex = 0;
      if (activeCell) {
          // Find current index
          const currentIndex = matches.findIndex(m => m.id === activeCell);
          if (currentIndex !== -1) {
              // Next match
              nextIndex = (currentIndex + 1) % matches.length;
          } else {
              // Find first match *after* active cell
              const pa = parseCellId(activeCell);
              if (pa) {
                  const nextMatch = matches.find(m => {
                      const pm = parseCellId(m.id);
                      if (!pm) return false;
                      return pm.row > pa.row || (pm.row === pa.row && pm.col > pa.col);
                  });
                  if (nextMatch) nextIndex = matches.indexOf(nextMatch);
              }
          }
      }

      const target = matches[nextIndex];
      // Trigger center scroll for search result
      setForceCenter(true);
      cellHandlers.handleCellClick(target.id, false);
  }, [cells, activeCell, cellHandlers]);

  const handleGoTo = useCallback((ref: string) => {
      // Trigger center scroll for Go To
      setForceCenter(true);
      navigationHandlers.handleNameBoxSubmit(ref);
  }, [navigationHandlers]);

  const handleHighlight = useCallback((id: string) => {
      // Trigger center scroll for search preview click
      setForceCenter(true);
      cellHandlers.handleCellClick(id, false);
  }, [cellHandlers]);

  const handleSelectSpecial = useCallback((type: 'formulas' | 'comments' | 'constants' | 'validation' | 'conditional' | 'blanks') => {
      if (type === 'formulas') {
          const formulaCells = (Object.values(cells) as CellData[]).filter(c => c.raw && c.raw.startsWith('=')).map(c => c.id);
          if (formulaCells.length > 0) {
              cellHandlers.handleBatchSelection(formulaCells);
              setForceCenter(true);
          } else {
              alert("No cells were found.");
          }
      } else if (type === 'comments') {
          const commentCells = (Object.values(cells) as CellData[]).filter(c => c.comment).map(c => c.id);
          if (commentCells.length > 0) {
              cellHandlers.handleBatchSelection(commentCells);
              setForceCenter(true);
          } else {
              alert("No cells were found.");
          }
      } else {
          alert(`Selection type '${type}' is not yet implemented.`);
      }
  }, [cells, cellHandlers]);

  // Passthroughs for toolbar that don't need complex logic yet
  const noOp = useCallback(() => {}, []);

  return (
    <div className="flex flex-col h-[100dvh] w-screen bg-slate-50 overflow-hidden font-sans text-slate-900 relative">
      <div className="flex-shrink-0 z-[60]">
        <Suspense fallback={<ToolbarSkeleton />}>
          <Toolbar 
            currentStyle={activeStyle}
            onToggleStyle={styleHandlers.handleStyleChange}
            onApplyStyle={styleHandlers.handleApplyFullStyle}
            onExport={() => {}} // simplified
            onClear={cellHandlers.handleClear}
            onResetLayout={noOp}
            onCopy={clipboardHandlers.handleCopy}
            onCut={clipboardHandlers.handleCut}
            onPaste={clipboardHandlers.handlePaste}
            onAutoSum={cellHandlers.handleAutoSum}
            onInsertRow={noOp}
            onInsertColumn={noOp}
            onInsertSheet={cellHandlers.handleAddSheet}
            onInsertCells={noOp}
            onDeleteRow={noOp}
            onDeleteColumn={noOp}
            onDeleteSheet={noOp}
            onDeleteCells={noOp}
            onFormatRowHeight={noOp}
            onFormatColWidth={noOp}
            onAutoFitRowHeight={noOp}
            onAutoFitColWidth={noOp}
            onHideRow={noOp}
            onHideCol={noOp}
            onUnhideRow={noOp}
            onUnhideCol={noOp}
            onRenameSheet={noOp}
            onMoveCopySheet={noOp}
            onProtectSheet={noOp}
            onLockCell={noOp}
            onOpenFormatDialog={dialogs.handleOpenFormatDialog}
            onSort={noOp}
            onMergeCenter={cellHandlers.handleMergeCenter}
            onDataValidation={handleDataValidation}
            onToggleAI={() => dialogs.setShowAI(true)}
            onToggleHistory={() => dialogs.setShowHistory(prev => !prev)}
            onInsertTable={() => tableHandlers.handleFormatAsTable({ name: 'TableStyleMedium2', headerBg: '#3b82f6', headerColor: '#ffffff', rowOddBg: '#eff6ff', rowEvenBg: '#ffffff', category: 'Medium' })}
            onInsertCheckbox={noOp}
            onInsertLink={noOp}
            onInsertComment={handleOpenCommentDialog}
            onDeleteComment={cellHandlers.handleDeleteComment}
            onFindReplace={(mode) => dialogs.setFindReplaceState({ open: true, mode })}
            onSelectSpecial={handleSelectSpecial}
            onMergeStyles={() => dialogs.setShowMergeStyles(true)}
            onFormatAsTable={tableHandlers.handleFormatAsTable}
            activeTable={activeTable}
            onTableOptionChange={tableHandlers.handleTableOptionChange}
            // Save Props - Pass Manual explicitly
            onSave={() => saveWorkbook('Manual')}
            onToggleAutoSave={toggleAutoSave}
            isAutoSave={isAutoSave}
          />
        </Suspense>
      </div>
      
      <div className="flex-shrink-0 z-50">
        <Suspense fallback={<FormulaBarSkeleton />}>
          <FormulaBar 
            value={activeCell && cells[activeCell] ? cells[activeCell].raw : ''}
            onChange={handleFormulaChange}
            onSubmit={noOp}
            selectedCell={activeCell}
            onNameBoxSubmit={handleGoTo}
          />
        </Suspense>
      </div>

      <main className="flex-1 overflow-hidden relative z-0">
        {/* Preview Banner - Floating Bottom */}
        {previewRevisionId && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-indigo-600/95 backdrop-blur shadow-2xl border border-indigo-500/50 rounded-full px-4 py-1.5 flex items-center gap-3 animate-in slide-in-from-bottom-4 fade-in duration-300">
                <div className="flex items-center gap-2">
                    <Eye size={14} className="text-indigo-200 animate-pulse" />
                    <span className="font-medium text-xs text-white whitespace-nowrap">Previewing Version</span>
                </div>
                <div className="h-3 w-[1px] bg-indigo-400/50" />
                <div className="flex items-center gap-1.5">
                    <button 
                        onClick={() => restoreRevision(previewRevisionId)}
                        className="px-3 py-1 bg-white text-indigo-600 text-[11px] font-bold rounded-full hover:bg-indigo-50 transition-colors shadow-sm"
                    >
                        Restore
                    </button>
                    <button 
                        onClick={() => previewRevision(null)}
                        className="px-2 py-1 hover:bg-indigo-700/50 text-indigo-100 hover:text-white text-[11px] font-medium rounded-full transition-colors"
                    >
                        Exit
                    </button>
                </div>
            </div>
        )}

        <Suspense fallback={<GridSkeleton />}>
            <Grid
              size={gridSize}
              cells={cells}
              styles={styles}
              merges={merges}
              validations={validations}
              activeCell={activeCell}
              selectionRange={selectionRange}
              columnWidths={columnWidths}
              rowHeights={rowHeights}
              scale={zoom}
              centerActiveCell={forceCenter}
              onCellClick={cellHandlers.handleCellClick}
              onSelectionDrag={cellHandlers.handleSelectionDrag}
              onCellDoubleClick={cellHandlers.handleCellDoubleClick}
              onCellChange={cellHandlers.handleCellChange}
              onNavigate={navigationHandlers.handleNavigate}
              onColumnResize={resizeHandlers.handleColumnResize}
              onRowResize={resizeHandlers.handleRowResize}
              onExpandGrid={handleExpandGrid}
              onZoom={handleZoomWheel}
              onFill={cellHandlers.handleFill}
              onAutoFit={resizeHandlers.handleAutoFit}
              onScrollToActiveCell={() => setForceCenter(false)}
            />
        </Suspense>
      </main>

      <div className="flex-shrink-0 z-40">
        <Suspense fallback={<SheetTabsSkeleton />}>
          <SheetTabs 
            sheets={sheets}
            activeSheetId={activeSheetId}
            onSwitch={setActiveSheetId}
            onAdd={cellHandlers.handleAddSheet}
          />
        </Suspense>
      </div>

      <div className="flex-shrink-0 z-40">
        <Suspense fallback={<StatusBarSkeleton />}>
          <StatusBar 
            selectionCount={selectionRange ? selectionRange.length : 0}
            stats={selectionStats}
            zoom={zoom}
            onZoomChange={setZoom}
            onToggleMobileResize={() => dialogs.setShowMobileResize(!dialogs.showMobileResize)}
            onUndo={undo}
            onRedo={redo}
            canUndo={canUndo}
            canRedo={canRedo}
          />
        </Suspense>
      </div>

      {/* Dialogs */}
      <Suspense fallback={null}>
          <MobileResizeTool isOpen={dialogs.showMobileResize} onClose={() => dialogs.setShowMobileResize(false)} activeCell={activeCell} onResizeRow={resizeHandlers.resizeActiveRow} onResizeCol={resizeHandlers.resizeActiveCol} onReset={resizeHandlers.handleResetActiveResize} />
      </Suspense>
      <Suspense fallback={null}>
          <AIAssistant isOpen={dialogs.showAI} onClose={() => dialogs.setShowAI(false)} onApply={handleAIApply} apiKey={apiKey} />
      </Suspense>
      <Suspense fallback={null}>
          <FormatCellsDialog isOpen={dialogs.showFormatCells} onClose={() => dialogs.setShowFormatCells(false)} initialStyle={activeStyle} onApply={styleHandlers.handleApplyFullStyle} initialTab={dialogs.formatDialogTab} />
      </Suspense>
      <Suspense fallback={null}>
          <FindReplaceDialog 
            isOpen={dialogs.findReplaceState.open} 
            initialMode={dialogs.findReplaceState.mode} 
            onClose={() => dialogs.setFindReplaceState(p => ({ ...p, open: false }))} 
            onFind={handleFind} 
            onReplace={() => {}} 
            onGoTo={handleGoTo}
            onSearchAll={handleSearchAll}
            onGetCellData={(id) => cells[id] || null}
            onHighlight={handleHighlight}
          />
      </Suspense>
      <Suspense fallback={null}>
          <MergeStylesDialog isOpen={dialogs.showMergeStyles} onClose={() => dialogs.setShowMergeStyles(false)} />
      </Suspense>
      <Suspense fallback={null}>
          <CreateTableDialog isOpen={dialogs.createTableState.isOpen} initialRange={dialogs.createTableState.range} onClose={() => dialogs.setCreateTableState(p => ({ ...p, isOpen: false }))} onConfirm={tableHandlers.handleCreateTableConfirm} />
      </Suspense>
      <Suspense fallback={null}>
          <DataValidationDialog isOpen={dialogs.dataValidationState.isOpen} initialRule={dialogs.dataValidationState.rule} onClose={() => dialogs.setDataValidationState(p => ({ ...p, isOpen: false }))} onSave={cellHandlers.handleDataValidationSave} />
      </Suspense>
      <Suspense fallback={null}>
          <CommentDialog 
              isOpen={dialogs.commentDialogState.isOpen} 
              initialComment={dialogs.commentDialogState.initialText} 
              cellId={dialogs.commentDialogState.cellId}
              onClose={() => dialogs.setCommentDialogState(p => ({ ...p, isOpen: false }))} 
              onSave={handleSaveComment}
              onDelete={() => {
                  cellHandlers.handleDeleteComment();
                  dialogs.setCommentDialogState(p => ({ ...p, isOpen: false }));
              }}
          />
      </Suspense>
      <Suspense fallback={null}>
          <HistorySidebar 
              isOpen={dialogs.showHistory} 
              onClose={() => dialogs.setShowHistory(false)} 
              revisions={revisions}
              onCreateRevision={addRevision}
              onRestoreRevision={restoreRevision}
              onDeleteRevision={deleteRevision}
              onPreviewRevision={previewRevision}
              activePreviewId={previewRevisionId}
          />
      </Suspense>
    </div>
  );
};
