
import React, { memo, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { TabProps } from '../shared';
import { GroupSkeleton } from '../../Skeletons';

const CopilotGroup = lazy(() => import('./Copilot/CopilotGroup'));
const AnalysisGroup = lazy(() => import('./Analyze/AnalyzeGroup'));
const GenerationGroup = lazy(() => import('./Generate/GenerateGroup'));
const EditGroup = lazy(() => import('./Edit/EditGroup'));

const AIAssistantTab: React.FC<TabProps> = (props) => {
  return (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex h-full min-w-max gap-1"
    >
        <Suspense fallback={<GroupSkeleton width={100} />}><CopilotGroup {...props} /></Suspense>
        <Suspense fallback={<GroupSkeleton width={200} />}><AnalysisGroup {...props} /></Suspense>
        <Suspense fallback={<GroupSkeleton width={200} />}><GenerationGroup {...props} /></Suspense>
        <Suspense fallback={<GroupSkeleton width={140} />}><EditGroup {...props} /></Suspense>
    </motion.div>
  );
};

export default memo(AIAssistantTab);
