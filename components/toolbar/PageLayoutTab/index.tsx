import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { TabProps } from '../../shared';
import { createLazyGroup } from '../createLazyGroup';

const ThemesGroup = createLazyGroup(() => import('./groups/ThemesGroup'));
const PageSetupGroup = createLazyGroup(() => import('./groups/PageSetupGroup'));
const ScaleToFitGroup = createLazyGroup(() => import('./groups/ScaleToFitGroup'));
const SheetOptionsGroup = createLazyGroup(() => import('./groups/SheetOptionsGroup'));
const ArrangeGroup = createLazyGroup(() => import('./groups/ArrangeGroup'));

const PageLayoutTab: React.FC<TabProps> = (props) => {
  return (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex h-full min-w-max gap-1"
    >
        <ThemesGroup {...props} />
        <PageSetupGroup {...props} />
        <ScaleToFitGroup {...props} />
        <SheetOptionsGroup {...props} />
        <ArrangeGroup {...props} />
    </motion.div>
  );
};

export default memo(PageLayoutTab);