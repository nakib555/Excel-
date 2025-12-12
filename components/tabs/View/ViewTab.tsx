import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { RibbonGroup, TabProps } from '../shared';

import DefaultViewSelector from './SheetView/DefaultViewSelector';
import SaveView from './SheetView/SaveView';
import HideView from './SheetView/HideView';

import NormalView from './WorkbookViews/NormalView';
import PageBreakPreview from './WorkbookViews/PageBreakPreview';
import PageLayout from './WorkbookViews/PageLayout';
import CustomViews from './WorkbookViews/CustomViews';

import NavigationPane from './Show/NavigationPane';
import Ruler from './Show/Ruler';
import Gridlines from './Show/Gridlines';
import FormulaBar from './Show/FormulaBar';
import Headings from './Show/Headings';
import DataTypeIcons from './Show/DataTypeIcons';
import FocusCell from './Show/FocusCell';

import Zoom from './Zoom/Zoom';
import Zoom100 from './Zoom/Zoom100';
import ZoomToSelection from './Zoom/ZoomToSelection';

import NewWindow from './Window/NewWindow';
import ArrangeAll from './Window/ArrangeAll';
import FreezePanes from './Window/FreezePanes';
import Split from './Window/Split';
import Hide from './Window/Hide';
import Unhide from './Window/Unhide';
import SwitchWindows from './Window/SwitchWindows';

const ViewTab: React.FC<TabProps> = () => {
  return (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex h-full min-w-max gap-1"
    >
         <RibbonGroup label="Sheet View">
             <div className="flex items-center gap-1 h-full">
                 <div className="flex flex-col gap-0 justify-center">
                     <DefaultViewSelector />
                     <div className="flex gap-1 mt-1">
                          <SaveView />
                          <HideView />
                     </div>
                 </div>
             </div>
        </RibbonGroup>

        <RibbonGroup label="Workbook Views">
            <div className="flex items-center gap-1 h-full">
                 <NormalView />
                 <PageBreakPreview />
                 <PageLayout />
                 <CustomViews />
            </div>
        </RibbonGroup>

        <RibbonGroup label="Show">
             <div className="flex gap-4 px-2 h-full items-center">
                <NavigationPane />
                <div className="flex flex-col gap-1">
                    <Ruler />
                    <Gridlines />
                    <FormulaBar />
                </div>
                 <div className="flex flex-col gap-1">
                    <Headings />
                    <DataTypeIcons />
                    <FocusCell />
                </div>
            </div>
        </RibbonGroup>

        <RibbonGroup label="Zoom">
             <div className="flex items-center gap-1 h-full">
                 <Zoom />
                 <Zoom100 />
                 <ZoomToSelection />
             </div>
        </RibbonGroup>

        <RibbonGroup label="Window">
             <div className="flex items-center gap-1 h-full">
                 <NewWindow />
                 <ArrangeAll />
                 <FreezePanes />
                  <div className="flex flex-col gap-0 justify-center">
                     <div className="flex gap-0.5">
                        <Split />
                        <Hide />
                        <Unhide />
                     </div>
                      <div className="flex gap-0.5">
                        <SwitchWindows />
                     </div>
                 </div>
             </div>
        </RibbonGroup>
    </motion.div>
  );
};

export default memo(ViewTab);