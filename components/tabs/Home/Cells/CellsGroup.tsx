
import React, { memo } from 'react';
import { RibbonGroup, TabProps } from '../../shared';
import Insert from './Insert';
import Delete from './Delete';
import Format from './Format';

const CellsGroup: React.FC<TabProps> = memo((props) => {
  const { 
      onInsertRow, onInsertColumn, onInsertSheet, onInsertCells,
      onDeleteRow, onDeleteColumn, onDeleteSheet, onDeleteCells,
      onFormatRowHeight, onFormatColWidth, onAutoFitRowHeight, onAutoFitColWidth,
      onHideRow, onHideCol, onUnhideRow, onUnhideCol,
      onRenameSheet, onMoveCopySheet, onProtectSheet, onLockCell, onOpenFormatDialog
  } = props;

  return (
    <RibbonGroup label="Cells">
        <div className="flex flex-col gap-0 justify-center">
            <Insert 
                onInsertRow={onInsertRow} 
                onInsertColumn={onInsertColumn} 
                onInsertSheet={onInsertSheet}
                onInsertCells={onInsertCells}
            />
            <Delete 
                onDeleteRow={onDeleteRow} 
                onDeleteColumn={onDeleteColumn} 
                onDeleteSheet={onDeleteSheet}
                onDeleteCells={onDeleteCells}
            />
            <Format 
                onFormatRowHeight={onFormatRowHeight}
                onFormatColWidth={onFormatColWidth}
                onAutoFitRowHeight={onAutoFitRowHeight}
                onAutoFitColWidth={onAutoFitColWidth}
                onHideRow={onHideRow}
                onHideCol={onHideCol}
                onUnhideRow={onUnhideRow}
                onUnhideCol={onUnhideCol}
                onRenameSheet={onRenameSheet}
                onMoveCopySheet={onMoveCopySheet}
                onProtectSheet={onProtectSheet}
                onLockCell={onLockCell}
                onOpenFormatDialog={onOpenFormatDialog}
            />
        </div>
    </RibbonGroup>
  );
});

export default CellsGroup;
