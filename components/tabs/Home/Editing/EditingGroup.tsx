
import React, { memo } from 'react';
import { RibbonGroup, TabProps } from '../../shared';
import AutoSum from './AutoSum';
import SortFilter from './SortFilter';
import FindSelect from './FindSelect';
import ClearAll from './ClearAll';
import Fill from './Fill';

const EditingGroup: React.FC<TabProps> = memo(({ 
    onClear, 
    onAutoSum, 
    onFindReplace, 
    onSelectSpecial,
    onFillDirection,
    onSort,
    onToggleFilter
}) => {
  return (
    <RibbonGroup label="Editing" className="border-r-0">
        <div className="flex items-center gap-1 h-full px-1">
            <div className="flex flex-col gap-0 justify-center">
                <AutoSum onAutoSum={onAutoSum} />
                <Fill onFillDirection={onFillDirection} />
                <ClearAll onClear={onClear} />
            </div>
            <SortFilter onSort={onSort} onToggleFilter={onToggleFilter} />
            <FindSelect onFindReplace={onFindReplace} onSelectSpecial={onSelectSpecial} />
        </div>
    </RibbonGroup>
  );
});

export default EditingGroup;
