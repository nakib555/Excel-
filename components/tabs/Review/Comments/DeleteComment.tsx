
import React from 'react';
import { MessageSquareX } from 'lucide-react';
import { RibbonButton } from '../../../shared';

interface DeleteCommentProps {
    onDeleteComment?: () => void;
}

const DeleteComment: React.FC<DeleteCommentProps> = ({ onDeleteComment }) => (
    <RibbonButton 
        variant="small" 
        icon={<MessageSquareX size={14} className="text-red-500" />} 
        label="Delete" 
        onClick={onDeleteComment || (() => {})} 
    />
);

export default DeleteComment;
