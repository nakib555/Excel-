
import React, { memo, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { RibbonGroup, Separator, TabProps } from '../shared';
import { GroupSkeleton } from '../../Skeletons';

// Lazy load tools to simulate feature isolation and loading polish
const Select = lazy(() => import('./DrawingTools/Select'));
const Lasso = lazy(() => import('./DrawingTools/Lasso'));
const Eraser = lazy(() => import('./DrawingTools/Eraser'));
const BlackPen = lazy(() => import('./DrawingTools/BlackPen'));
const RedPen = lazy(() => import('./DrawingTools/RedPen'));
const GalaxyPen = lazy(() => import('./DrawingTools/GalaxyPen'));
const Highlight = lazy(() => import('./DrawingTools/Highlight'));
const GreenPen = lazy(() => import('./DrawingTools/GreenPen'));
const AddPen = lazy(() => import('./DrawingTools/AddPen'));

const InkToShape = lazy(() => import('./Convert/InkToShape'));
const InkToMath = lazy(() => import('./Convert/InkToMath'));
const InkReplay = lazy(() => import('./Convert/InkReplay'));

const Undo = lazy(() => import('./Undo'));
const Redo = lazy(() => import('./Redo'));

const DrawTab: React.FC<TabProps> = ({ onUndo, onRedo }) => {
  return (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex h-full min-w-max gap-1"
    >
        <Suspense fallback={<GroupSkeleton width={350} />}>
            <RibbonGroup label="Drawing Tools">
                <div className="flex items-center gap-1 h-full">
                    <Select />
                    <Lasso />
                    <Separator />
                    <Eraser />
                    <div className="flex gap-1 items-center px-1">
                        <BlackPen />
                        <RedPen />
                        <GalaxyPen />
                        <Highlight />
                        <GreenPen />
                    </div>
                    <AddPen />
                </div>
            </RibbonGroup>
        </Suspense>

        <Suspense fallback={<GroupSkeleton width={120} />}>
            <RibbonGroup label="Convert">
                <div className="flex items-center gap-1 h-full">
                    <InkToShape />
                    <InkToMath />
                </div>
            </RibbonGroup>
        </Suspense>

        <Suspense fallback={<GroupSkeleton width={80} />}>
            <RibbonGroup label="Replay">
                <InkReplay />
            </RibbonGroup>
        </Suspense>

        <Suspense fallback={<GroupSkeleton width={80} />}>
            <RibbonGroup label="History">
                <div className="flex items-center gap-1 h-full">
                    <Undo onUndo={onUndo} />
                    <Redo onRedo={onRedo} />
                </div>
            </RibbonGroup>
        </Suspense>
    </motion.div>
  );
};

export default memo(DrawTab);