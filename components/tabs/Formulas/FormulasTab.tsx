import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { TabProps } from '../shared';

import FunctionLibraryGroup from './FunctionLibrary/FunctionLibraryGroup';
import DefinedNamesGroup from './DefinedNames/DefinedNamesGroup';
import FormulaAuditingGroup from './FormulaAuditing/FormulaAuditingGroup';
import CalculationGroup from './Calculation/CalculationGroup';

const FormulasTab: React.FC<TabProps> = () => {
  return (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex h-full min-w-max gap-1"
    >
        <FunctionLibraryGroup />
        <DefinedNamesGroup />
        <FormulaAuditingGroup />
        <CalculationGroup />
    </motion.div>
  );
};

export default memo(FormulasTab);