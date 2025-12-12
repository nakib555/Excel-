
import React from 'react';
import { RibbonGroup, TabProps } from '../../shared';
import SortAToZ from './SortAToZ';
import SortZToA from './SortZToA';
import Sort from './Sort';
import Filter from './Filter';
import ClearFilter from './ClearFilter';
import Reapply from './Reapply';
import AdvancedFilter from './AdvancedFilter';

const SortFilterGroup: React.FC<TabProps> = ({ onSort }) => (
    <RibbonGroup label="Sort & Filter">
        <div className="flex items-center gap-1 h-full">
            <div className="flex flex-col gap-0 justify-center items-center px-1">
                <SortAToZ onSort={onSort} />
                <SortZToA onSort={onSort} />
            </div>
            <Sort />
            <Filter />
            <div className="flex flex-col gap-0 justify-center">
                <ClearFilter />
                <Reapply />
                <AdvancedFilter />
            </div>
        </div>
    </RibbonGroup>
);

export default SortFilterGroup;