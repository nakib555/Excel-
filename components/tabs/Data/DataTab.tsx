
import React, { memo, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { TabProps } from '../shared';
import { GroupSkeleton } from '../../Skeletons';

const GetTransformGroup = lazy(() => import('./GetTransform/GetTransformGroup'));
const QueriesConnectionsGroup = lazy(() => import('./GetTransform/QueriesConnectionsGroup'));
const DataTypesGroup = lazy(() => import('./DataTypes/DataTypesGroup'));
const SortFilterGroup = lazy(() => import('./SortFilter/SortFilterGroup'));
const DataToolsGroup = lazy(() => import('./DataTools/DataToolsGroup'));

const DataTab: React.FC<TabProps> = (props) => {
  return (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex h-full min-w-max gap-1"
    >
        <Suspense fallback={<GroupSkeleton width={200} />}><GetTransformGroup /></Suspense>
        <Suspense fallback={<GroupSkeleton width={140} />}><QueriesConnectionsGroup /></Suspense>
        <Suspense fallback={<GroupSkeleton width={140} />}><DataTypesGroup /></Suspense>
        <Suspense fallback={<GroupSkeleton width={180} />}><SortFilterGroup {...props} /></Suspense>
        <Suspense fallback={<GroupSkeleton width={240} />}><DataToolsGroup /></Suspense>
    </motion.div>
  );
};

export default memo(DataTab);