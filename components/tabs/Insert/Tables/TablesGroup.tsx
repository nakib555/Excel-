import React from 'react';
import { RibbonGroup, TabProps } from '../../shared';
import PivotTable from './PivotTable';
import RecommendedPivots from './RecommendedPivots';
import Table from './Table';
import Forms from '../Forms/Forms';

const TablesGroup: React.FC<TabProps> = () => {
  return (
    <RibbonGroup label="Tables">
        <PivotTable />
        <RecommendedPivots />
        <Table />
        <Forms />
    </RibbonGroup>
  );
};

export default TablesGroup;
