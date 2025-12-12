import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { TabProps } from '../../shared';
import { createLazyGroup } from '../createLazyGroup';

const ProofingGroup = createLazyGroup(() => import('./groups/ProofingGroup'));
const PerformanceGroup = createLazyGroup(() => import('./groups/PerformanceGroup'));
const AccessibilityGroup = createLazyGroup(() => import('./groups/AccessibilityGroup'));
const LanguageGroup = createLazyGroup(() => import('./groups/LanguageGroup'));
const CommentsGroup = createLazyGroup(() => import('./groups/CommentsGroup'));
const ProtectGroup = createLazyGroup(() => import('./groups/ProtectGroup'));
const InkGroup = createLazyGroup(() => import('./groups/InkGroup'));

const ReviewTab: React.FC<TabProps> = (props) => {
  return (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex h-full min-w-max gap-1"
    >
        <ProofingGroup {...props} />
        <PerformanceGroup {...props} />
        <AccessibilityGroup {...props} />
        <LanguageGroup {...props} />
        <CommentsGroup {...props} />
        <ProtectGroup {...props} />
        <InkGroup {...props} />
    </motion.div>
  );
};

export default memo(ReviewTab);