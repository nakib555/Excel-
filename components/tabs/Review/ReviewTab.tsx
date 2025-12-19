
import React, { memo, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { RibbonGroup, TabProps } from '../shared';
import { GroupSkeleton } from '../../Skeletons';

// Granular lazy loading
const Spelling = lazy(() => import('./Proofing/Spelling'));
const Thesaurus = lazy(() => import('./Proofing/Thesaurus'));
const WorkbookStatistics = lazy(() => import('./Proofing/WorkbookStatistics'));
const CheckPerformance = lazy(() => import('./Performance/CheckPerformance'));
const CheckAccessibility = lazy(() => import('./Accessibility/CheckAccessibility'));
const Translate = lazy(() => import('./Language/Translate'));
const NewComment = lazy(() => import('./Comments/NewComment'));
const DeleteComment = lazy(() => import('./Comments/DeleteComment'));
const PrevComment = lazy(() => import('./Comments/PrevComment'));
const NextComment = lazy(() => import('./Comments/NextComment'));
const ShowComments = lazy(() => import('./Comments/ShowComments'));
const ProtectSheet = lazy(() => import('./Protect/ProtectSheet'));
const ProtectWorkbook = lazy(() => import('./Protect/ProtectWorkbook'));
const AllowEditRanges = lazy(() => import('./Protect/AllowEditRanges'));
const UnshareWorkbook = lazy(() => import('./Protect/UnshareWorkbook'));
const HideInk = lazy(() => import('./Ink/HideInk'));

const ReviewTab: React.FC<TabProps> = ({ onInsertComment, onDeleteComment }) => {
  return (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex h-full min-w-max gap-1"
    >
        <Suspense fallback={<GroupSkeleton width={160} />}>
            <RibbonGroup label="Proofing">
                 <div className="flex items-center gap-1 h-full">
                     <Spelling />
                     <Thesaurus />
                     <WorkbookStatistics />
                 </div>
            </RibbonGroup>
        </Suspense>

        <Suspense fallback={<GroupSkeleton width={80} />}>
            <RibbonGroup label="Performance">
                 <CheckPerformance />
            </RibbonGroup>
        </Suspense>

        <Suspense fallback={<GroupSkeleton width={80} />}>
            <RibbonGroup label="Accessibility">
                 <CheckAccessibility />
            </RibbonGroup>
        </Suspense>

        <Suspense fallback={<GroupSkeleton width={80} />}>
            <RibbonGroup label="Language">
                 <Translate />
            </RibbonGroup>
        </Suspense>
        
        <Suspense fallback={<GroupSkeleton width={180} />}>
             <RibbonGroup label="Comments">
                 <div className="flex items-center gap-1 h-full">
                     <NewComment onInsertComment={onInsertComment} />
                     <div className="flex flex-col gap-0 justify-center">
                         <DeleteComment onDeleteComment={onDeleteComment} />
                         <PrevComment />
                         <NextComment />
                     </div>
                     <ShowComments />
                 </div>
            </RibbonGroup>
        </Suspense>

        <Suspense fallback={<GroupSkeleton width={180} />}>
            <RibbonGroup label="Protect">
                <div className="flex items-center gap-1 h-full">
                    <ProtectSheet />
                    <ProtectWorkbook />
                    <AllowEditRanges />
                    <UnshareWorkbook />
                </div>
            </RibbonGroup>
        </Suspense>
        
        <Suspense fallback={<GroupSkeleton width={80} />}>
             <RibbonGroup label="Ink">
                 <HideInk />
            </RibbonGroup>
        </Suspense>
    </motion.div>
  );
};

export default memo(ReviewTab);
