import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { TabProps } from '../../shared';
import { createLazyGroup } from '../createLazyGroup';

const GetTransformGroup = createLazyGroup(() => import('./groups/GetTransformGroup'));
const QueriesConnectionsGroup = createLazyGroup(() => import('./groups/QueriesConnectionsGroup'));
const DataTypesGroup = createLazyGroup(() => import('./groups/DataTypesGroup'));
const SortFilterGroup = createLazyGroup(() => import('./groups/SortFilterGroup'));
const DataToolsGroup = createLazyGroup(() => import('./groups/DataToolsGroup'));

const DataTab: React.FC<TabProps> = (props) => {
  return (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex h-full min-w-max gap-1"
    >
        <GetTransformGroup {...props} />
        <QueriesConnectionsGroup {...props} />
        <DataTypesGroup {...props} />
        <SortFilterGroup {...props} />
        <DataToolsGroup {...props} />
    </motion.div>
  );
};

export default memo(DataTab);