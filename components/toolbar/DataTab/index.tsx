import React, { memo, Suspense } from 'react';
import { motion } from 'framer-motion';
import { TabProps, GroupSkeleton } from '../../shared';

const GetTransformGroup = React.lazy(() => import('./groups/GetTransformGroup'));
const QueriesConnectionsGroup = React.lazy(() => import('./groups/QueriesConnectionsGroup'));
const DataTypesGroup = React.lazy(() => import('./groups/DataTypesGroup'));
const SortFilterGroup = React.lazy(() => import('./groups/SortFilterGroup'));
const DataToolsGroup = React.lazy(() => import('./groups/DataToolsGroup'));

const DataTab: React.FC<TabProps> = (props) => {
  return (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex h-full min-w-max gap-1"
    >
        <Suspense fallback={<GroupSkeleton />}><GetTransformGroup {...props} /></Suspense>
        <Suspense fallback={<GroupSkeleton />}><QueriesConnectionsGroup {...props} /></Suspense>
        <Suspense fallback={<GroupSkeleton />}><DataTypesGroup {...props} /></Suspense>
        <Suspense fallback={<GroupSkeleton />}><SortFilterGroup {...props} /></Suspense>
        <Suspense fallback={<GroupSkeleton />}><DataToolsGroup {...props} /></Suspense>
    </motion.div>
  );
};

export default memo(DataTab);