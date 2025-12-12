import React from 'react';
import { FileCode } from 'lucide-react';
import { RibbonGroup, DraggableScrollContainer, TabProps } from '../../shared';

const OfficeScriptsGalleryGroup: React.FC<TabProps> = () => {
  return (
    <RibbonGroup label="Office Scripts Gallery">
        <DraggableScrollContainer className="h-full">
             <div className="grid grid-rows-3 grid-flow-col gap-x-2 gap-y-0.5 p-1 h-full content-center">
                 <button className="flex items-center gap-2 px-2 py-0.5 bg-transparent hover:bg-slate-100 border border-transparent hover:border-slate-200 rounded-sm text-[11px] w-56 text-left transition-colors whitespace-nowrap text-slate-700">
                     <FileCode size={14} className="text-emerald-600 flex-shrink-0" /> <span className="truncate">Unhide All Rows and Columns</span>
                 </button>
                 <button className="flex items-center gap-2 px-2 py-0.5 bg-transparent hover:bg-slate-100 border border-transparent hover:border-slate-200 rounded-sm text-[11px] w-56 text-left transition-colors whitespace-nowrap text-slate-700">
                     <FileCode size={14} className="text-emerald-600 flex-shrink-0" /> <span className="truncate">Remove Hyperlinks from Sheet</span>
                 </button>
                 <button className="flex items-center gap-2 px-2 py-0.5 bg-transparent hover:bg-slate-100 border border-transparent hover:border-slate-200 rounded-sm text-[11px] w-56 text-left transition-colors whitespace-nowrap text-slate-700">
                     <FileCode size={14} className="text-emerald-600 flex-shrink-0" /> <span className="truncate">Freeze Selection</span>
                 </button>
                 <button className="flex items-center gap-2 px-2 py-0.5 bg-transparent hover:bg-slate-100 border border-transparent hover:border-slate-200 rounded-sm text-[11px] w-56 text-left transition-colors whitespace-nowrap text-slate-700">
                     <FileCode size={14} className="text-emerald-600 flex-shrink-0" /> <span className="truncate">Count Empty Rows</span>
                 </button>
                 <button className="flex items-center gap-2 px-2 py-0.5 bg-transparent hover:bg-slate-100 border border-transparent hover:border-slate-200 rounded-sm text-[11px] w-56 text-left transition-colors whitespace-nowrap text-slate-700">
                     <FileCode size={14} className="text-emerald-600 flex-shrink-0" /> <span className="truncate">Make a Subtable from Selection</span>
                 </button>
                  <button className="flex items-center gap-2 px-2 py-0.5 bg-transparent hover:bg-slate-100 border border-transparent hover:border-slate-200 rounded-sm text-[11px] w-56 text-left transition-colors whitespace-nowrap text-slate-700">
                     <FileCode size={14} className="text-emerald-600 flex-shrink-0" /> <span className="truncate">Return Table Data as JSON</span>
                 </button>
             </div>
        </DraggableScrollContainer>
    </RibbonGroup>
  );
};

export default OfficeScriptsGalleryGroup;