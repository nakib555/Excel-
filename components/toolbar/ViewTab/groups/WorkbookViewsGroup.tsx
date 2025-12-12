import React from 'react';
import { Grid, Layout, FileSpreadsheet, Settings } from 'lucide-react';
import { RibbonGroup, RibbonButton, TabProps } from '../../shared';

const WorkbookViewsGroup: React.FC<TabProps> = () => {
  return (
    <RibbonGroup label="Workbook Views">
        <div className="flex items-center gap-1 h-full">
             <RibbonButton variant="large" icon={<Grid size={20} className="text-blue-600" />} label="Normal" onClick={() => {}} />
             <RibbonButton variant="large" icon={<Layout size={20} className="text-orange-500" />} label="Page Break" subLabel="Preview" onClick={() => {}} />
             <RibbonButton variant="large" icon={<FileSpreadsheet size={20} className="text-green-600" />} label="Page Layout" onClick={() => {}} />
             <RibbonButton variant="large" icon={<Settings size={20} className="text-slate-600" />} label="Custom" subLabel="Views" onClick={() => {}} />
        </div>
    </RibbonGroup>
  );
};

export default WorkbookViewsGroup;