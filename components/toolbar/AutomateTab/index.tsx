import React, { memo, Suspense } from 'react';
import { motion } from 'framer-motion';
import { TabProps, GroupSkeleton } from '../../shared';

const OfficeScriptsGroup = React.lazy(() => import('./groups/OfficeScriptsGroup'));
const OfficeScriptsGalleryGroup = React.lazy(() => import('./groups/OfficeScriptsGalleryGroup'));
const PowerAutomateGroup = React.lazy(() => import('./groups/PowerAutomateGroup'));

const AutomateTab: React.FC<TabProps> = (props) => {
  return (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex h-full min-w-max gap-1"
    >
        <Suspense fallback={<GroupSkeleton />}><OfficeScriptsGroup {...props} /></Suspense>
        <Suspense fallback={<GroupSkeleton />}><OfficeScriptsGalleryGroup {...props} /></Suspense>
        <Suspense fallback={<GroupSkeleton />}><PowerAutomateGroup {...props} /></Suspense>
    </motion.div>
  );
};

export default memo(AutomateTab);