import React, { memo, Suspense } from 'react';
import { motion } from 'framer-motion';
import { TabProps, GroupSkeleton } from '../../shared';

const TablesGroup = React.lazy(() => import('./groups/TablesGroup'));
const IllustrationsGroup = React.lazy(() => import('./groups/IllustrationsGroup'));
const ChartsGroup = React.lazy(() => import('./groups/ChartsGroup'));
const SparklinesGroup = React.lazy(() => import('./groups/SparklinesGroup'));
const FiltersGroup = React.lazy(() => import('./groups/FiltersGroup'));
const LinksCommentsGroup = React.lazy(() => import('./groups/LinksCommentsGroup'));
const TextSymbolsGroup = React.lazy(() => import('./groups/TextSymbolsGroup'));

const InsertTab: React.FC<TabProps> = (props) => {
  return (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex h-full min-w-max gap-1"
    >
        <Suspense fallback={<GroupSkeleton />}><TablesGroup {...props} /></Suspense>
        <Suspense fallback={<GroupSkeleton />}><IllustrationsGroup {...props} /></Suspense>
        <Suspense fallback={<GroupSkeleton />}><ChartsGroup {...props} /></Suspense>
        <Suspense fallback={<GroupSkeleton />}><SparklinesGroup {...props} /></Suspense>
        <Suspense fallback={<GroupSkeleton />}><FiltersGroup {...props} /></Suspense>
        <Suspense fallback={<GroupSkeleton />}><LinksCommentsGroup {...props} /></Suspense>
        <Suspense fallback={<GroupSkeleton />}><TextSymbolsGroup {...props} /></Suspense>
    </motion.div>
  );
};

export default memo(InsertTab);