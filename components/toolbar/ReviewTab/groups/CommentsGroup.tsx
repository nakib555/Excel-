import React from 'react';
import { MessageSquarePlus, MessageSquareX, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import { RibbonGroup, RibbonButton, TabProps } from '../../shared';

const CommentsGroup: React.FC<TabProps> = () => {
  return (
    <RibbonGroup label="Comments">
         <div className="flex items-center gap-1 h-full">
             <RibbonButton variant="large" icon={<MessageSquarePlus size={20} className="text-green-600" />} label="New" subLabel="Comment" onClick={() => {}} />
             <div className="flex flex-col gap-0 justify-center">
                 <RibbonButton variant="small" icon={<MessageSquareX size={14} className="text-red-500" />} label="Delete" disabled onClick={() => {}} />
                 <RibbonButton variant="small" icon={<ChevronLeft size={14} className="text-slate-400" />} label="Previous Comment" disabled onClick={() => {}} />
                 <RibbonButton variant="small" icon={<ChevronRight size={14} className="text-slate-400" />} label="Next Comment" disabled onClick={() => {}} />
             </div>
             <RibbonButton variant="large" icon={<MessageSquare size={20} className="text-yellow-500" />} label="Show" subLabel="Comments" onClick={() => {}} />
         </div>
    </RibbonGroup>
  );
};

export default CommentsGroup;