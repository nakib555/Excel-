
import React, { memo } from 'react';
import { RibbonGroup, TabProps } from '../../shared';
import ConditionalFormatting from './ConditionalFormatting';
import FormatAsTable from './FormatAsTable';
import CellStyles from './CellStyles';

const StylesGroup: React.FC<TabProps> = memo(({ onApplyStyle, onMergeStyles, onFormatAsTable }) => {
  return (
    <RibbonGroup label="Styles">
        <div className="flex gap-1 h-full items-center">
            <ConditionalFormatting />
            <FormatAsTable onFormatAsTable={onFormatAsTable} />
            <CellStyles onApplyStyle={onApplyStyle} onMergeStyles={onMergeStyles} />
        </div>
    </RibbonGroup>
  );
});

export default StylesGroup;
