import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { TabProps } from '../../shared';
import { createLazyGroup } from '../createLazyGroup';

const FunctionLibraryGroup = createLazyGroup(() => import('./groups/FunctionLibraryGroup'));
const DefinedNamesGroup = createLazyGroup(() => import('./groups/DefinedNamesGroup'));
const FormulaAuditingGroup = createLazyGroup(() => import('./groups/FormulaAuditingGroup'));
const CalculationGroup = createLazyGroup(() => import('./groups/CalculationGroup'));

const FormulasTab: React.FC<TabProps> = (props) => {
  return (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex h-full min-w-max gap-1"
    >
        <FunctionLibraryGroup {...props} />
        <DefinedNamesGroup {...props} />
        <FormulaAuditingGroup {...props} />
        <CalculationGroup {...props} />
    </motion.div>
  );
};

export default memo(FormulasTab);