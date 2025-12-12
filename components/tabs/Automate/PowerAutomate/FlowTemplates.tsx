import React from 'react';
import { Workflow } from 'lucide-react';
import { RibbonButton } from '../../../shared';

const FlowTemplates = () => (
    <RibbonButton variant="large" icon={<Workflow size={20} className="text-blue-500" />} label="Flow" subLabel="Templates" disabled onClick={() => {}} />
);

export default FlowTemplates;