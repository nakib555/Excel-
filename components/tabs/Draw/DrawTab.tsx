import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { RibbonGroup, Separator, TabProps } from '../shared';

import Undo from './Undo';
import Redo from './Redo';

import Select from './DrawingTools/Select';
import Lasso from './DrawingTools/Lasso';
import Eraser from './DrawingTools/Eraser';
import BlackPen from './DrawingTools/BlackPen';
import RedPen from './DrawingTools/RedPen';
import GalaxyPen from './DrawingTools/GalaxyPen';
import Highlight from './DrawingTools/Highlight';
import GreenPen from './DrawingTools/GreenPen';
import AddPen from './DrawingTools/AddPen';

import InkToShape from './Convert/InkToShape';
import InkToMath from './Convert/InkToMath';
import InkReplay from './Convert/InkReplay';

const DrawTab: React.FC<TabProps> = () => {
  return (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex h-full min-w-max gap-1"
    >
         <RibbonGroup label="Undo">
            <div className="flex flex-col gap-0 h-full justify-center">
                <Undo />
                <Redo />
            </div>
        </RibbonGroup>

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

        <RibbonGroup label="Convert">
            <div className="flex items-center gap-1 h-full">
                <InkToShape />
                <InkToMath />
            </div>
        </RibbonGroup>

        <RibbonGroup label="Replay">
            <InkReplay />
        </RibbonGroup>
    </motion.div>
  );
};

export default memo(DrawTab);