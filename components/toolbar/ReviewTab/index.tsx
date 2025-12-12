import React, { memo, Suspense } from 'react';
import { motion } from 'framer-motion';
import { TabProps, GroupSkeleton } from '../../shared';

const ProofingGroup = React.lazy(() => import('./groups/ProofingGroup'));
const PerformanceGroup = React.lazy(() => import('./groups/PerformanceGroup'));
const AccessibilityGroup = React.lazy(() => import('./groups/AccessibilityGroup'));
const LanguageGroup = React.lazy(() => import('./groups/LanguageGroup'));
const CommentsGroup = React.lazy(() => import('./groups/CommentsGroup'));
const ProtectGroup = React.lazy(() => import('./groups/ProtectGroup'));
const InkGroup = React.lazy(() => import('./groups/InkGroup'));

const ReviewTab: React.FC<TabProps> = (props) => {
  return (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex h-full min-w-max gap-1"
    >
        <Suspense fallback={<GroupSkeleton />}><ProofingGroup {...props} /></Suspense>
        <Suspense fallback={<GroupSkeleton />}><PerformanceGroup {...props} /></Suspense>
        <Suspense fallback={<GroupSkeleton />}><AccessibilityGroup {...props} /></Suspense>
        <Suspense fallback={<GroupSkeleton />}><LanguageGroup {...props} /></Suspense>
        <Suspense fallback={<GroupSkeleton />}><CommentsGroup {...props} /></Suspense>
        <Suspense fallback={<GroupSkeleton />}><ProtectGroup {...props} /></Suspense>
        <Suspense fallback={<GroupSkeleton />}><InkGroup {...props} /></Suspense>
    </motion.div>
  );
};

export default memo(ReviewTab);