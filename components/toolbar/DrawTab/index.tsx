import React, { memo, Suspense } from 'react';
import { motion } from 'framer-motion';
import { TabProps, GroupSkeleton } from '../../shared';

const UndoGroup = React.lazy(() => import('./groups/UndoGroup'));
const DrawingToolsGroup = React.lazy(() => import('./groups/DrawingToolsGroup'));
const ConvertGroup = React.lazy(() => import('./groups/ConvertGroup'));
const ReplayGroup = React.lazy(() => import('./groups/ReplayGroup'));

const DrawTab: React.FC<TabProps> = (props) => {
  return (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex h-full min-w-max gap-1"
    >
         <Suspense fallback={<GroupSkeleton />}><UndoGroup {...props} /></Suspense>
         <Suspense fallback={<GroupSkeleton />}><DrawingToolsGroup {...props} /></Suspense>
         <Suspense fallback={<GroupSkeleton />}><ConvertGroup {...props} /></Suspense>
         <Suspense fallback={<GroupSkeleton />}><ReplayGroup {...props} /></Suspense>
    </motion.div>
  );
};

export default memo(DrawTab);