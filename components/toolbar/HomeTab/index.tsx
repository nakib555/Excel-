import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { TabProps } from '../../shared';
import { createLazyGroup } from '../createLazyGroup';

// Lazy load groups using the centralized utility with automatic skeleton loading
const ClipboardGroup = createLazyGroup(() => import('./groups/ClipboardGroup'));
const FontGroup = createLazyGroup(() => import('./groups/FontGroup'));
const AlignmentGroup = createLazyGroup(() => import('./groups/AlignmentGroup'));
const NumberGroup = createLazyGroup(() => import('./groups/NumberGroup'));
const StylesGroup = createLazyGroup(() => import('./groups/StylesGroup'));
const CellsGroup = createLazyGroup(() => import('./groups/CellsGroup'));
const EditingGroup = createLazyGroup(() => import('./groups/EditingGroup'));

const HomeTab: React.FC<TabProps> = (props) => {
  return (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex h-full min-w-max gap-1"
    >
        <ClipboardGroup {...props} />
        <FontGroup {...props} />
        <AlignmentGroup {...props} />
        <NumberGroup {...props} />
        <StylesGroup {...props} />
        <CellsGroup {...props} />
        <EditingGroup {...props} />
    </motion.div>
  );
};

export default memo(HomeTab);