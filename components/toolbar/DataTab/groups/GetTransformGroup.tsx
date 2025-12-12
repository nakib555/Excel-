import React from 'react';
import { Database, FileText, Globe, Table } from 'lucide-react';
import { RibbonGroup, RibbonButton, TabProps } from '../../shared';

const GetTransformGroup: React.FC<TabProps> = () => {
  return (
    <RibbonGroup label="Get & Transform Data">
        <div className="flex items-center gap-1 h-full">
            <RibbonButton variant="large" icon={<Database size={20} className="text-slate-600" />} label="Get" subLabel="Data" hasDropdown onClick={() => {}} />
            <RibbonButton variant="large" icon={<FileText size={20} className="text-slate-500" />} label="From Text/" subLabel="CSV" onClick={() => {}} />
            <RibbonButton variant="large" icon={<Globe size={20} className="text-blue-500" />} label="From" subLabel="Web" onClick={() => {}} />
            <RibbonButton variant="large" icon={<Table size={20} className="text-emerald-600" />} label="From Table/" subLabel="Range" onClick={() => {}} />
        </div>
    </RibbonGroup>
  );
};

export default GetTransformGroup;