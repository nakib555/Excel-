import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { 
  SpellCheck, Book, FileBarChart, Gauge, Accessibility, Languages, 
  MessageSquarePlus, MessageSquareX, ChevronLeft, ChevronRight, MessageSquare, 
  Lock, UserCheck, PenTool 
} from 'lucide-react';
import { RibbonGroup, RibbonButton, TabProps } from '../shared';

const ReviewTab: React.FC<TabProps> = () => {
  return (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex h-full min-w-max gap-1"
    >
        <RibbonGroup label="Proofing">
             <div className="flex items-center gap-1 h-full">
                 <RibbonButton variant="large" icon={<SpellCheck size={20} />} label="Spelling" onClick={() => {}} />
                 <RibbonButton variant="large" icon={<Book size={20} />} label="Thesaurus" onClick={() => {}} />
                 <RibbonButton variant="large" icon={<FileBarChart size={20} />} label="Workbook" subLabel="Statistics" onClick={() => {}} />
             </div>
        </RibbonGroup>

        <RibbonGroup label="Performance">
             <RibbonButton variant="large" icon={<Gauge size={20} className="text-blue-500" />} label="Check" subLabel="Performance" onClick={() => {}} />
        </RibbonGroup>

        <RibbonGroup label="Accessibility">
             <RibbonButton variant="large" icon={<Accessibility size={20} />} label="Check" subLabel="Accessibility" hasDropdown onClick={() => {}} />
        </RibbonGroup>

        <RibbonGroup label="Language">
             <RibbonButton variant="large" icon={<Languages size={20} />} label="Translate" onClick={() => {}} />
        </RibbonGroup>
        
         <RibbonGroup label="Comments">
             <div className="flex items-center gap-1 h-full">
                 <RibbonButton variant="large" icon={<MessageSquarePlus size={20} />} label="New" subLabel="Comment" onClick={() => {}} />
                 <div className="flex flex-col gap-0 justify-center">
                     <RibbonButton variant="small" icon={<MessageSquareX size={14} />} label="Delete" disabled onClick={() => {}} />
                     <RibbonButton variant="small" icon={<ChevronLeft size={14} />} label="Previous Comment" disabled onClick={() => {}} />
                     <RibbonButton variant="small" icon={<ChevronRight size={14} />} label="Next Comment" disabled onClick={() => {}} />
                 </div>
                 <RibbonButton variant="large" icon={<MessageSquare size={20} />} label="Show" subLabel="Comments" onClick={() => {}} />
             </div>
        </RibbonGroup>

        <RibbonGroup label="Protect">
            <div className="flex items-center gap-1 h-full">
                <RibbonButton variant="large" icon={<Lock size={20} className="text-amber-500" />} label="Protect" subLabel="Sheet" onClick={() => {}} />
                <RibbonButton variant="large" icon={<Lock size={20} className="text-amber-500" />} label="Protect" subLabel="Workbook" onClick={() => {}} />
                <RibbonButton variant="large" icon={<UserCheck size={20} />} label="Allow Edit" subLabel="Ranges" onClick={() => {}} />
                <RibbonButton variant="large" icon={<UserCheck size={20} />} label="Unshare" subLabel="Workbook" disabled onClick={() => {}} />
            </div>
        </RibbonGroup>
        
         <RibbonGroup label="Ink">
             <RibbonButton variant="large" icon={<PenTool size={20} />} label="Hide" subLabel="Ink" hasDropdown onClick={() => {}} />
        </RibbonGroup>
    </motion.div>
  );
};

export default memo(ReviewTab);