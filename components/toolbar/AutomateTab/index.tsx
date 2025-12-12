import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { TabProps } from '../../shared';
import { createLazyGroup } from '../createLazyGroup';

const OfficeScriptsGroup = createLazyGroup(() => import('./groups/OfficeScriptsGroup'));
const OfficeScriptsGalleryGroup = createLazyGroup(() => import('./groups/OfficeScriptsGalleryGroup'));
const PowerAutomateGroup = createLazyGroup(() => import('./groups/PowerAutomateGroup'));

const AutomateTab: React.FC<TabProps> = (props) => {
  return (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex h-full min-w-max gap-1"
    >
        <OfficeScriptsGroup {...props} />
        <OfficeScriptsGalleryGroup {...props} />
        <PowerAutomateGroup {...props} />
    </motion.div>
  );
};

export default memo(AutomateTab);