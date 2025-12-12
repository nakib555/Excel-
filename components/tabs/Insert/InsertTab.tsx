import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { TabProps } from '../shared';
import TablesGroup from './Tables/TablesGroup';
import IllustrationsGroup from './Illustrations/IllustrationsGroup';
import ChartsGroup from './Charts/ChartsGroup';
import SparklinesGroup from './Sparklines/SparklinesGroup';
import FiltersGroup from './Filters/FiltersGroup';
import LinksCommentsGroup from './LinksComments/LinksCommentsGroup';
import TextSymbolsGroup from './TextSymbols/TextSymbolsGroup';

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
