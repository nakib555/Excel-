import React from 'react';
import { RibbonGroup, TabProps } from '../../shared';
import Insert from './Insert';
import Delete from './Delete';
import Format from './Format';

const CellsGroup: React.FC<TabProps> = () => {
  return (
    <RibbonGroup label="Cells">
        <div className="flex flex-col gap-0 justify-center">
            <Insert />
            <Delete />
            <Format />
        </div>
    </RibbonGroup>
  );
};

export default CellsGroup;
