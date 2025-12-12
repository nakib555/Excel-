import React from 'react';
import { MessageSquare } from 'lucide-react';
import { RibbonButton } from '../../shared';

const Comment = () => (
    <RibbonButton variant="large" icon={<MessageSquare size={20} className="text-yellow-500" />} label="Comment" onClick={() => {}} />
);

export default Comment;
