import React from 'react';
import { RibbonGroup, TabProps } from '../../shared';

const ScaleToFitGroup: React.FC<TabProps> = () => {
  return (
    <RibbonGroup label="Scale to Fit">
        <div className="flex flex-col gap-0.5 justify-center h-full px-1">
            <div className="flex items-center gap-2 text-[10px] text-slate-600">
                <span className="w-10">Width:</span>
                <div className="border border-slate-300 rounded px-1 w-20 bg-white text-slate-500">Automatic</div>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-600">
                <span className="w-10">Height:</span>
                <div className="border border-slate-300 rounded px-1 w-20 bg-white text-slate-500">Automatic</div>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-600">
                <span className="w-10">Scale:</span>
                <div className="border border-slate-300 rounded px-1 w-16 bg-white text-slate-500">100%</div>
            </div>
        </div>
    </RibbonGroup>
  );
};

export default ScaleToFitGroup;