import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { TabProps } from '../shared';

import GetTransformGroup from './GetTransform/GetTransformGroup';
import QueriesConnectionsGroup from './GetTransform/QueriesConnectionsGroup';
import DataTypesGroup from './DataTypes/DataTypesGroup';
import SortFilterGroup from './SortFilter/SortFilterGroup';
import DataToolsGroup from './DataTools/DataToolsGroup';

const DataTab: React.FC<TabProps> = () => {
  return (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex h-full min-w-max gap-1"
    >
        <GetTransformGroup />
        <QueriesConnectionsGroup />
        <DataTypesGroup />
        <SortFilterGroup />
        <DataToolsGroup />
    </motion.div>
  );
};

export default memo(DataTab);