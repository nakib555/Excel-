import React, { memo, Suspense } from 'react';
import { motion } from 'framer-motion';
import { TabProps, GroupSkeleton } from '../../shared';

const ThemesGroup = React.lazy(() => import('./groups/ThemesGroup'));
const PageSetupGroup = React.lazy(() => import('./groups/PageSetupGroup'));
const ScaleToFitGroup = React.lazy(() => import('./groups/ScaleToFitGroup'));
const SheetOptionsGroup = React.lazy(() => import('./groups/SheetOptionsGroup'));
const ArrangeGroup = React.lazy(() => import('./groups/ArrangeGroup'));

const PageLayoutTab: React.FC<TabProps> = (props) => {
  return (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex h-full min-w-max gap-1"
    >
        <Suspense fallback={<GroupSkeleton />}><ThemesGroup {...props} /></Suspense>
        <Suspense fallback={<GroupSkeleton />}><PageSetupGroup {...props} /></Suspense>
        <Suspense fallback={<GroupSkeleton />}><ScaleToFitGroup {...props} /></Suspense>
        <Suspense fallback={<GroupSkeleton />}><SheetOptionsGroup {...props} /></Suspense>
        <Suspense fallback={<GroupSkeleton />}><ArrangeGroup {...props} /></Suspense>
    </motion.div>
  );
};

export default memo(PageLayoutTab);