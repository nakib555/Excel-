
import React, { memo, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { TabProps } from '../shared';
import { GroupSkeleton } from '../../Skeletons';

// Granular lazy loading for tool groups
const ClipboardGroup = lazy(() => import('./Clipboard/ClipboardGroup'));
const FontGroup = lazy(() => import('./Font/FontGroup'));
const AlignmentGroup = lazy(() => import('./Alignment/AlignmentGroup'));
const NumberGroup = lazy(() => import('./Number/NumberGroup'));
const StylesGroup = lazy(() => import('./Styles/StylesGroup'));
const CellsGroup = lazy(() => import('./Cells/CellsGroup'));
const EditingGroup = lazy(() => import('./Editing/EditingGroup'));

const HomeTab: React.FC<TabProps> = (props) => {
  return (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex h-full min-w-max gap-1"
    >
        <Suspense fallback={<GroupSkeleton width={80} />}><ClipboardGroup {...props} /></Suspense>
        <Suspense fallback={<GroupSkeleton width={260} />}><FontGroup {...props} /></Suspense>
        <Suspense fallback={<GroupSkeleton width={250} />}><AlignmentGroup {...props} /></Suspense>
        <Suspense fallback={<GroupSkeleton width={160} />}><NumberGroup {...props} /></Suspense>
        <Suspense fallback={<GroupSkeleton width={180} />}><StylesGroup {...props} /></Suspense>
        <Suspense fallback={<GroupSkeleton width={120} />}><CellsGroup {...props} /></Suspense>
        <Suspense fallback={<GroupSkeleton width={120} />}><EditingGroup {...props} /></Suspense>
    </motion.div>
  );
};

export default memo(HomeTab);
