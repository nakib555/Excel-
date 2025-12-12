import React from 'react';
import { FileBarChart } from 'lucide-react';
import { RibbonButton } from '../../../shared';

const WorkbookStatistics = () => (
    <RibbonButton variant="large" icon={<FileBarChart size={20} className="text-green-600" />} label="Workbook" subLabel="Statistics" onClick={() => {}} />
);

export default WorkbookStatistics;