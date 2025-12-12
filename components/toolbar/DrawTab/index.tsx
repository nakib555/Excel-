import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { TabProps } from '../../shared';
import { createLazyGroup } from '../createLazyGroup';

const UndoGroup = createLazyGroup(() => import('./groups/UndoGroup'));
const DrawingToolsGroup = createLazyGroup(() => import('./groups/DrawingToolsGroup'));
const ConvertGroup = createLazyGroup(() => import('./groups/ConvertGroup'));
const ReplayGroup = createLazyGroup(() => import('./groups/ReplayGroup'));

const DrawTab: React.FC<TabProps> = (props) => {
  return (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex h-full min-w-max gap-1"
    >
         <UndoGroup {...props} />
         <DrawingToolsGroup {...props} />
         <ConvertGroup {...props} />
         <ReplayGroup {...props} />
    </motion.div>
  );
};

export default memo(DrawTab);