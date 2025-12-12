import React from 'react';
import { Link2, MessageSquare } from 'lucide-react';
import { RibbonGroup, RibbonButton, TabProps } from '../../shared';

const LinksCommentsGroup: React.FC<TabProps> = () => {
  return (
    <RibbonGroup label="Links & Comments">
        <div className="flex gap-1 h-full items-center">
           <RibbonButton variant="large" icon={<Link2 size={20} className="text-blue-600" />} label="Link" hasDropdown onClick={() => {}} />
           <RibbonButton variant="large" icon={<MessageSquare size={20} className="text-yellow-500" />} label="Comment" onClick={() => {}} />
        </div>
    </RibbonGroup>
  );
};

export default LinksCommentsGroup;