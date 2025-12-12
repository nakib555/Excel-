import React from 'react';
import { SpellCheck, Book, FileBarChart } from 'lucide-react';
import { RibbonGroup, RibbonButton, TabProps } from '../../shared';

const ProofingGroup: React.FC<TabProps> = () => {
  return (
    <RibbonGroup label="Proofing">
         <div className="flex items-center gap-1 h-full">
             <RibbonButton variant="large" icon={<SpellCheck size={20} className="text-blue-600" />} label="Spelling" onClick={() => {}} />
             <RibbonButton variant="large" icon={<Book size={20} className="text-orange-600" />} label="Thesaurus" onClick={() => {}} />
             <RibbonButton variant="large" icon={<FileBarChart size={20} className="text-green-600" />} label="Workbook" subLabel="Statistics" onClick={() => {}} />
         </div>
    </RibbonGroup>
  );
};

export default ProofingGroup;