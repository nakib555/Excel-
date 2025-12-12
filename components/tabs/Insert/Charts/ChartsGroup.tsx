import React from 'react';
import { RibbonGroup, RibbonButton, TabProps } from '../../shared';
import RecommendedCharts from './RecommendedCharts';
import ColumnChart from './ColumnChart';
import LineChart from './LineChart';
import PieChart from './PieChart';
import ScatterChart from './ScatterChart';
import Maps from './Maps';
import PivotChart from './PivotChart';

const ChartsGroup: React.FC<TabProps> = () => {
  return (
    <RibbonGroup label="Charts">
        <div className="flex gap-2 h-full items-center">
                <RecommendedCharts />
                <div className="flex flex-col gap-0 h-full justify-center">
                    <div className="flex gap-0.5">
                        <ColumnChart />
                        <LineChart />
                        <PieChart />
                    </div>
                    <div className="flex gap-0.5">
                        <ScatterChart />
                        <Maps />
                        <PivotChart />
                    </div>
                </div>
        </div>
    </RibbonGroup>
  );
};

export default ChartsGroup;
