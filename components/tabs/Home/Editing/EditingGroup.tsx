import React from 'react';
import { RibbonGroup, TabProps } from '../../shared';
import AutoSum from './AutoSum';
import SortFilter from './SortFilter';
import FindSelect from './FindSelect';
import ClearAll from './ClearAll';

const EditingGroup: React.FC<TabProps> = ({ onClear, onAutoSum }) => {
  return (
    <RibbonGroup label="Editing" className="border-r-0">
        <div className="flex gap-2 h-full items-center px-1">
            <div className="flex flex-col gap-0 h-full justify-center">
                <AutoSum onAutoSum={onAutoSum} />
                <SortFilter />
                <FindSelect />
            </div>
            <div className="flex flex-col h-full justify-start pt-0.5">
                <ClearAll onClear={onClear} />
            </div>
        </div>
    </RibbonGroup>
  );
};

export default EditingGroup;