import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { TabProps } from '../../shared';
import { createLazyGroup } from '../createLazyGroup';

const SheetViewGroup = createLazyGroup(() => import('./groups/SheetViewGroup'));
const WorkbookViewsGroup = createLazyGroup(() => import('./groups/WorkbookViewsGroup'));
const ShowGroup = createLazyGroup(() => import('./groups/ShowGroup'));
const ZoomGroup = createLazyGroup(() => import('./groups/ZoomGroup'));
const WindowGroup = createLazyGroup(() => import('./groups/WindowGroup'));

const ViewTab: React.FC<TabProps> = (props) => {
  return (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex h-full min-w-max gap-1"
    >
         <SheetViewGroup {...props} />
         <WorkbookViewsGroup {...props} />
         <ShowGroup {...props} />
         <ZoomGroup {...props} />
         <WindowGroup {...props} />
    </motion.div>
  );
};

export default memo(ViewTab);