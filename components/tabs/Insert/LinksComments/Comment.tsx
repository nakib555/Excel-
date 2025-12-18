

import React from 'react';
import { MessageSquare } from 'lucide-react';
import { RibbonButton } from '../../shared';

interface CommentProps {
    onInsertComment?: () => void;
}

const Comment: React.FC<CommentProps> = ({ onInsertComment }) => (
    <RibbonButton variant="large" icon={<MessageSquare size={20} className="text-yellow-500" />} label="Comment" onClick={onInsertComment || (() => {})} />
);

export default Comment;