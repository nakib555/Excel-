import React from 'react';
import { RefreshCw, List, Settings, Link2 } from 'lucide-react';
import { RibbonGroup, RibbonButton, TabProps } from '../../shared';

const QueriesConnectionsGroup: React.FC<TabProps> = () => {
  return (
    <RibbonGroup label="Queries & Connections">
         <div className="flex items-center gap-1 h-full">
             <RibbonButton variant="large" icon={<RefreshCw size={20} className="text-green-600" />} label="Refresh" subLabel="All" hasDropdown onClick={() => {}} />
             <div className="flex flex-col gap-0 justify-center">
                 <RibbonButton variant="small" icon={<List size={14} className="text-slate-600" />} label="Queries & Connections" onClick={() => {}} />
                 <RibbonButton variant="small" icon={<Settings size={14} className="text-slate-500" />} label="Properties" disabled onClick={() => {}} />
                 <RibbonButton variant="small" icon={<Link2 size={14} className="text-slate-500" />} label="Edit Links" disabled onClick={() => {}} />
             </div>
         </div>
    </RibbonGroup>
  );
};

export default QueriesConnectionsGroup;