import React, { memo, Suspense } from 'react';
import { motion } from 'framer-motion';
import { TabProps, GroupSkeleton } from '../../shared';

const SheetViewGroup = React.lazy(() => import('./groups/SheetViewGroup'));
const WorkbookViewsGroup = React.lazy(() => import('./groups/WorkbookViewsGroup'));
const ShowGroup = React.lazy(() => import('./groups/ShowGroup'));
const ZoomGroup = React.lazy(() => import('./groups/ZoomGroup'));
const WindowGroup = React.lazy(() => import('./groups/WindowGroup'));

const ViewTab: React.FC<TabProps> = (props) => {
  return (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex h-full min-w-max gap-1"
    >
         <Suspense fallback={<GroupSkeleton />}><SheetViewGroup {...props} /></Suspense>
         <Suspense fallback={<GroupSkeleton />}><WorkbookViewsGroup {...props} /></Suspense>
         <Suspense fallback={<GroupSkeleton />}><ShowGroup {...props} /></Suspense>
         <Suspense fallback={<GroupSkeleton />}><ZoomGroup {...props} /></Suspense>
         <Suspense fallback={<GroupSkeleton />}><WindowGroup {...props} /></Suspense>
    </motion.div>
  );
};

export default memo(ViewTab);