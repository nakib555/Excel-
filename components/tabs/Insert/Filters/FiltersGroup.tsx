import React from 'react';
import { RibbonGroup, TabProps } from '../../shared';
import Slicer from './Slicer';
import Timeline from './Timeline';

const FiltersGroup: React.FC<TabProps> = () => {
  return (
    <RibbonGroup label="Filters">
        <div className="flex flex-col gap-0 h-full justify-center">
            <Slicer />
            <Timeline />
        </div>
    </RibbonGroup>
  );
};

export default FiltersGroup;
