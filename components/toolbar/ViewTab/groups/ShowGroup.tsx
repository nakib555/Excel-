import React from 'react';
import { PanelLeftClose, Plus } from 'lucide-react';
import { RibbonGroup, RibbonButton, TabProps } from '../../shared';

const ShowGroup: React.FC<TabProps> = () => {
  return (
    <RibbonGroup label="Show">
         <div className="flex gap-4 px-2 h-full items-center">
            <RibbonButton variant="large" icon={<PanelLeftClose size={20} className="text-slate-700" />} label="Navigation" onClick={() => {}} />
            <div className="flex flex-col gap-1">
                <label className="flex items-center gap-1 text-[10px] text-slate-600"><input type="checkbox" disabled /> Ruler</label>
                <label className="flex items-center gap-1 text-[10px] text-slate-600"><input type="checkbox" checked readOnly /> Gridlines</label>
                <label className="flex items-center gap-1 text-[10px] text-slate-600"><input type="checkbox" checked readOnly /> Formula Bar</label>
            </div>
             <div className="flex flex-col gap-1">
                <label className="flex items-center gap-1 text-[10px] text-slate-600"><input type="checkbox" checked readOnly /> Headings</label>
                <label className="flex items-center gap-1 text-[10px] text-slate-600"><input type="checkbox" checked readOnly /> Data Type Icons</label>
                <div className="flex items-center gap-1 text-[10px] text-green-700 font-medium"><Plus size={10} /> Focus Cell</div>
            </div>
        </div>
    </RibbonGroup>
  );
};

export default ShowGroup;