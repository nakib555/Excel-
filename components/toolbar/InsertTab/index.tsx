import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { TabProps } from '../../shared';
import { createLazyGroup } from '../createLazyGroup';

const TablesGroup = createLazyGroup(() => import('./groups/TablesGroup'));
const IllustrationsGroup = createLazyGroup(() => import('./groups/IllustrationsGroup'));
const ChartsGroup = createLazyGroup(() => import('./groups/ChartsGroup'));
const SparklinesGroup = createLazyGroup(() => import('./groups/SparklinesGroup'));
const FiltersGroup = createLazyGroup(() => import('./groups/FiltersGroup'));
const LinksCommentsGroup = createLazyGroup(() => import('./groups/LinksCommentsGroup'));
const TextSymbolsGroup = createLazyGroup(() => import('./groups/TextSymbolsGroup'));

const InsertTab: React.FC<TabProps> = (props) => {
  return (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex h-full min-w-max gap-1"
    >
        <TablesGroup {...props} />
        <IllustrationsGroup {...props} />
        <ChartsGroup {...props} />
        <SparklinesGroup {...props} />
        <FiltersGroup {...props} />
        <LinksCommentsGroup {...props} />
        <TextSymbolsGroup {...props} />
    </motion.div>
  );
};

export default memo(InsertTab);