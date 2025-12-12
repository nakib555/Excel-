import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { TabProps } from '../shared';
import ClipboardGroup from './Clipboard/ClipboardGroup';
import FontGroup from './Font/FontGroup';
import AlignmentGroup from './Alignment/AlignmentGroup';
import NumberGroup from './Number/NumberGroup';
import StylesGroup from './Styles/StylesGroup';
import CellsGroup from './Cells/CellsGroup';
import EditingGroup from './Editing/EditingGroup';

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
