import React from 'react';
import { DraggableScrollContainer } from '../../../shared';
import UnhideAllRowsCols from './UnhideAllRowsCols';
import RemoveHyperlinks from './RemoveHyperlinks';
import FreezeSelection from './FreezeSelection';
import CountEmptyRows from './CountEmptyRows';
import MakeSubtable from './MakeSubtable';
import ReturnTableAsJSON from './ReturnTableAsJSON';

const ScriptsGallery = () => (
    <DraggableScrollContainer className="h-full">
         <div className="grid grid-rows-3 grid-flow-col gap-x-2 gap-y-0.5 p-1 h-full content-center">
             <UnhideAllRowsCols />
             <RemoveHyperlinks />
             <FreezeSelection />
             <CountEmptyRows />
             <MakeSubtable />
             <ReturnTableAsJSON />
         </div>
    </DraggableScrollContainer>
);

export default ScriptsGallery;