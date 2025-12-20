
import React, { memo } from 'react';
import { RibbonGroup, TabProps } from '../../shared';
import ConditionalFormatting from './ConditionalFormatting';
import FormatAsTable from './FormatAsTable';
import CellStyles from './CellStyles';

const StylesGroup: React.FC<TabProps> = memo(({ onApplyStyle }) => {
  return (
    <RibbonGroup label="Styles">
        <div className="flex gap-1 h-full items-center">
            <ConditionalFormatting />
            <FormatAsTable />
            <CellStyles onApplyStyle={onApplyStyle} />
        </div>
    </RibbonGroup>
  );
});

export default StylesGroup;
