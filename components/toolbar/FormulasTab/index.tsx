import React, { memo, Suspense } from 'react';
import { motion } from 'framer-motion';
import { TabProps, GroupSkeleton } from '../../shared';

const FunctionLibraryGroup = React.lazy(() => import('./groups/FunctionLibraryGroup'));
const DefinedNamesGroup = React.lazy(() => import('./groups/DefinedNamesGroup'));
const FormulaAuditingGroup = React.lazy(() => import('./groups/FormulaAuditingGroup'));
const CalculationGroup = React.lazy(() => import('./groups/CalculationGroup'));

const FormulasTab: React.FC<TabProps> = (props) => {
  return (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex h-full min-w-max gap-1"
    >
        <Suspense fallback={<GroupSkeleton />}><FunctionLibraryGroup {...props} /></Suspense>
        <Suspense fallback={<GroupSkeleton />}><DefinedNamesGroup {...props} /></Suspense>
        <Suspense fallback={<GroupSkeleton />}><FormulaAuditingGroup {...props} /></Suspense>
        <Suspense fallback={<GroupSkeleton />}><CalculationGroup {...props} /></Suspense>
    </motion.div>
  );
};

export default memo(FormulasTab);