import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { RibbonGroup, TabProps } from '../shared';

import Themes from './Themes/Themes';
import Colors from './Themes/Colors';
import Fonts from './Themes/Fonts';
import Effects from './Themes/Effects';

import Margins from './PageSetup/Margins';
import Orientation from './PageSetup/Orientation';
import Size from './PageSetup/Size';
import PrintArea from './PageSetup/PrintArea';
import Breaks from './PageSetup/Breaks';
import Background from './PageSetup/Background';
import PrintTitles from './PageSetup/PrintTitles';

import Width from './ScaleToFit/Width';
import Height from './ScaleToFit/Height';
import Scale from './ScaleToFit/Scale';

import GridlinesView from './SheetOptions/GridlinesView';
import GridlinesPrint from './SheetOptions/GridlinesPrint';
import HeadingsView from './SheetOptions/HeadingsView';
import HeadingsPrint from './SheetOptions/HeadingsPrint';

import BringForward from './Arrange/BringForward';
import SendBackward from './Arrange/SendBackward';
import SelectionPane from './Arrange/SelectionPane';
import Align from './Arrange/Align';
import Group from './Arrange/Group';
import Rotate from './Arrange/Rotate';

const PageLayoutTab: React.FC<TabProps> = () => {
  return (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex h-full min-w-max gap-1"
    >
        <RibbonGroup label="Themes">
            <div className="flex items-center gap-2 h-full">
                <Themes />
                <div className="flex flex-col gap-0 justify-center">
                    <Colors />
                    <Fonts />
                    <Effects />
                </div>
            </div>
        </RibbonGroup>

        <RibbonGroup label="Page Setup">
             <div className="flex items-center gap-1 h-full">
                 <Margins />
                 <Orientation />
                 <Size />
                 <PrintArea />
                 <div className="flex flex-col gap-0 justify-center pl-1">
                     <Breaks />
                     <Background />
                     <PrintTitles />
                 </div>
             </div>
        </RibbonGroup>

        <RibbonGroup label="Scale to Fit">
            <div className="flex flex-col gap-0.5 justify-center h-full px-1">
                <Width />
                <Height />
                <Scale />
            </div>
        </RibbonGroup>

        <RibbonGroup label="Sheet Options">
            <div className="flex gap-4 px-2 h-full items-center">
                <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] font-semibold text-slate-700">Gridlines</span>
                    <GridlinesView />
                    <GridlinesPrint />
                </div>
                <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] font-semibold text-slate-700">Headings</span>
                    <HeadingsView />
                    <HeadingsPrint />
                </div>
            </div>
        </RibbonGroup>

         <RibbonGroup label="Arrange">
             <div className="flex items-center gap-1 h-full">
                 <div className="flex flex-col gap-0 justify-center">
                     <BringForward />
                     <SendBackward />
                 </div>
                 <SelectionPane />
                 <div className="flex flex-col gap-0 justify-center">
                     <Align />
                     <Group />
                     <Rotate />
                 </div>
             </div>
        </RibbonGroup>
    </motion.div>
  );
};

export default memo(PageLayoutTab);