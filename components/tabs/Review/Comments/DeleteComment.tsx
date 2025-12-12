import React from 'react';
import { MessageSquareX } from 'lucide-react';
import { RibbonButton } from '../../../shared';

const DeleteComment = () => (
    <RibbonButton variant="small" icon={<MessageSquareX size={14} className="text-red-500" />} label="Delete" disabled onClick={() => {}} />
);

export default DeleteComment;